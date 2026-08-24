/*
 * Component Spec §2 — Content model, as TypeScript.
 *
 * Field names here are the Sanity field names. Five document types; components
 * consume projections of these. `derived` fields are computed at build time,
 * not authored — they are marked in the comments and produced by src/lib/derive.ts.
 *
 * The mirror of this file is src/sanity/schemas/, which defines the same shapes
 * for the Studio. Change one, change the other.
 */

/* ---- Shared -------------------------------------------------------------- */

/** A Sanity image asset plus the fields the design depends on. */
export interface ImageRef {
  /** Resolved asset URL. In production this comes from the Sanity image builder. */
  src: string;
  /** Required whenever an image is present. An image block with no alt fails validation (§4.3). */
  alt: string;
  caption?: string;
  credit?: string;
  /** Sanity hotspot, respected by the fixed-ratio crops (§3.1). */
  hotspot?: { x: number; y: number };
}

export interface Link {
  label: string;
  url: string;
}

/* ---- Documents ----------------------------------------------------------- */

export interface Category {
  title: string;
  slug: string;
  /** Renders in the category header; 1 paragraph, 220–320 chars. */
  description: string;
  /** Fixes nav order. */
  order: number;
  /** derived */
  postCount?: number;
}

export interface Author {
  name: string;
  slug: string;
  role?: string;
  avatar?: ImageRef;
  /** 2–3 sentences. If absent the whole AuthorBio block is omitted (§3.9). */
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
  /** Links to the storefront when present. */
  slug?: string;
  image?: ImageRef;
  /** ≤90 chars. */
  oneLiner: string;
  /** Both or neither. */
  priceLow?: number;
  priceHigh?: number;
  minQty?: number;
  /** Default "Request pricing". */
  ctaLabel?: string;
}

export interface FaqItem {
  question: string;
  /** Rich text, 1–2 short paragraphs. Modelled here as paragraph strings. */
  answer: string[];
}

export interface Seo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: ImageRef;
}

export interface Post {
  title: string;
  slug: string;
  /** Also the meta description fallback. */
  dek: string;
  /** ≤140 chars. */
  excerpt?: string;
  heroImage?: ImageRef;
  /** One category per post (§7). */
  category: Category;
  tags?: Tag[];
  author: Author;
  /** ISO datetime. */
  publishedAt: string;
  updatedAt?: string;
  /** Minutes. derived from body word count ÷ 220 when absent. */
  readTime?: number;
  /** Portable Text with the §4 blocks. */
  body: BodyNode[];
  faq?: FaqItem[];
  /** Routes to the Guides module. */
  isGuide?: boolean;
  /** Eligible for the index hero. */
  isFeatured?: boolean;
  reviewedBy?: string;
  seo?: Seo;
}

/* ---- §4 Article body blocks ---------------------------------------------
 * Each of these is an insertable object in the Portable Text array — a Sanity
 * object schema an editor picks from the insert menu, not a styling rule.
 */

/** §4.1 — the default prose styles and marks. */
export interface ProseNode {
  _type: "block";
  style: "normal" | "h2" | "h3" | "blockquote";
  /** Rendered as HTML; marks (strong, em, link, code) are inline in the string. */
  text: string;
}

export interface ListNode {
  _type: "list";
  listItem: "bullet" | "number";
  items: string[];
}

/** §4.2 */
export interface PullQuoteNode {
  _type: "pullQuote";
  /** ≤220 chars — validate; longer defeats the type size. */
  quote: string;
  attribution?: string;
  /** Role, company size. */
  attributionDetail?: string;
}

/** §4.3 */
export interface InlineImageNode {
  _type: "inlineImage";
  image: ImageRef;
  caption?: string;
  credit?: string;
  /** `wide` breaks 120px past the measure each side, desktop only. */
  width?: "measure" | "wide";
  ratio?: "3/2" | "4/5" | "1/1";
}

/** §4.3 — exactly 2 images, one shared crop. */
export interface ImagePairNode {
  _type: "imagePair";
  images: [ImageRef, ImageRef];
  captions?: [string?, string?];
  ratio?: "4/5" | "3/2" | "1/1";
}

/** §4.4 — a product reference plus optional inline overrides. */
export interface ProductSpotlightNode {
  _type: "productSpotlight";
  product: Product;
  /** Quote form with the SKU prefilled, not the product page. */
  ctaHref: string;
}

/** §4.5 */
export interface ComparisonTableNode {
  _type: "comparisonTable";
  /** Eyebrow, e.g. "Compare · best drinkware for remote kits". */
  label?: string;
  /** 3–5 header strings — validate the max; 6 columns cannot be read on mobile. */
  columns: string[];
  /** First cell of each row is the row label. */
  rows: string[][];
  /** Sourcing and date. Strongly encouraged. */
  footnote?: string;
  /** Index into rows → an editor's pick, filled --surface-accent-soft. */
  highlightRow?: number;
}

/** §4.6 */
export interface CalloutNode {
  _type: "callout";
  tone: "tip" | "caution";
  /** Defaults "Tip" / "Watch out". An empty string suppresses the label row. */
  label?: string;
  /** Paragraphs. */
  body: string[];
}

/** §4.7 */
export interface ResourceDownloadNode {
  _type: "resourceDownload";
  title: string;
  /** Asset URL; pageCount and fileSize are derived from it. */
  file: string;
  pageCount?: number;
  description?: string;
  gated: boolean;
  /** Default derived: "PDF · {n} pages". */
  formatLabel?: string;
  /** Default "Send me the PDF". */
  submitLabel?: string;
  /** Required when gated. */
  listId?: string;
  /** Default "Email only. No follow-up sequence." */
  reassurance?: string;
  thumbnail?: ImageRef;
}

/** §4.8 */
export interface FaqBlockNode {
  _type: "faqBlock";
  /** Default "Common questions". */
  eyebrow?: string;
  items: FaqItem[];
  display?: "open" | "accordion";
}

/** §3.10, offered as a body block. */
export interface NewsletterInlineNode {
  _type: "newsletterInline";
  heading: string;
  body?: string;
  placeholder?: string;
  submitLabel?: string;
  proofLine?: string;
  listId: string;
}

export type BodyNode =
  | ProseNode
  | ListNode
  | PullQuoteNode
  | InlineImageNode
  | ImagePairNode
  | ProductSpotlightNode
  | ComparisonTableNode
  | CalloutNode
  | ResourceDownloadNode
  | FaqBlockNode
  | NewsletterInlineNode;

/* ---- Derived shapes ------------------------------------------------------ */

/** §3.8 — derived from body at build; the CMS never authors these. */
export interface Heading {
  level: 2 | 3;
  text: string;
  slug: string;
}

/** §3.1 */
export type CardVariant = "featured" | "standard" | "compact";

/** §3.3 */
export type GridState = "ready" | "loading" | "empty";

/** §3.2 */
export type ChipKind = "category" | "tag";
export type ChipStyle = "bare" | "framed" | "pill";
