import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // RSS feeds expose images from arbitrary CDNs, so allow remote https/http
    // images. Everything still goes through the Next.js image optimizer.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
