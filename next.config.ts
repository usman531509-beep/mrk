import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack to this project. A stray package-lock.json in the home
  // folder otherwise makes it infer ~/ as the workspace root, which breaks
  // next/font/google resolution ("queries have exactly one entry").
  turbopack: {
    root: __dirname,
  },
  images: {
    // Allow next/image to optimise + edge-cache product photos served from
    // Supabase Storage. The wildcard covers both *.supabase.co (legacy) and
    // *.storage.supabase.co (current public-bucket host shape). Cloudinary
    // is no longer used; left out on purpose.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.storage.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Aggressive cache window so the same /image bytes don't get re-fetched
    // from Supabase Storage on every cold edge cache miss.
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
