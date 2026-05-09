import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AnimatedGradientBackground } from "@/components/effects/AnimatedGradientBackground";
import { NoiseOverlay } from "@/components/effects/NoiseOverlay";
import { ClientEffects } from "@/components/effects/ClientEffects";
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
    "Senior UX/UI Product Design Leader · 17+ years driving digital transformation for Walmart, VMware, Microsoft, SAP, WWF, Cemex, Vodafone, and Kuoni Tumlare. Product discovery, AI-native prototyping, and design leadership at scale. Prague-based, accepting 2026 enterprise engagements.",
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
    title: "Phil G. · Senior UX/UI Product Design Leader · AI-Native",
    description:
      "17+ years driving digital transformation for Walmart, VMware, Microsoft, SAP, WWF, Cemex, Vodafone, Kuoni Tumlare. Product discovery, AI-native prototyping, design leadership at scale.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phil G. · Senior UX/UI Product Design Leader · AI-Native",
    description:
      "17+ years driving digital transformation for Walmart, VMware, Microsoft, SAP, WWF, Cemex, Vodafone, Kuoni Tumlare. Product discovery, AI-native prototyping, design leadership at scale.",
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
        <ClientEffects />
        <NoiseOverlay />
        <div className="relative w-full h-full">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
