import type { SanityClient } from "@sanity/client";
import { defineQuery } from "groq";
import { client } from "./client";
import type { Author, Category, Post, Tag } from "../../lib/types";

/*
 * The content seam. Pages import from here and nowhere else.
 *
 * The projections do the shape adaptation the field inventory called out, so
 * components keep the flat shapes they were built against:
 *
 *   slug {current}        → a plain string
 *   image asset ref       → { src, alt, hotspot, lqip, ... }
 *   rows[]{cells[]}       → string[][]                        (Flag 11)
 *   highlightRow 1-based  → 0-based                           (editor-facing vs code)
 *   file asset            → a URL string                      (§4.7)
 *
 * Portable Text is NOT flattened — that stays as-is and is rendered by
 * astro-portabletext (Flags 9, 10, 12).
 */

/* ---- Fragments ----------------------------------------------------------- */

/** Everything an <img> and its well need, including the blur placeholder. */
const IMAGE = /* groq */ `{
  "src": asset->url,
  "assetId": asset->_id,
  alt,
  caption,
  credit,
  hotspot,
  crop,
  "lqip": asset->metadata.lqip,
  "dimensions": asset->metadata.dimensions
}`;

const CATEGORY = /* groq */ `{
  title,
  "slug": slug.current,
  description,
  order
}`;

const AUTHOR = /* groq */ `{
  name,
  "slug": slug.current,
  role,
  bio,
  "avatar": avatar${IMAGE},
  links[]{ _key, label, url },
  "postCount": count(*[_type == "post" && author._ref == ^._id])
}`;

const TAG = /* groq */ `{ title, "slug": slug.current }`;

/**
 * Body blocks. Plain `block` and `list` items pass through untouched for
 * astro-portabletext; the §4 object blocks get their references resolved and
 * their Sanity-shaped fields flattened.
 */
const BODY = /* groq */ `body[]{
  ...,
  _type == "inlineImage" => {
    ...,
    "src": asset->url,
    "lqip": asset->metadata.lqip,
    "dimensions": asset->metadata.dimensions
  },
  _type == "imagePair" => {
    ...,
    images[]{ _key, caption, ...@${IMAGE} }
  },
  _type == "productSpotlight" => {
    ...,
    product->{
      name,
      "slug": slug.current,
      "image": image${IMAGE},
      oneLiner,
      priceLow,
      priceHigh,
      minQty,
      ctaLabel
    }
  },
  _type == "comparisonTable" => {
    ...,
    "rows": rows[].cells,
    "highlightRow": select(defined(highlightRow) => highlightRow - 1, null)
  },
  _type == "resourceDownload" => {
    ...,
    "file": file.asset->url,
    "fileSize": file.asset->size,
    "thumbnail": thumbnail${IMAGE}
  },
  _type == "faqBlock" => {
    ...,
    items[]{ _key, question, answer }
  }
}`;

/** A post as a card needs it — no body, so feed queries stay small. */
const CARD = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  dek,
  excerpt,
  "heroImage": heroImage${IMAGE},
  category->${CATEGORY},
  author->{ name, "slug": slug.current, role, "avatar": avatar${IMAGE} },
  tags[]->${TAG},
  publishedAt,
  updatedAt,
  readTime,
  featured,
  isGuide
}`;

/** The full post. */
const FULL = /* groq */ `{
  _id,
  title,
  "slug": slug.current,
  dek,
  excerpt,
  "heroImage": heroImage${IMAGE},
  category->${CATEGORY},
  author->${AUTHOR},
  tags[]->${TAG},
  publishedAt,
  updatedAt,
  readTime,
  reviewedBy,
  featured,
  isGuide,
  // Document-level FAQ (§4.8). Rendered between the body and the end CTA, and
  // feeds the FAQPage JSON-LD — omitting it here silently drops both.
  faq[]{ _key, question, answer },
  seo{
    metaTitle,
    metaDescription,
    canonical,
    noindex,
    "ogImage": ogImage${IMAGE}
  },
  redirectFrom,
  "relatedPosts": relatedPosts[]->${CARD},
  ${BODY}
}`;

/*
 * `defined(slug.current)` guards every list: a post created but not yet given a
 * URL would otherwise crash getStaticPaths with an undefined route param.
 */
const PUBLISHED = `_type == "post" && defined(slug.current)`;

/* ---- Queries ------------------------------------------------------------- */

export const ALL_POSTS = defineQuery(
  `*[${PUBLISHED}] | order(publishedAt desc) ${CARD}`,
);

export const ALL_CATEGORIES = defineQuery(
  `*[_type == "category" && defined(slug.current)] | order(order asc) {
    ...${CATEGORY},
    "postCount": count(*[_type == "post" && defined(slug.current) && category._ref == ^._id])
  }`,
);

export const ALL_GUIDES = defineQuery(
  `*[${PUBLISHED} && isGuide == true] | order(coalesce(updatedAt, publishedAt) desc) ${CARD}`,
);

export const GUIDE_COUNT = defineQuery(`count(*[${PUBLISHED} && isGuide == true])`);

export const FEATURED_POST = defineQuery(
  `*[${PUBLISHED} && featured == true] | order(publishedAt desc)[0] ${CARD}`,
);

export const POSTS_IN_CATEGORY = defineQuery(
  `*[${PUBLISHED} && category->slug.current == $category] | order(publishedAt desc) ${CARD}`,
);

export const TAGS_IN_CATEGORY = defineQuery(
  `*[_type == "tag" && count(*[${PUBLISHED} && category->slug.current == $category && references(^._id)]) > 0]{
    ...${TAG},
    "count": count(*[${PUBLISHED} && category->slug.current == $category && references(^._id)])
  }`,
);

export const POST_BY_SLUG = defineQuery(
  `*[${PUBLISHED} && slug.current == $slug][0] ${FULL}`,
);

export const POST_PATHS = defineQuery(
  `*[${PUBLISHED}]{ "slug": slug.current, "category": category->slug.current }`,
);

export const CATEGORY_PATHS = defineQuery(
  `*[_type == "category" && defined(slug.current)]{
    "slug": slug.current,
    "total": count(*[${PUBLISHED} && category._ref == ^._id])
  }`,
);

/** Every redirectFrom path, for the build-time redirect map (Flag 7). */
export const REDIRECTS = defineQuery(
  `*[${PUBLISHED} && count(redirectFrom) > 0]{
    "slug": slug.current,
    "category": category->slug.current,
    redirectFrom
  }`,
);

/**
 * Related posts. The manual `relatedPosts` field wins when set; otherwise
 * pick by same category first, then shared tags, then recency (§3.9).
 */
export const RELATED_FALLBACK = defineQuery(
  `*[${PUBLISHED} && slug.current != $slug] | order(
    select(category->slug.current == $category => 0, 1) asc,
    publishedAt desc
  )[0...12] ${CARD}`,
);

/* ---- Fetch helpers ------------------------------------------------------- */

/**
 * Every fetch goes through here so a preview request can swap in the draft
 * client without any page knowing about it.
 */
export function api(override?: SanityClient | null) {
  const sanity = override ?? client;

  return {
    allPosts: () => sanity.fetch<Post[]>(ALL_POSTS),
    allCategories: () => sanity.fetch<Category[]>(ALL_CATEGORIES),
    allGuides: () => sanity.fetch<Post[]>(ALL_GUIDES),
    guideCount: () => sanity.fetch<number>(GUIDE_COUNT),
    featuredPost: () => sanity.fetch<Post | null>(FEATURED_POST),
    postsInCategory: (category: string) => sanity.fetch<Post[]>(POSTS_IN_CATEGORY, { category }),
    tagsInCategory: (category: string) =>
      sanity.fetch<Array<Tag & { count: number }>>(TAGS_IN_CATEGORY, { category }),
    postBySlug: (slug: string) => sanity.fetch<Post | null>(POST_BY_SLUG, { slug }),
    postPaths: () => sanity.fetch<Array<{ slug: string; category: string }>>(POST_PATHS),
    categoryPaths: () => sanity.fetch<Array<{ slug: string; total: number }>>(CATEGORY_PATHS),
    redirects: () =>
      sanity.fetch<Array<{ slug: string; category: string; redirectFrom: string[] }>>(REDIRECTS),
    relatedFallback: (slug: string, category: string) =>
      sanity.fetch<Post[]>(RELATED_FALLBACK, { slug, category }),
    authors: () => sanity.fetch<Author[]>(`*[_type == "author"]${AUTHOR}`),
  };
}

export const sanityApi = api();
