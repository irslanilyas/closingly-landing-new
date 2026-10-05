import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// The four URLs Search Console already knows; keep them stable.
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly") => ({
    url: `${SITE.url}${path}`,
    lastModified: "2026-10-05",
    changeFrequency,
    priority,
  });
  return [page("/", 1, "weekly"), page("/beta", 0.8, "monthly"), page("/privacy", 0.3, "yearly"), page("/terms", 0.3, "yearly")];
}
