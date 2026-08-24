/*
 * Build-time derivations. Everything the spec marks `derived` is computed here
 * rather than authored in the CMS.
 *
 * These read REAL Portable Text: a block's text lives in `children[].text`,
 * not in a `text` property. The mock data this was first written against had a
 * flat `text` string, which is why every reader here goes through `plainText()`.
 */

import type { PortableTextBlock, PortableTextSpan } from "@portabletext/types";
import type { BodyNode, Heading, Post } from "./types";

/** True for ordinary prose blocks, false for the §4 object blocks. */
function isProse(node: BodyNode): node is PortableTextBlock {
  return node._type === "block";
}

/** Concatenates a block's spans. Marks are dropped — callers want plain text. */
export function plainText(block: PortableTextBlock): string {
  const children = (block.children ?? []) as PortableTextSpan[];
  return children.map((child) => child.text ?? "").join("");
}

/**
 * §3.8 — slugs are generated from heading text and written back onto the
 * rendered heading ids. The CMS never authors them, so this function is the
 * only definition of a heading anchor on the site.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * §3.8 — headings derived from the body. H4+ is ignored (the schema doesn't
 * offer them). List items carry `listItem` and are never headings.
 */
export function getHeadings(body: BodyNode[] = []): Heading[] {
  const seen = new Map<string, number>();

  return body.flatMap((node) => {
    if (!isProse(node)) return [];
    if (node.listItem) return [];
    if (node.style !== "h2" && node.style !== "h3") return [];

    const text = plainText(node);
    if (!text) return [];

    let slug = slugify(text);
    // Two headings with the same text would otherwise collide on one anchor.
    const priorCount = seen.get(slug) ?? 0;
    seen.set(slug, priorCount + 1);
    if (priorCount > 0) slug = `${slug}-${priorCount + 1}`;

    return [{ level: node.style === "h2" ? 2 : 3, text, slug } as Heading];
  });
}

/** §3.8 — the TOC threshold, applied identically on desktop and mobile. */
export function shouldRenderToc(headings: Heading[]): boolean {
  return headings.filter((h) => h.level === 2).length >= 4;
}

/** §2 — readTime is derived from body word count ÷ 220 when the field is absent. */
export function getReadTime(post: Post): number | undefined {
  if (post.readTime) return post.readTime;
  const words = countWords(post.body);
  if (words === 0) return undefined;
  return Math.max(1, Math.round(words / 220));
}

/** Feeds `wordCount` in the BlogPosting schema, and the readTime fallback. */
export function countWords(body: BodyNode[] = []): number {
  let total = 0;

  for (const node of body) {
    if (isProse(node)) {
      total += wordsIn(plainText(node));
      continue;
    }

    // The §4 blocks that carry real prose count toward the read time; the ones
    // that are structure (images, tables, forms) do not.
    if (node._type === "callout") {
      total += node.body.reduce((n, block) => n + wordsIn(plainText(block)), 0);
    } else if (node._type === "pullQuote") {
      total += wordsIn(node.quote);
    } else if (node._type === "faqBlock") {
      for (const item of node.items) {
        total += wordsIn(item.question);
        total += (item.answer ?? []).reduce((n, block) => n + wordsIn(plainText(block)), 0);
      }
    }
  }

  return total;
}

function wordsIn(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Flattens Portable Text to a single string — for meta tags and JSON-LD. */
export function toPlainText(blocks: PortableTextBlock[] = []): string {
  return blocks
    .filter(isProse)
    .map(plainText)
    .join(" ")
    .trim();
}

/* ---- Formatting ---------------------------------------------------------- */

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Aug 18, 2026" — the byline form. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTH[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** "Aug 18" — the card meta form, which omits the year. */
export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return `${MONTH[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** "Jul 2026" — the Guides module "Updated {month}" form. */
export function formatMonth(iso: string): string {
  const d = new Date(iso);
  return `${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/**
 * Card meta line. §3.1: absent readTime renders date only, with no dangling
 * separator; separators are gaps in the markup, not glyphs baked into a string.
 */
export function metaParts(
  post: Post,
  opts: { withAuthor?: boolean; short?: boolean } = {},
): string[] {
  const parts: string[] = [];
  if (opts.withAuthor && post.author?.name) parts.push(post.author.name);
  parts.push(opts.short ? formatDateShort(post.publishedAt) : formatDate(post.publishedAt));
  const rt = getReadTime(post);
  if (rt) parts.push(opts.short ? `${rt} min` : `${rt} min read`);
  return parts;
}

/** §3.1 — the initials fallback used when an author has no avatar. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
