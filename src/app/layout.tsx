import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AnimatedGradientBackground } from "@/components/effects/AnimatedGradientBackground";
import { NoiseOverlay } from "@/components/effects/NoiseOverlay";
import { ClientEffects } from "@/components/effects/ClientEffects";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
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
    default: "Phil G. · Lead UX/Product Designer · AI-Native",
    template: "%s · Phil G.",
  },
  description:
    "Lead UX/Product Designer · 20+ years shipping high-impact products for Walmart, VMware, Microsoft, SAP, and WWF. AI-Native, Prague-based, accepting 2026 enterprise engagements.",
  keywords: [
    "Phil G",
    "Lead UX Designer",
    "Product Designer",
    "AI-Native",
    "Enterprise UX",
    "Walmart",
    "VMware",
    "Microsoft",
    "SAP",
    "WWF",
    "Cemex",
    "Pivotal",
    "Azul Intelligence Cloud",
    "UX Master",
    "Sales Funnel Builder",
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
    title: "Phil G. · Lead UX/Product Designer · AI-Native",
    description:
      "20+ years shipping for Walmart, VMware, Microsoft, SAP, WWF. AI-Native enterprise design from Prague.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phil G. · Lead UX/Product Designer · AI-Native",
    description:
      "20+ years shipping for Walmart, VMware, Microsoft, SAP, WWF. AI-Native enterprise design from Prague.",
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
    <html lang="en" className={`${inter.variable} antialiased`}>
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
