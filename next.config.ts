import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/dashboard", destination: "/app", permanent: false },
      { source: "/dashboard/:path*", destination: "/app", permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/@:handle",
        destination: "/store/:handle",
      },
    ];
  },
  // Multiple lockfiles (e.g. in a parent folder) can make Turbopack pick the wrong root
  // and skip loading this project's `.env`. Pin the app root to the folder you run `next` from.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  // Webpack's persistent file cache lives under `.next/dev/cache/webpack`. On Windows,
  // cloud sync (e.g. OneDrive) can interrupt renames (ENOENT … 0.pack.gz_ → 0.pack.gz),
  // which surfaces as flaky "Internal Server Error" in dev. Memory-only cache avoids that.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
