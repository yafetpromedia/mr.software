import type { NextConfig } from "next";
import os from "os";
import path from "path";

const webpackCacheDir = path.join(process.cwd(), "node_modules/.cache/webpack");
/** OneDrive sync corrupts `.next` chunks during dev — keep build output under node_modules. */
const devDistDir = "node_modules/.cache/next-dev";

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "development" ? devDistDir : ".next",
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{ kebabCase member }}",
    },
  },
  serverExternalPackages: ["bcrypt", "@aws-sdk/client-s3"],
  transpilePackages: ["three", "three-globe"],
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
      { source: "/app/builder", destination: "/app/ai/blueprint", permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/@:handle",
        destination: "/store/:handle",
      },
      {
        source: "/brand/uploads/:path*",
        destination: "/api/site-assets/:path*",
      },
    ];
  },
  // Multiple lockfiles (e.g. in a parent folder) can make Turbopack pick the wrong root
  // and skip loading this project's `.env`. Pin the app root to the folder you run `next` from.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  // OneDrive can break webpack cache under `.next`. Store cache in OS temp instead.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = {
        type: "filesystem",
        cacheDirectory: webpackCacheDir,
        buildDependencies: {
          config: [path.join(process.cwd(), "next.config.ts")],
        },
      };
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
