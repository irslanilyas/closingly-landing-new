import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Arrival } from "@/components/layout/Arrival";
import { PageMotion } from "@/components/layout/PageMotion";
import { ScrollMemory } from "@/components/layout/ScrollMemory";
import { dmSans, generalSans } from "./fonts";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  robots: { index: true, follow: true, "max-image-preview": "large" },
  icons: {
    icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdfefb",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${generalSans.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <Arrival />
        <PageMotion />
        <ScrollMemory />
        {/* Consent defaults, the cookie notice and GA4 (which itself loads late; see the file). */}
        <Script src="/analytics.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
