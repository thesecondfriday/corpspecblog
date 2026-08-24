/*
 * Build-time derivations. Everything the spec marks `derived` is computed here
 * rather than authored in the CMS.
 */

import type { BodyNode, Heading, Post } from "./types";

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
 * §3.8 — headings derived from the body. H4+ is ignored. The TOC renders only
 * when there are ≥4 H2s; below that, no TOC and no empty shell.
 */
export function getHeadings(body: BodyNode[]): Heading[] {
  const seen = new Map<string, number>();

  return body.flatMap((node) => {
    if (node._type !== "block") return [];
    if (node.style !== "h2" && node.style !== "h3") return [];

    const text = stripMarks(node.text);
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

/**
 * §2 — readTime is derived from body word count ÷ 220 when the field is absent.
 */
export function getReadTime(post: Post): number | undefined {
  if (post.readTime) return post.readTime;
  const words = countWords(post.body);
  if (words === 0) return undefined;
  return Math.max(1, Math.round(words / 220));
}

/** §3.11 / BlogPosting `wordCount`. */
export function countWords(body: BodyNode[]): number {
  let total = 0;
  for (const node of body) {
    if (node._type === "block") total += wordsIn(node.text);
    else if (node._type === "list") total += node.items.reduce((n, i) => n + wordsIn(i), 0);
    else if (node._type === "callout") total += node.body.reduce((n, p) => n + wordsIn(p), 0);
    else if (node._type === "pullQuote") total += wordsIn(node.quote);
  }
  return total;
}

function wordsIn(html: string): number {
  const text = stripMarks(html).trim();
  return text ? text.split(/\s+/).length : 0;
}

/** Inline marks are stored as HTML in the fixture layer; strip them for text use. */
export function stripMarks(html: string): string {
  return html.replace(/<[^>]+>/g, "");
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
export function metaParts(post: Post, opts: { withAuthor?: boolean; short?: boolean } = {}): string[] {
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
