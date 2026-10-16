import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// The four URLs Search Console already knows; keep them stable.
// lastModified is the day each page's content last really changed: bump it by hand when it does.
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly", lastModified: string) => ({
    url: `${SITE.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly", "2026-10-14"),
    page("/beta", 0.8, "monthly", "2026-10-05"),
    page("/privacy", 0.3, "yearly", "2026-10-05"),
    page("/terms", 0.3, "yearly", "2026-10-01"),
  ];
}
