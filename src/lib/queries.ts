/*
 * The content seam.
 *
 * Pages import ONLY from this module, never from src/content/. To move from
 * fixtures to a live Sanity dataset, reimplement these functions as GROQ
 * projections returning the same shapes from src/lib/types.ts — no page or
 * component changes.
 */

import { guides, posts, totalGuideCount } from "../content/posts";
import { categories, tags } from "../content/taxonomy";
import { authors } from "../content/authors";
import type { Author, Category, Post, Tag } from "./types";

/** §3.4 — pageSize is 6 on archives; the index adds a 3-up compact tail strip. */
export const PAGE_SIZE = 6;
export const COMPACT_TAIL_SIZE = 3;

const byNewest = (a: Post, b: Post) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

export function allPosts(): Post[] {
  return [...posts].sort(byNewest);
}

export function allCategories(): Category[] {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function allAuthors(): Author[] {
  return authors;
}

export function allGuides(): Post[] {
  return [...guides].sort(
    (a, b) =>
      new Date(b.updatedAt ?? b.publishedAt).getTime() -
      new Date(a.updatedAt ?? a.publishedAt).getTime(),
  );
}

export function guideCount(): number {
  return totalGuideCount;
}

/** §2 — postCount is derived, never authored. */
export function postCount(categorySlug: string): number {
  return posts.filter((p) => p.category.slug === categorySlug).length;
}

export function categoriesWithCounts(): Category[] {
  return allCategories().map((c) => ({ ...c, postCount: postCount(c.slug) }));
}

export function postsInCategory(categorySlug: string): Post[] {
  return allPosts().filter((p) => p.category.slug === categorySlug);
}

/** §2 — the filter row on an archive shows only tags present on posts in that category. */
export function tagsInCategory(categorySlug: string): Array<Tag & { count: number }> {
  const counts = new Map<string, number>();
  for (const post of postsInCategory(categorySlug)) {
    for (const t of post.tags ?? []) counts.set(t.slug, (counts.get(t.slug) ?? 0) + 1);
  }
  return tags
    .filter((t) => counts.has(t.slug))
    .map((t) => ({ ...t, count: counts.get(t.slug)! }));
}

export function findPost(categorySlug: string, slug: string): Post | undefined {
  return [...posts, ...guides].find(
    (p) => p.slug === slug && p.category.slug === categorySlug,
  );
}

/** §3.1 — the index hero takes the newest post flagged isFeatured. */
export function featuredPost(): Post {
  return allPosts().find((p) => p.isFeatured) ?? allPosts()[0];
}

/** §3.1 — the secondary featured row: the next 3 after the hero. */
export function secondaryFeatured(): Post[] {
  const hero = featuredPost();
  return allPosts()
    .filter((p) => p.slug !== hero.slug)
    .slice(0, 3);
}

/**
 * §3.9 RelatedPosts — exactly 3: same category first, then shared tags, then
 * recency; never the current post. If fewer than 3 exist, return what exists.
 */
export function relatedPosts(current: Post, limit = 3): Post[] {
  const pool = allPosts().filter((p) => p.slug !== current.slug);
  const currentTags = new Set((current.tags ?? []).map((t) => t.slug));

  const score = (p: Post): number => {
    let s = 0;
    if (p.category.slug === current.category.slug) s += 100;
    s += (p.tags ?? []).filter((t) => currentTags.has(t.slug)).length * 10;
    return s;
  };

  return [...pool]
    .sort((a, b) => score(b) - score(a) || byNewest(a, b))
    .slice(0, limit);
}

/** §3.1 — the index tail strip uses the compact variant. */
export interface Paged {
  items: Post[];
  currentPage: number;
  totalPages: number;
  total: number;
  /** §3.3 rangeLabel, e.g. "7–12 of 42". */
  from: number;
  to: number;
}

export function paginate(all: Post[], currentPage: number, pageSize = PAGE_SIZE): Paged {
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
