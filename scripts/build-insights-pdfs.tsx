/**
 * Insights PDF build step.
 *
 * Walks /content/insights/*.mdx (via the parsed data.json the
 * prebuild step already produced), renders each post to a styled
 * PDF using @react-pdf/renderer, and writes the result to
 * /public/pdf/{slug}.pdf.
 *
 * Runs in the prebuild chain after build-insights-data.mjs so the
 * data.json is fresh. The detail page's "Download PDF" button
 * links directly to /pdf/{slug}.pdf — a static asset, no runtime
 * cost.
 *
 * Why .tsx? @react-pdf/renderer uses React.createElement under the
 * hood, so writing it as JSX makes the layout legible. The script
 * is executed via `tsx` (which transpiles TS+JSX on the fly) — see
 * package.json scripts.
 *
 * Design:
 *   Page 1   — Cover: brand mark + category + title + excerpt +
 *              meta. The dramatic opener.
 *   Pages 2+ — Body: typography mirroring the website, every page
 *              carries a slim top banner inviting the reader to
 *              hire Phil for a project.
 *   Last     — Closing CTA spread: full-page hire pitch with
 *              contact + credentials.
 *
 * The PDF is portrait A4 with 56px outer margins. Body type is
 * Helvetica (PDF default; IBM Plex isn't bundled because shipping
 * a font file would add ~250kb per PDF and the design reads
 * cleanly in Helvetica's neutral grotesque).
 */

import fs from "node:fs";
import path from "node:path";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Link,
  Image,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";

// ---------------------------------------------------------------
// Types — mirror the runtime Insight shape (kept inline to avoid
// pulling in @/lib/insights/schema.ts which is TS-only and would
// require an additional config to run from this script).
// ---------------------------------------------------------------

type Insight = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  readTime: string;
  image: string;
  featured: boolean;
  body: string;
  href: string;
};

type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

// ---------------------------------------------------------------
// Tiny markdown parser. The insight bodies only use:
//   - ## headings
//   - paragraphs separated by blank lines
//   - > blockquotes (possibly multiline)
//   - - bullet lists
// Inline markdown (bold/italic/links/code) is collapsed to plain
// text for PDF — keeps the parser short and the design clean.
// ---------------------------------------------------------------

function stripInline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [label](url) → label
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold**
    .replace(/\*([^*]+)\*/g, "$1") // *italic*
    .replace(/`([^`]+)`/g, "$1"); // `code`
}

function parseMarkdown(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: stripInline(line.slice(3)) });
      i++;
    } else if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(stripInline(lines[i].trim().slice(2)));
        i++;
      }
      blocks.push({ type: "quote", text: quoteLines.join(" ") });
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(stripInline(lines[i].trim().slice(2)));
        i++;
      }
      blocks.push({ type: "list", items });
    } else if (line === "") {
      i++;
    } else {
      const paraLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== "") {
        paraLines.push(stripInline(lines[i].trim()));
        i++;
      }
      blocks.push({ type: "p", text: paraLines.join(" ") });
    }
  }
  return blocks;
}

// ---------------------------------------------------------------
// Style sheet. PDF "rems" are dimensionless points (1pt = 1/72 inch).
// A4 portrait = 595 x 842 pt.
// ---------------------------------------------------------------

/**
 * Dark editorial theme — matches the website. The "white" colour
 * key is used by titles and headings; it really means "the
 * brightest text on this theme".
 *
 * Tried a light variant for printability; user rejected. Keeping
 * the dark feel; people who want to print can use their PDF
 * reader's invert-colours or "fit to page (greyscale)" options.
 */
const COLORS = {
  bg: "#0a0a0c",
  text: "#e7e7ea",
  textMuted: "#a1a1aa",
  textVeryMuted: "#6f6f76",
  white: "#ffffff",
  blue: "#0f62fe",
  blueSoft: "#4589ff",
  emerald: "#10b981",
  hairline: "#27272a",
  accent: "#0f62fe",
};

const styles = StyleSheet.create({
  // PAGE — full-bleed dark background. Outer padding gives content
  // ~56pt safe area on each side.
  page: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontFamily: "Helvetica",
    fontSize: 11,
    // paddingTop dropped 88 → 56: the banner sits in the top
    // padding zone via absolute positioning; the previous 88pt
    // left a ~32pt void between the banner and the body content
    // that read as wasted space.
    paddingTop: 56,
    paddingBottom: 70,
    paddingHorizontal: 56,
  },

  // BANNER on top of every body page. Subtle integrated strip —
  // no fill, no shouty colour. Reads as editorial chrome rather
  // than a sales bar. Hairline rule along the bottom separates
  // it from the article body underneath. Skipped on cover +
  // closing pages.
  bannerStrip: {
    position: "absolute",
    // Pulled up 36 → 22 to match the tighter paddingTop so the
    // banner sits ~22pt from the top edge with ~28pt of breathing
    // room before body content starts.
    top: 22,
    left: 56,
    right: 56,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.hairline,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bannerLabel: {
    color: COLORS.textVeryMuted,
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 2.5,
  },
  bannerDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.blueSoft,
  },
  bannerName: {
    color: COLORS.text,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.5,
  },
  bannerContacts: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerContactLink: {
    color: COLORS.blueSoft,
    fontSize: 8,
    letterSpacing: 0.2,
    textDecoration: "none",
  },
  bannerSep: {
    color: COLORS.textVeryMuted,
    fontSize: 8,
  },

  // COVER PAGE
  // Layout (top to bottom):
  //   brand row  → hero image (~45% of page height) → brand-wash
  //   ribbon → eyebrow → title → excerpt → accent bar → meta
  coverWrap: {
    flex: 1,
    flexDirection: "column",
    gap: 24,
  },
  coverTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // ~43% of an A4 portrait minus padding ≈ 304pt tall (5% smaller
  // than the original 320pt — user feedback). Width fills the
  // page minus the 56pt horizontal padding.
  coverHero: {
    width: "100%",
    height: 304,
    objectFit: "cover",
    borderRadius: 8,
  },
  // Two flat blocks stacked horizontally fake an IBM-blue →
  // emerald gradient strip; react-pdf has no CSS gradient.
  coverHeroRibbon: {
    flexDirection: "row",
    height: 3,
    marginTop: -3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: "hidden",
  },
  coverHeroRibbonBlue: {
    flexGrow: 1,
    backgroundColor: COLORS.blue,
  },
  coverHeroRibbonEmerald: {
    flexGrow: 1,
    backgroundColor: COLORS.emerald,
  },
  brandWord: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.blue,
    marginLeft: 3,
    marginTop: 8,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.blue,
    color: COLORS.blueSoft,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 2,
  },
  coverCenter: {
    flexDirection: "column",
    gap: 18,
  },
  coverEyebrow: {
    color: COLORS.textVeryMuted,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 3,
  },
  coverTitle: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 42,
    letterSpacing: -1.2,
    lineHeight: 1.05,
  },
  coverExcerpt: {
    color: COLORS.textMuted,
    fontFamily: "Helvetica",
    fontSize: 14,
    lineHeight: 1.45,
    marginTop: 8,
  },
  coverMeta: {
    color: COLORS.textVeryMuted,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 2.5,
  },
  coverAccentBar: {
    height: 4,
    width: 60,
    backgroundColor: COLORS.blue,
    marginTop: 18,
  },

  // BODY TYPOGRAPHY
  bodyH2: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    letterSpacing: -0.4,
    marginTop: 24,
    marginBottom: 10,
  },
  bodyP: {
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 1.65,
    marginBottom: 12,
  },
  bodyQuoteWrap: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.blue,
  },
  bodyQuote: {
    color: COLORS.text,
    fontFamily: "Helvetica-Oblique",
    fontSize: 14,
    lineHeight: 1.4,
  },
  bodyListItemRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bodyListBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.blue,
    marginTop: 7,
    marginRight: 10,
  },
  bodyListText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 1.55,
  },

  // PAGE FOOTER on body pages
  pageFooter: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    color: COLORS.textVeryMuted,
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 2,
  },

  // CLOSING CTA PAGE
  ctaWrap: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    gap: 22,
  },
  ctaEyebrow: {
    color: COLORS.blueSoft,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 3,
  },
  ctaHeadline: {
    color: COLORS.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 44,
    letterSpacing: -1.5,
    lineHeight: 1.05,
  },
  ctaSubline: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 1.5,
    marginTop: 4,
    maxWidth: 380,
  },
  ctaContactBlock: {
    marginTop: 12,
    gap: 6,
  },
  ctaContactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaContactLabel: {
    color: COLORS.textVeryMuted,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 2,
    width: 70,
  },
  ctaContactValue: {
    color: COLORS.white,
    fontSize: 11,
  },
  ctaContactLink: {
    color: COLORS.blueSoft,
    fontSize: 11,
    textDecoration: "none",
  },
  ctaCredsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  ctaCredPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 0.5,
    borderColor: COLORS.hairline,
    color: COLORS.textMuted,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    letterSpacing: 1.5,
  },
});

// ---------------------------------------------------------------
// Components
// ---------------------------------------------------------------

/**
 * Top-of-page editorial chrome. Subtle (no fill, hairline rule)
 * so it reads as part of the design rather than a sales banner.
 * Left side: small IBM-blue dot + "PHIL G." wordmark.
 * Right side: email + LinkedIn — clickable in PDF readers that
 * honour <Link>. Hairline at the bottom separates from body.
 */
const Banner = () => (
  <View style={styles.bannerStrip} fixed>
    <View style={styles.bannerLeft}>
      <Text style={styles.bannerLabel}>HIRE</Text>
      <View style={styles.bannerDot} />
      <Text style={styles.bannerName}>PHIL G.</Text>
    </View>
    <View style={styles.bannerContacts}>
      <Link src="mailto:hello@philg.cz" style={styles.bannerContactLink}>
        hello@philg.cz
      </Link>
      <Text style={styles.bannerSep}>·</Text>
      <Link
        src="https://www.linkedin.com/in/felipeaela/"
        style={styles.bannerContactLink}
      >
        linkedin.com/in/felipeaela
      </Link>
    </View>
  </View>
);

const PageFooter = () => (
  <View style={styles.pageFooter} fixed>
    <Text>PHIL G. · UX/PRODUCT DESIGN LEADER</Text>
    <Text
      render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
        `${String(pageNumber).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`
      }
    />
  </View>
);

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Resolve a frontmatter image path (e.g. "/images/about.jpg") to
 * an absolute filesystem path that react-pdf's <Image> can load.
 * Falls back to the default about.jpg when the file is missing
 * so a busted frontmatter never crashes the build.
 */
function resolveCoverImage(image: string): string {
  const cwd = process.cwd();
  const direct = path.join(cwd, "public", image.replace(/^\/+/, ""));
  if (fs.existsSync(direct)) return direct;
  return path.join(cwd, "public", "images", "about.jpg");
}

const CoverPage = ({ insight }: { insight: Insight }) => {
  const coverImagePath = resolveCoverImage(insight.image);
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.coverWrap}>
        {/* Top row: brand wordmark left, category pill right */}
        <View style={styles.coverTopRow}>
          <View style={styles.brandRow}>
            <Text style={styles.brandWord}>PHIL G</Text>
            <View style={styles.brandDot} />
          </View>
          <Text style={styles.categoryPill}>
            {insight.category.toUpperCase()}
          </Text>
        </View>

        {/* HERO IMAGE — wide banner, ~45% of page height. */}
        <View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={coverImagePath} style={styles.coverHero} />
          {/* Brand-wash ribbon: IBM-blue → emerald, faked with two
              flat blocks since react-pdf doesn't do CSS gradient. */}
          <View style={styles.coverHeroRibbon}>
            <View style={styles.coverHeroRibbonBlue} />
            <View style={styles.coverHeroRibbonEmerald} />
          </View>
        </View>

        {/* Title block */}
        <View style={styles.coverCenter}>
          <Text style={styles.coverEyebrow}>INSIGHT</Text>
          <Text style={styles.coverTitle}>{insight.title}</Text>
          <Text style={styles.coverExcerpt}>{insight.excerpt}</Text>
          <View style={styles.coverAccentBar} />
        </View>

        {/* Meta — date · read time, mono, muted */}
        <Text style={styles.coverMeta}>
          {formatDate(insight.date).toUpperCase()} ·{" "}
          {insight.readTime.toUpperCase()}
        </Text>
      </View>
    </Page>
  );
};

const BodyPage = ({ blocks }: { blocks: Block[] }) => (
  <Page size="A4" style={styles.page}>
    <Banner />
    {blocks.map((block, i) => {
      if (block.type === "h2") {
        return (
          <Text key={i} style={styles.bodyH2} wrap={false}>
            {block.text}
          </Text>
        );
      }
      if (block.type === "p") {
        return (
          <Text key={i} style={styles.bodyP}>
            {block.text}
          </Text>
        );
      }
      if (block.type === "quote") {
        return (
          <View key={i} style={styles.bodyQuoteWrap} wrap={false}>
            <Text style={styles.bodyQuote}>{block.text}</Text>
          </View>
        );
      }
      if (block.type === "list") {
        return (
          <View key={i} wrap>
            {block.items.map((item, j) => (
              <View key={j} style={styles.bodyListItemRow}>
                <View style={styles.bodyListBullet} />
                <Text style={styles.bodyListText}>{item}</Text>
              </View>
            ))}
          </View>
        );
      }
      return null;
    })}
    <PageFooter />
  </Page>
);

// Closing CTA page intentionally has NO top Banner — the page
// itself IS the hire pitch ("Hire Phil G. for your next product.")
// so a banner repeating the same invitation reads as noise. The
// page-number footer stays so the visitor knows it's the end.
const ClosingCtaPage = () => (
  <Page size="A4" style={styles.page}>
    <View style={styles.ctaWrap}>
      <Text style={styles.ctaEyebrow}>BUILT TO SHIP — NOT TO PITCH</Text>
      <Text style={styles.ctaHeadline}>Hire Phil G. for your next product.</Text>
      <Text style={styles.ctaSubline}>
        Embedded senior product designer + builder. Discovery, AI-native
        prototyping, design leadership, design systems, production-grade React.
        Prague-based, available for 2026 enterprise engagements.
      </Text>

      <View style={styles.ctaContactBlock}>
        <View style={styles.ctaContactRow}>
          <Text style={styles.ctaContactLabel}>EMAIL</Text>
          <Link src="mailto:hello@philg.cz" style={styles.ctaContactLink}>
            hello@philg.cz
          </Link>
        </View>
        <View style={styles.ctaContactRow}>
          <Text style={styles.ctaContactLabel}>LINKEDIN</Text>
          <Link
            src="https://www.linkedin.com/in/felipeaela/"
            style={styles.ctaContactLink}
          >
            linkedin.com/in/felipeaela
          </Link>
        </View>
        <View style={styles.ctaContactRow}>
          <Text style={styles.ctaContactLabel}>WEB</Text>
          <Link src="https://philg.cz" style={styles.ctaContactLink}>
            philg.cz
          </Link>
        </View>
        <View style={styles.ctaContactRow}>
          <Text style={styles.ctaContactLabel}>BASED IN</Text>
          <Text style={styles.ctaContactValue}>Prague, Czechia</Text>
        </View>
      </View>

      <View style={styles.ctaCredsRow}>
        <Text style={styles.ctaCredPill}>17+ YEARS</Text>
        <Text style={styles.ctaCredPill}>NN/g UX MASTER</Text>
        <Text style={styles.ctaCredPill}>IDEO CREATIVE LEADERSHIP</Text>
        <Text style={styles.ctaCredPill}>IBM DESIGN THINKING</Text>
        <Text style={styles.ctaCredPill}>1,050+ MENTEES</Text>
      </View>
    </View>
    <PageFooter />
  </Page>
);

const InsightDocument = ({ insight, blocks }: { insight: Insight; blocks: Block[] }) => (
  <Document
    author="Phil G."
    title={insight.title}
    subject={insight.excerpt}
    keywords={insight.category}
    creator="philg.cz"
    producer="philg.cz"
  >
    <CoverPage insight={insight} />
    <BodyPage blocks={blocks} />
    <ClosingCtaPage />
  </Document>
);

// ---------------------------------------------------------------
// Main — read data.json, render one PDF per insight.
// ---------------------------------------------------------------

async function main() {
  const root = process.cwd();
  const dataPath = path.join(root, "src", "lib", "insights", "data.json");
  const outDir = path.join(root, "public", "pdf");

  if (!fs.existsSync(dataPath)) {
    console.warn(
      "[build-insights-pdfs] data.json not found — run prebuild step first. Skipping.",
    );
    return;
  }

  const insights: Insight[] = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  fs.mkdirSync(outDir, { recursive: true });

  for (const insight of insights) {
    const blocks = parseMarkdown(insight.body);
    const doc = <InsightDocument insight={insight} blocks={blocks} />;
    const buffer = await pdf(doc).toBuffer();
    // toBuffer returns a Node Readable stream in some versions of
    // @react-pdf/renderer; normalize to a Buffer.
    const out = path.join(outDir, `${insight.slug}.pdf`);
    if (Buffer.isBuffer(buffer)) {
      fs.writeFileSync(out, buffer);
    } else {
      // Stream-style: drain to file.
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        (buffer as unknown as NodeJS.ReadableStream)
          .on("data", (chunk: Buffer | string) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          })
          .on("end", () => {
            fs.writeFileSync(out, Buffer.concat(chunks));
            resolve();
          })
          .on("error", reject);
      });
    }
    console.log(
      `[build-insights-pdfs] wrote ${path.relative(root, out)} (${blocks.length} blocks)`,
    );
  }
}

main().catch((err) => {
  console.error("[build-insights-pdfs] failed:", err);
  process.exit(1);
});

// react-pdf requires Font.register to be safe on Helvetica which is
// the default — explicit no-op so TypeScript treats Font as used.
void Font;
