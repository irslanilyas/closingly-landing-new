// Builds every raster image the site ships from the originals in assets-src/images:
// AVIF and WebP at the widths each image is actually displayed at, content-hashed
// so they can be cached forever, plus a typed manifest for the <Picture> component.
//
//   node scripts/build-images.mjs
//
// Job options
//   widths   output widths in px (never upscaled past the source or crop)
//   crop     [left, top, width, height] in source pixels, taken before resizing
//   blur     a CSS blur() radius in display px, baked in so the browser never filters
//            at runtime; `display` is the rendered width that radius refers to
//   radius   rounded corners in display px, applied before the blur (soft edges)
//   box      [width, height] display box: crop to its aspect first, like object-fit: cover
//   inside   blur within the frame (edges clamp) instead of spreading past it
//   wash     a white overlay of this opacity, baked in (a frosted pane over the photo)
//   quality  { avif, webp }
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const SRC = "assets-src/images";
const OUT = "public/img";
const MANIFEST = "src/generated/images.ts";

/** @type {Record<string, {src: string, widths: number[], crop?: number[], box?: number[], blur?: number, inside?: boolean, wash?: number, radius?: number, display?: number, quality?: {avif?: number, webp?: number}}>} */
const jobs = {
  // Showcase backgrounds: the art stage is 637 CSS px wide.
  showcaseDeal: { src: "showcase-deal.webp", widths: [640, 820] },
  showcaseProposal: { src: "showcase-proposal.webp", widths: [640, 1122] },
  showcaseTracking: { src: "showcase-tracking.webp", widths: [640, 1122] },
  showcaseFollowUp: { src: "showcase-follow-up.webp", widths: [640, 1122] },
  showcaseScope: { src: "showcase-scope.webp", widths: [640, 1122] },
  showcaseAsk: { src: "showcase-ask.webp", widths: [640, 1122] },
  // Proposals: two pages behind the transcript card, softly out of focus.
  proposalPageBack: { src: "proposal-page-a.webp", widths: [300, 574], blur: 3.807, display: 287.27 },
  proposalPageFront: { src: "proposal-page-b.webp", widths: [340, 672], blur: 3.807, radius: 10.084, display: 335.43 },
  // Tracking: the same two pages as thumbnails in the engagement card.
  proposalThumbBack: { src: "proposal-page-a.webp", widths: [144] },
  proposalThumbFront: { src: "proposal-page-b.webp", widths: [170] },
  // Client logos, cropped from one sheet of brand marks.
  logoAcme: { src: "client-logos.webp", crop: [388.6, 59.1, 120.2, 136.2], widths: [110] },
  logoAster: { src: "client-logos.webp", crop: [690.2, 269.9, 102.4, 139.3], widths: [96] },
  // How it works: the card photos sit behind frosted glass (blur 4.5px, 20% white).
  howCall: { src: "how-call.webp", widths: [420, 640], box: [419, 487], blur: 4.5, inside: true, wash: 0.2 },
  howDeal: { src: "how-deal.webp", widths: [420, 640], box: [419, 487], blur: 4.5, inside: true, wash: 0.2 },
  callHost: { src: "call-host.webp", widths: [580] },
  callClient: { src: "call-client.webp", widths: [348] },
  foundingBeta: { src: "founding-beta.webp", widths: [800, 1280, 1672] },
  foundingBetaMobile: { src: "founding-beta-mobile.webp", widths: [400, 793] },
  nextMove: { src: "next-move.webp", widths: [800, 1448] },
  // The audience ticker: twenty portraits, 223px square on desktop.
  ...Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => {
      const n = String(i + 1).padStart(2, "0");
      return [`portrait${n}`, { src: `audience/portrait-${n}.webp`, widths: [224, 448] }];
    }),
  ),
};

const manifest = {};
rmSync(OUT, { recursive: true, force: true });

for (const [name, job] of Object.entries(jobs)) {
  let base = sharp(join(SRC, job.src));
  if (job.crop) {
    const [left, top, width, height] = job.crop.map(Math.round);
    base = sharp(await base.extract({ left, top, width, height }).toBuffer());
  }
  if (job.box) {
    const m = await base.metadata();
    const [bw, bh] = job.box;
    const scale = Math.max(bw / m.width, bh / m.height);
    const w = Math.round(bw / scale), h = Math.round(bh / scale);
    base = sharp(await base.extract({ left: Math.round((m.width - w) / 2), top: Math.round((m.height - h) / 2), width: w, height: h }).toBuffer());
  }
  const meta = await base.metadata();
  const outputs = [];
  for (const width of [...new Set(job.widths.map((w) => Math.min(w, meta.width)))]) {
    let img = sharp(await base.clone().resize({ width }).toBuffer());
    const height = Math.round((meta.height * width) / meta.width);
    const scale = width / (job.display ?? job.box?.[0] ?? width);
    if (job.radius) {
      const r = job.radius * scale;
      const mask = Buffer.from(`<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${r}" ry="${r}"/></svg>`);
      img = sharp(await img.composite([{ input: mask, blend: "dest-in" }]).png().toBuffer());
    }
    let pad = 0;
    if (job.blur && job.inside) {
      img = sharp(await img.blur(job.blur * scale).png().toBuffer());
    } else if (job.blur) {
      // CSS blur(r) is a Gaussian with sigma r; it spreads ~3 sigma past the edge.
      const sigma = job.blur * scale;
      pad = Math.ceil(sigma * 3);
      img = sharp(
        await img
          .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .blur(sigma)
          .png()
          .toBuffer(),
      );
    }
    if (job.wash) {
      const pane = Buffer.from(`<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="#fff" fill-opacity="${job.wash}"/></svg>`);
      img = sharp(await img.composite([{ input: pane }]).png().toBuffer());
    }
    const buf = await img.png().toBuffer();
    const hash = createHash("sha256").update(buf).digest("hex").slice(0, 10);
    const stem = `${name}.${hash}-${width}`;
    const q = { avif: 55, webp: 78, ...job.quality };
    mkdirSync(OUT, { recursive: true });
    await sharp(buf).avif({ quality: q.avif, effort: 7 }).toFile(join(OUT, `${stem}.avif`));
    await sharp(buf).webp({ quality: q.webp, effort: 6, alphaQuality: 90 }).toFile(join(OUT, `${stem}.webp`));
    outputs.push({ width, height, pad, stem, bleed: pad / scale });
  }
  const last = outputs.at(-1);
  manifest[name] = {
    avif: outputs.map((o) => `/img/${o.stem}.avif ${o.width + 2 * o.pad}w`).join(", "),
    webp: outputs.map((o) => `/img/${o.stem}.webp ${o.width + 2 * o.pad}w`).join(", "),
    src: `/img/${last.stem}.webp`,
    width: last.width + 2 * last.pad,
    height: last.height + 2 * last.pad,
    /** Display px the baked blur spreads past the image on each side. */
    bleed: Math.round(last.bleed * 100) / 100,
  };
}

mkdirSync(dirname(MANIFEST), { recursive: true });
writeFileSync(
  MANIFEST,
  `// Generated by scripts/build-images.mjs. Do not edit.\nexport const IMAGES = ${JSON.stringify(manifest, null, 2)} as const;\n\nexport type ImageName = keyof typeof IMAGES;\n`,
);
const files = readdirSync(OUT);
console.log(`${Object.keys(manifest).length} images, ${files.length} files in ${OUT}`);
