import type { NextConfig } from "next";

// A fully static site: every route is rendered at build time and served from
// Cloudflare's edge as files. The only server code is the beta form endpoint
// in worker/, which runs outside Next.
const nextConfig: NextConfig = {
  output: "export",
  // Images are shipped pre-optimised (scripts/build-images.mjs), so no loader.
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // Pins every script file to its exact bytes (integrity attributes), the
    // static-site counterpart to nonces. Inline scripts are hashed into the CSP
    // by scripts/build-headers.mjs after the build.
    sri: { algorithm: "sha256" },
    // The stylesheet is ~15 KB: inlined, the first paint waits on no extra request.
    inlineCss: false,
  },
};

export default nextConfig;
