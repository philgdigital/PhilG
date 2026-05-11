import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AnimatedGradientBackground } from "@/components/effects/AnimatedGradientBackground";
import { NoiseOverlay } from "@/components/effects/NoiseOverlay";
import { ClientEffects } from "@/components/effects/ClientEffects";
import { FormProvider } from "@/lib/form-context";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Phil G. · Senior UX/UI Product Design Leader · AI-Native",
    template: "%s · Phil G.",
  },
  description:
    "Senior Product Design Leader & Builder · 17+ years building products for Walmart, VMware, Microsoft, SAP, WWF, Cemex, Vodafone, Kuoni Tumlare. Product discovery, AI-native prototyping, design leadership, and production-ready code. Prague-based, accepting 2026 enterprise engagements.",
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
    "Pivotal",
    "Azul Intelligence Cloud",
    "Prague",
    "Design Mentorship",
  ],
  authors: [{ name: "Phil G." }],
  creator: "Phil G.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Phil G.",
    title: "Phil G. · Senior Product Design Leader & Builder · AI-Native",
    description:
      "17+ years building products for Walmart, VMware, Microsoft, SAP, WWF, Cemex, Vodafone, Kuoni Tumlare. Product discovery, AI-native prototyping, design leadership, and production-ready code.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phil G. · Senior Product Design Leader & Builder · AI-Native",
    description:
      "17+ years building products for Walmart, VMware, Microsoft, SAP, WWF, Cemex, Vodafone, Kuoni Tumlare. Product discovery, AI-native prototyping, design leadership, and production-ready code.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <AnimatedGradientBackground />
        {/* Global readability dim. A soft radial vignette: darkest in the
            center where text content sits, fading to fully transparent at
            the corners so the colorful AnimatedGradientBackground orbs
            stay visible. No visible edges, no flat opacity panel.
            blur-3xl makes the whole layer breathe softly into the page. */}
        <div
          aria-hidden
          className="fixed inset-0 -z-[1] pointer-events-none blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 75% 55% at 50% 50%, rgba(6,6,10,0.65) 0%, rgba(6,6,10,0.45) 35%, rgba(6,6,10,0.20) 65%, transparent 100%)",
          }}
        />
        <ClientEffects />
        <NoiseOverlay />
        {/* FormProvider wraps everything so any page (homepage, work
            case studies, insight articles) can open the same
            ProjectFormModal via useFormContext(). The modal itself is
            mounted inside the provider. */}
        <FormProvider>
          <div className="relative w-full h-full">{children}</div>
        </FormProvider>
        <Analytics />
      </body>
    </html>
  );
}
