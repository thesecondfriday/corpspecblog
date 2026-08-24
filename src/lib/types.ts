/*
 * Component Spec §2 — the content model, as the front end receives it.
 *
 * These are the shapes AFTER the GROQ projections in src/sanity/lib/queries.ts
 * have run, not the shapes Sanity stores. The projection is where `slug{current}`
 * becomes a string, an asset reference becomes `{src, alt, …}`, and a
 * comparison table's `rows[].cells[]` becomes `string[][]`.
 *
 * The mirror of this file is src/sanity/schemaTypes/, which defines what the
 * Studio stores. Change one, change the other — and check the projection in
 * between, because it is what reconciles them.
 */

import type { PortableTextBlock } from "@portabletext/types";

/* ---- Shared -------------------------------------------------------------- */

/** A Sanity image, flattened by the IMAGE fragment. */
export interface ImageRef {
  /** Resolved asset URL. Pass the whole object to `responsive()` for a srcset. */
  src: string;
  assetId?: string;
  /** Required whenever an image is present — enforced by schema validation. */
  alt: string;
  caption?: string;
  credit?: string;
  /** Drives the fixed-ratio crops (§3.1). */
  hotspot?: { x: number; y: number; width: number; height: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  /** Inline blur placeholder from Sanity's asset metadata. */
  lqip?: string;
  dimensions?: { width: number; height: number; aspectRatio: number };
}

export interface Link {
  _key?: string;
  label: string;
  url: string;
}

/* ---- Documents ----------------------------------------------------------- */

export interface Category {
  title: string;
  slug: string;
  description: string;
  /** Fixes nav order. */
  order: number;
  /** derived — counted in GROQ, never authored. */
  postCount?: number;
}

export interface Author {
  name: string;
  slug: string;
  role?: string;
  avatar?: ImageRef;
  /** If absent the whole AuthorBio block is omitted (§3.9). */
  bio?: string;
  links?: Link[];
  /** derived */
  postCount?: number;
}

/** Tags are cross-category (§7). */
export interface Tag {
  title: string;
  slug: string;
}

export interface Product {
  name: string;
  slug?: string;
  image?: ImageRef;
  oneLiner: string;
  priceLow?: number;
  priceHigh?: number;
  minQty?: number;
  ctaLabel?: string;
}

export interface FaqItem {
  _key?: string;
  question: string;
  /** Portable Text — §4.8 allows links inside an answer. */
  answer: PortableTextBlock[];
}

export interface Seo {
  metaTitle?: string;
  metaDescription?: string;
  /** Override, for content first published elsewhere. */
  canonical?: string;
  noindex?: boolean;
  ogImage?: ImageRef;
}

export interface Post {
  _id?: string;
  title: string;
  slug: string;
  dek: string;
  excerpt?: string;
  heroImage?: ImageRef;
  category: Category;
  tags?: Tag[];
  author: Author;
  publishedAt: string;
  updatedAt?: string;
  /** Minutes. Derived from word count when absent. */
  readTime?: number;
  body: BodyNode[];
  faq?: FaqItem[];
  isGuide?: boolean;
  featured?: boolean;
  reviewedBy?: string;
  seo?: Seo;
  redirectFrom?: string[];
  /** Manual override; empty means fall back to the algorithm (§3.9). */
  relatedPosts?: Post[];
}

/* ---- §4 Article body blocks ----------------------------------------------
 * Prose, lists and marks arrive as ordinary Portable Text blocks and are
 * rendered by astro-portabletext. Everything below is a §4 object block.
 */

export interface PullQuoteNode {
  _type: "pullQuote";
  _key: string;
  quote: string;
  attribution?: string;
  attributionDetail?: string;
}

export interface InlineImageNode extends ImageRef {
  _type: "inlineImage";
  _key: string;
  /** `wide` breaks past the measure, desktop only. */
  width?: "measure" | "wide";
  ratio?: "3/2" | "4/5" | "1/1";
}

export interface ImagePairNode {
  _type: "imagePair";
  _key: string;
  images: Array<ImageRef & { _key: string; caption?: string }>;
  ratio?: "4/5" | "3/2" | "1/1";
}

export interface ProductSpotlightNode {
  _type: "productSpotlight";
  _key: string;
  product: Product;
  ctaHref: string;
}

export interface ComparisonTableNode {
  _type: "comparisonTable";
  _key: string;
  label?: string;
  columns: string[];
  /** Flattened from rows[].cells by the projection. */
  rows: string[][];
  footnote?: string;
  /** Zero-based here; the Studio field is one-based. */
  highlightRow?: number | null;
}

export interface CalloutNode {
  _type: "callout";
  _key: string;
  tone: "tip" | "caution";
  label?: string;
  body: PortableTextBlock[];
}

export interface ResourceDownloadNode {
  _type: "resourceDownload";
  _key: string;
  title: string;
  /** Resolved asset URL. Undefined when no file has been uploaded yet. */
  file?: string;
  fileSize?: number;
  pageCount?: number;
  description?: string;
  gated: boolean;
  formatLabel?: string;
  submitLabel?: string;
  listId?: string;
  reassurance?: string;
  thumbnail?: ImageRef;
}

export interface FaqBlockNode {
  _type: "faqBlock";
  _key: string;
  eyebrow?: string;
  items: FaqItem[];
  display?: "open" | "accordion";
}

export interface NewsletterInlineNode {
  _type: "newsletterInline";
  _key: string;
  heading: string;
  body?: string;
  placeholder?: string;
  submitLabel?: string;
  proofLine?: string;
  listId: string;
}

/** A §4 block, as opposed to ordinary prose. */
export type CustomBlock =
  | PullQuoteNode
  | InlineImageNode
  | ImagePairNode
  | ProductSpotlightNode
  | ComparisonTableNode
  | CalloutNode
  | ResourceDownloadNode
  | FaqBlockNode
  | NewsletterInlineNode;

export type BodyNode = PortableTextBlock | CustomBlock;

/* ---- Derived shapes ------------------------------------------------------ */

/** §3.8 — derived from body at build; the CMS never authors these. */
export interface Heading {
  level: 2 | 3;
  text: string;
  slug: string;
}

export type CardVariant = "featured" | "standard" | "compact";
export type GridState = "ready" | "loading" | "empty";
export type ChipKind = "category" | "tag";
export type ChipStyle = "bare" | "framed" | "pill";
