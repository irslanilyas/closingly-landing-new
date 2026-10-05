import localFont from "next/font/local";

// Subset by scripts/build-fonts.py. Next preloads them, serves them with
// immutable caching and generates size-adjusted local fallbacks, so text never
// shifts when the web font arrives.
export const generalSans = localFont({
  src: [
    { path: "../fonts/general-sans-regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/general-sans-medium.woff2", weight: "500 700", style: "normal" },
    { path: "../fonts/general-sans-italic.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

// A handful of small labels only (badge numbers, arrows, initials, scope labels).
// 4 KB, and two of its labels sit in the header and hero, so it preloads too.
export const dmSans = localFont({
  src: "../fonts/dm-sans-labels.woff2",
  weight: "400 500",
  variable: "--font-label",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});
