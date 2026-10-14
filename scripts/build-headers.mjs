// Writes out/_headers for Workers Static Assets after `next build`.
//
// A static export cannot use CSP nonces, so each page gets its own policy that
// allows exactly the inline scripts in that page, by hash. No 'unsafe-inline'
// and no 'unsafe-eval' for scripts anywhere. Styles keep 'unsafe-inline': the
// video player and React style attributes need it, and it cannot run code.
//
//   node scripts/build-headers.mjs            production
//   node scripts/build-headers.mjs --preview  adds noindex for the preview
import { createHash } from "node:crypto";
import { copyFileSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const OUT = "out";
const preview = process.argv.includes("--preview");

const directives = (scriptHashes) =>
  [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes.join(" ")} https://www.googletagmanager.com https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.clarity.ms https://*.clarity.ms`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://image.mux.com https://*.google-analytics.com https://*.googletagmanager.com https://*.clarity.ms https://c.bing.com https://nicklaunches.com",
    "font-src 'self'",
    "media-src 'self' blob: https://*.mux.com",
    "connect-src 'self' https://*.mux.com https://*.litix.io https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://cloudflareinsights.com https://*.clarity.ms",
    "worker-src 'self' blob:",
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* htmlFiles(path);
    else if (name.endsWith(".html")) yield path;
  }
}

/** The URL path a file is served at with html_handling "auto-trailing-slash". */
function route(file) {
  const rel = relative(OUT, file).replaceAll("\\", "/").replace(/\.html$/, "");
  if (rel === "index") return ["/"];
  if (rel.endsWith("/index")) return [`/${rel.slice(0, -6)}/`];
  return [`/${rel}`, `/${rel}.html`];
}

// On Windows the export writes nested route prefetch files one folder too deep
// (beta/__next.beta/__PAGE__.txt); the router asks for beta/__next.beta.__PAGE__.txt.
function flattenSegments(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (!statSync(path).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      for (const child of readdirSync(path)) copyFileSync(join(path, child), join(dir, `${name}.${child}`));
    } else flattenSegments(path);
  }
}
flattenSegments(OUT);

const rules = [];
for (const file of htmlFiles(OUT)) {
  const html = readFileSync(file, "utf8");
  const hashes = new Set();
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs) || !body) continue;
    const type = attrs.match(/\btype="([^"]+)"/)?.[1];
    if (type && type !== "module" && type !== "text/javascript") continue; // JSON-LD and other data blocks never run
    hashes.add(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }
  for (const path of route(file)) rules.push(`${path}\n  Content-Security-Policy: ${directives([...hashes])}`);
}

const common = [
  "Strict-Transport-Security: max-age=31536000; includeSubDomains",
  "X-Content-Type-Options: nosniff",
  "Referrer-Policy: strict-origin-when-cross-origin",
  "X-Frame-Options: DENY",
  "Cross-Origin-Opener-Policy: same-origin",
  "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  ...(preview ? ["X-Robots-Tag: noindex, nofollow"] : []),
];

const headers = [
  `/*\n${common.map((h) => `  ${h}`).join("\n")}`,
  // Content-hashed: safe to cache for a year.
  "/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable",
  "/img/*\n  Cache-Control: public, max-age=31536000, immutable",
  "/media/*\n  Cache-Control: public, max-age=604800, stale-while-revalidate=86400",
  "/icons/*\n  Cache-Control: public, max-age=604800, stale-while-revalidate=86400",
  "/brand/*\n  Cache-Control: public, max-age=604800, stale-while-revalidate=86400",
  ...rules,
].join("\n\n");

writeFileSync(join(OUT, "_headers"), `${headers}\n`);
console.log(`_headers: ${rules.length} page policies${preview ? " (preview, noindex)" : ""}`);
