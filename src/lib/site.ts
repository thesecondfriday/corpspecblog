/*
 * Site-level constants and URL construction.
 *
 * Route shape — a call I made, noted in IMPLEMENTATION-NOTES.md:
 *   /blog                          index, page 1 (canonical)
 *   /blog/page/2                   index, page 2+
 *   /blog/{category}               archive, page 1 (canonical)
 *   /blog/{category}/page/2        archive, page 2+
 *   /blog/{category}/{post}        single post
 *
 * §3.4 gives `basePath` as e.g. `/blog/gifting-guides` and `{basePath}/page/{n}`,
 * which fixes the archive URLs; posts nest under their category so the
 * breadcrumb in the BreadcrumbList JSON-LD is the real path, and `page` is the
 * one reserved slug segment.
 */

export const SITE = {
  /** Used for absolute URLs in structured data. */
  origin: "https://corporatespecialties.com",
  organisation: "Corporate Specialties",
  hubName: "The Swag Desk",
  blogBase: "/blog",
  /** §3.10 — the primary action for the whole hub. */
  strategistHref: "/quote",
  strategistLabel: "Talk to a strategist",
  /** §3.11 — masthead search is a stand-in (§6); point it somewhere or drop it. */
  searchAction: "/search",
  productsHref: "/products",
} as const;

/** §3.4 — page 1 is canonical at basePath, with no /page/1 duplicate. */
export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

export function categoryHref(slug: string): string {
  return `${SITE.blogBase}/${slug}`;
}

export function postHref(categorySlug: string, slug: string): string {
  return `${SITE.blogBase}/${categorySlug}/${slug}`;
}

export function authorHref(slug: string): string {
  return `/authors/${slug}`;
}

/** §3.2 — a tag filter narrows within one category archive. */
export function tagHref(categorySlug: string, tagSlug: string): string {
  return `${categoryHref(categorySlug)}?tag=${tagSlug}`;
}

export function absolute(path: string): string {
  return path.startsWith("http") ? path : `${SITE.origin}${path}`;
}
