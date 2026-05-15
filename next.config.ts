import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Allow `next/image` to optimize hero images uploaded to Vercel
    // Blob by the admin (saveImageFile in src/lib/admin/insights-fs.ts).
    // Every Blob store gets a subdomain of the form
    // `{store-id}.public.blob.vercel-storage.com` — wildcarding the
    // store id keeps this stable across blob-store recreation.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
