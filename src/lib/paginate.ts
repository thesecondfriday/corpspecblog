/*
 * Pagination and related-post selection — the two bits of list logic that are
 * not expressible as a GROQ projection.
 */
import type { Post } from "./types";

/** §3.4 — pageSize is 6 on archives; the index adds a 3-up compact tail strip. */
export const PAGE_SIZE = 6;
export const COMPACT_TAIL_SIZE = 3;

export interface Paged<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  total: number;
  /** §3.3 rangeLabel, e.g. "7–12 of 42". */
  from: number;
  to: number;
}

export function paginate<T>(all: T[], currentPage: number, pageSize = PAGE_SIZE): Paged<T> {
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);
  return {
    items,
    currentPage: page,
    totalPages,
    total,
    from: total === 0 ? 0 : start + 1,
    to: start + items.length,
  };
}

/**
 * §3.9 RelatedPosts — exactly 3: same category first, then shared tags, then
 * recency; never the current post.
 *
 * Flag 6: the manual `relatedPosts` field wins when set, so editors curate only
 * where they care. A partial manual list is topped up from the algorithm rather
 * than left short.
 */
export function resolveRelated(current: Post, pool: Post[], limit = 3): Post[] {
  const manual = (current.relatedPosts ?? []).filter(Boolean);
  if (manual.length >= limit) return manual.slice(0, limit);

  const taken = new Set([current.slug, ...manual.map((p) => p.slug)]);
  const currentTags = new Set((current.tags ?? []).map((t) => t.slug));

  const score = (p: Post): number => {
    let s = 0;
    if (p.category?.slug === current.category?.slug) s += 100;
    s += (p.tags ?? []).filter((t) => currentTags.has(t.slug)).length * 10;
    return s;
  };

  const filled = [...pool]
    .filter((p) => !taken.has(p.slug))
    .sort(
      (a, b) =>
        score(b) - score(a) ||
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, limit - manual.length);

  return [...manual, ...filled];
}
