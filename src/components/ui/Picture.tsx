import type { CSSProperties } from "react";
import { IMAGES, type ImageName } from "@/generated/images";

type Props = {
  name: ImageName;
  /** The rendered width, as a sizes attribute. */
  sizes: string;
  /** A different crop for phones (max-width: 767px). */
  mobile?: { name: ImageName; sizes: string };
  alt?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
};

const PHONE = "(max-width: 767px)";

/** An AVIF/WebP image from scripts/build-images.mjs. Lazy unless it is the page's lead image. */
export function Picture({ name, sizes, mobile, alt = "", className, style, priority = false }: Props) {
  const img = IMAGES[name];
  const phone = mobile && IMAGES[mobile.name];
  return (
    <picture>
      {phone && <source media={PHONE} type="image/avif" srcSet={phone.avif} sizes={mobile.sizes} />}
      {phone && <source media={PHONE} type="image/webp" srcSet={phone.webp} sizes={mobile.sizes} />}
      <source type="image/avif" srcSet={img.avif} sizes={sizes} />
      <source type="image/webp" srcSet={img.webp} sizes={sizes} />
      <img
        className={className}
        style={style}
        src={img.src}
        alt={alt}
        width={img.width}
        height={img.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        draggable={false}
      />
    </picture>
  );
}
