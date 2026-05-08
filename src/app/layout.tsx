import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
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
    default: "Phil G. — Architecting Enterprise Velocity",
    template: "%s — Phil G.",
  },
  description:
    "Phil G. is an Enterprise Product Lead merging deep user psychology with Generative AI prototyping to scale top-tier software 10x faster.",
  keywords: [
    "Phil G",
    "Enterprise Product Design",
    "AI Prototyping",
    "Frontend Architecture",
    "Product Strategy",
    "UX Architecture",
  ],
  authors: [{ name: "Phil G." }],
  creator: "Phil G.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Phil G.",
    title: "Phil G. — Architecting Enterprise Velocity",
    description:
      "Enterprise Product Lead merging deep user psychology with Generative AI prototyping to scale top-tier software 10x faster.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phil G. — Architecting Enterprise Velocity",
    description:
      "Enterprise Product Lead merging deep user psychology with Generative AI prototyping to scale top-tier software 10x faster.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#030305",
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
      <body className="selection:bg-indigo-500 selection:text-white">
        <AnimatedGradientBackground />
        <ClientEffects />
        <NoiseOverlay />
        <div className="relative w-full h-full">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
