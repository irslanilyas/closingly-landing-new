import type { Metadata } from "next";
import { SITE } from "./site";

type PageMeta = { path: string; title: string; description: string; socialTitle?: string; socialDescription?: string };

/** Per-page metadata. Next merges nested objects shallowly, so every page restates the shared social fields. */
export function pageMetadata({ path, title, description, socialTitle, socialDescription }: PageMeta): Metadata {
  const ogTitle = socialTitle ?? title;
  const ogDescription = socialDescription ?? description;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      url: path,
      title: ogTitle,
      description: ogDescription,
      images: [
        {
          url: SITE.ogImage,
          width: 1200,
          height: 630,
          alt: "Closingly, the AI revenue OS for service businesses. Turn conversations into revenue.",
        },
      ],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: ogDescription, images: [SITE.ogImage] },
  };
}
