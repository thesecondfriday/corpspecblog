import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { dataset, projectId } from "./client";

/*
 * Responsive image URLs.
 *
 * The design fixes an aspect ratio for every image well (§3.1, §4.3) and relies
 * on `object-fit: cover` plus Sanity's hotspot to decide what survives the crop.
 * So these helpers always request an explicit width and let the ratio come from
 * CSS — never the other way round.
 */

const builder = createImageUrlBuilder({ projectId, dataset });

/*
 * The GROQ projections flatten an image to `{src, alt, hotspot, …}` for the
 * components' benefit, which loses the `asset` reference the URL builder needs.
 * `assetId` is projected alongside precisely so it can be handed back here.
 */
function toSource(source: ImageLike): SanityImageSource {
  if (typeof source === "string") return source;
  if ("assetId" in source && source.assetId) {
    return {
      _type: "image",
      asset: { _type: "reference", _ref: source.assetId },
      ...(source.hotspot ? { hotspot: source.hotspot } : {}),
      ...(source.crop ? { crop: source.crop } : {}),
    } as SanityImageSource;
  }
  return source as SanityImageSource;
}

type ImageLike =
  | string
  | (SanityImageSource & {
      assetId?: string;
      hotspot?: unknown;
      crop?: unknown;
      asset?: { metadata?: { lqip?: string; dimensions?: { width: number; height: number } } };
    });

export function urlFor(source: ImageLike) {
  return builder.image(toSource(source)).auto("format").fit("max");
}

/** The widths a card, hero or body image is actually rendered at. */
const WIDTHS = [400, 640, 800, 1200, 1600, 2000];

export interface ResponsiveImage {
  src: string;
  srcset: string;
  /** Sanity's LQIP — a tiny inlined blur, used as the well's background. */
  lqip?: string;
  width?: number;
  height?: number;
}

/**
 * Builds a srcset for an image well of a known aspect ratio.
 * `ratio` is width/height, e.g. 3/2. Omit it to serve the source ratio.
 */
export function responsive(
  source: ImageLike & { lqip?: string; dimensions?: { width: number; height: number } },
  { ratio, max = 1600 }: { ratio?: number; max?: number } = {},
): ResponsiveImage {
  const widths = WIDTHS.filter((w) => w <= max);
  if (widths.at(-1) !== max) widths.push(max);

  const at = (width: number) => {
    let url = urlFor(source).width(width);
    if (ratio) url = url.height(Math.round(width / ratio)).fit("crop");
    return url.url();
  };

  return {
    src: at(max),
    srcset: widths.map((w) => `${at(w)} ${w}w`).join(", "),
    // The projection flattens metadata up a level; fall back to the raw shape.
    lqip: source.lqip ?? source.asset?.metadata?.lqip,
    width: max,
    height: ratio
      ? Math.round(max / ratio)
      : (source.dimensions?.height ?? source.asset?.metadata?.dimensions?.height),
  };
}

/** The `sizes` attribute for each place an image appears. */
export const SIZES = {
  /** Feed and related cards: 3 up on desktop, 2 on tablet, 1 on mobile. */
  card: "(min-width: 900px) 33vw, (min-width: 600px) 50vw, 100vw",
  /** The index hero image: half the viewport on desktop, full below. */
  heroSplit: "(min-width: 900px) 50vw, 100vw",
  /** Full-bleed article hero. */
  hero: "100vw",
  /** Inside the article measure. */
  body: "(min-width: 900px) 720px, 100vw",
  /** Half the measure, for the two-up pair. */
  bodyHalf: "(min-width: 900px) 360px, 50vw",
  /** The square product well. */
  product: "(min-width: 600px) 320px, 100vw",
} as const;
