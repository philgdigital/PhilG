import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AnimatedGradientBackground } from "@/components/effects/AnimatedGradientBackground";
import { NoiseOverlay } from "@/components/effects/NoiseOverlay";
import { ClientEffects } from "@/components/effects/ClientEffects";
import { InitialLoader } from "@/components/effects/InitialLoader";
import { FormProvider } from "@/lib/form-context";
import { FooterMount } from "@/components/FooterMount";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

/**
 * Indexing gate. Mirrors the check in robots.ts + sitemap.ts:
 * only the genuine Vercel production deployment emits indexable
 * metadata. Previews + local dev get a hard noindex/nofollow so
 * search engines and LLM crawlers can't index a *.vercel.app URL
 * and cause duplicate-content issues at launch.
 */
const isProduction = process.env.VERCEL_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Phil G. · UX/Product Design Leader · AI-Native",
    template: "%s · Phil G.",
  },
  description:
    "UX/Product Design Leader · 17+ years building products for Walmart, VMware, Pivotal Labs, Microsoft, SAP, WWF, Cemex, Vodafone, Kuoni Tumlare. Product discovery, AI-native prototyping, design leadership, and production-ready code. Prague-based, accepting 2026 enterprise engagements.",
  keywords: [
    "Phil G",
    "Senior UX Designer",
    "Product Design Leader",
    "Design Leadership",
    "Product Discovery",
    "AI-Native Prototyping",
    "Design Systems",
    "Enterprise UX",
    "NN/G UX Master",
    "IDEO Creative Leadership",
    "IBM Enterprise Design Thinking",
    "Walmart",
    "VMware",
    "Microsoft",
    "SAP",
    "WWF",
    "Cemex",
    "Vodafone",
    "Kuoni Tumlare",
    "Royal Air Force",
    "Pivotal Labs",
    "Pivotal",
    "Azul Intelligence Cloud",
    "Prague",
    "Design Mentorship",
  ],
  authors: [{ name: "Phil G.", url: siteUrl }],
  creator: "Phil G.",
  publisher: "Phil G.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Phil G.",
    title: "Phil G. · UX/Product Design Leader · AI-Native",
    description:
      "17+ years building products for Walmart, VMware, Pivotal Labs, Microsoft, SAP, WWF, Cemex, Vodafone, Kuoni Tumlare. Product discovery, AI-native prototyping, design leadership, and production-ready code.",
    // /opengraph-image.tsx is a Next.js Edge-runtime route that
    // generates the social card on demand. Listing it explicitly
    // with width/height/alt lets crawlers serve it directly
    // without first having to inspect the response.
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Phil G. - UX/Product Design Leader. Prague-based, AI-native, 17+ years.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phil G. · UX/Product Design Leader · AI-Native",
    description:
      "17+ years building products for Walmart, VMware, Pivotal Labs, Microsoft, SAP, WWF, Cemex, Vodafone, Kuoni Tumlare. Product discovery, AI-native prototyping, design leadership, and production-ready code.",
    images: [
      {
        url: "/opengraph-image",
        alt: "Phil G. - UX/Product Design Leader.",
      },
    ],
    creator: "@philg",
  },
  // Favicons. SVG-only: the new abstract orbital-sphere icon at
  // src/app/icon.svg is the single canonical favicon. The Next.js-
  // default favicon.ico was deleted because it took precedence
  // over the SVG in Chrome/Edge and made the new icon never load.
  // All modern browsers (Chrome, Firefox, Safari, Edge - 95%+ of
  // traffic) render SVG favicons natively; legacy IE11 / very old
  // Android Browser fall back to no icon, acceptable for this
  // audience.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
  robots: isProduction
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : {
        // Preview / local: hard noindex. Mirrors the Disallow:/ in
        // robots.ts. nocache + noimageindex + max-snippet:0 belt-
        // and-suspender against any crawler that ignores the
        // primary index:false.
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
          "max-snippet": 0,
          "max-image-preview": "none",
        },
      },
  category: "Design",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} antialiased`}
    >
      <body className="selection:bg-[#0f62fe] selection:text-white">
        {/* InitialLoader rendered FIRST in the body so its overlay is
            in the very first server-painted frame. Without this the
            visitor briefly saw page content before the dynamic-imported
            client component mounted. The component itself is a Client
            Component but Next.js still SSRs its markup, so the orbital
            ring composition + Prague map paths are present on first
            byte; client-side hydration takes over the readiness gates
            and the cycling brand reel. */}
        <InitialLoader />
        <AnimatedGradientBackground />
        {/* Global readability dim removed. The AnimatedGradientBackground's
            own base flatten (~10%) + Carbon Black foundation give body
            text enough contrast on its own, and each section that needs
            extra calm (Work, Aphorism, data-tonal=lift) applies its own
            local darkening. The previous radial vignette was double-
            dimming the Hero center where the giant headline sits,
            killing color impact. */}
        <ClientEffects />
        <NoiseOverlay />
        {/* FormProvider wraps everything so any page (homepage, work
            case studies, insight articles, insights archive) can open
            the same ProjectFormModal via useFormContext(). The modal
            itself is mounted inside the provider. FooterMount sits
            INSIDE the provider so it can consume the openForm
            callback for its CTA. Mounting the footer here (rather
            than per-page) means it appears on every route. */}
        <FormProvider>
          <div className="relative w-full h-full">{children}</div>
          <FooterMount />
        </FormProvider>
        <Analytics />
      </body>
    </html>
  );
}
