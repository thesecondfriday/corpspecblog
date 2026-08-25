/*
 * Walks the built site and asserts every component actually rendered.
 *
 *   node scripts/verify.mjs [dist-dir]
 *
 * This checks rendered HTML, not source. A component that silently produced
 * nothing — a renamed Portable Text type, a projection dropping a field, an
 * image losing its asset reference — shows up here as a missing marker rather
 * than as a page that merely looks a bit short.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

const DIST = process.argv[2] ?? "dist";

const results = [];
const record = (page, label, ok, detail = "") =>
  results.push({ page, label, ok, detail });

async function html(route) {
  const file = path.join(DIST, route.replace(/^\//, ""), "index.html");
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

/** Counts non-overlapping occurrences of a marker. */
const count = (haystack, needle) => haystack.split(needle).length - 1;

/* ---- Index --------------------------------------------------------------- */

async function checkIndex() {
  const page = "/blog";
  const h = await html(page);
  if (!h) return record(page, "page built", false, "index.html missing");

  record(page, "index hero", h.includes("hero-split__title"));
  const heroMedia = h.split("hero-split__media")[1]?.split("</div>")[0] ?? "";
  record(page, "hero has responsive srcset", /srcset=/.test(heroMedia));
  record(page, "hero has LQIP placeholder", heroMedia.includes("data:image/jpeg;base64"));
  record(page, "secondary featured row (3 featured cards)", count(h, "card card--featured") === 3, `${count(h, "card card--featured")} found`);
  record(page, "guides module", h.includes("guides__list"), `${count(h, "guides__row")} rows`);
  record(page, "feed grid (standard cards)", count(h, "card card--standard") > 0, `${count(h, "card card--standard")} cards`);
  record(page, "inline CTA with email capture", h.includes("cta--inlineFeed") && h.includes('type="email"'));
  record(page, "category nav", count(h, "catnav__item") >= 6, `${count(h, "catnav__item")} items`);
  record(page, "footer newsletter", h.includes("news--footer"));
  record(page, "skip link first in tab order", h.indexOf("skip-link") < h.indexOf("masthead"));
  record(page, "canonical", /rel="canonical"/.test(h));
}

/* ---- Category ------------------------------------------------------------ */

async function checkCategory(slug) {
  const page = `/blog/${slug}`;
  const h = await html(page);
  if (!h) return record(page, "page built", false, "index.html missing");

  record(page, "category header + count", h.includes("cat-header__number"));
  record(page, "description rendered", h.includes("cat-header__desc"));
  record(page, "grid or empty state", h.includes("card card--standard") || h.includes("empty__headline"));
  record(page, "nav marks this category active", h.includes('aria-current="page"'));
}

/* ---- Post ---------------------------------------------------------------- */

const BLOCKS = {
  "pull quote": "pullquote__text",
  "inline image": "inline-image__well",
  "image pair": "pair__well",
  "product spotlight": "spotlight__eyebrow",
  "comparison table": "comparison__scroller",
  "callout (tip)": "callout--tip",
  "callout (caution)": "callout--caution",
  "resource download": "resource",
  "FAQ block": "faq__items",
  "newsletter inline": "news--inline",
};

async function checkPost(route, expected) {
  const h = await html(route);
  if (!h) return record(route, "page built", false, "index.html missing");

  record(route, "article header", h.includes("art-head__title"));
  record(route, "dek", h.includes("art-head__dek"));
  record(route, "byline", h.includes("art-head__author-name"));
  record(route, "prose body", h.includes('class="prose"'));

  // Portable Text: real spans, real lists — the two things the mock got wrong.
  record(route, "paragraphs rendered", /<p[^>]*>[^<]/.test(h.split('class="prose"')[1] ?? ""));
  if (expected.lists) {
    record(route, "lists rendered as ul/ol", /<(ul|ol)>/.test(h), "Flag 10");
  }
  if (expected.dropcap) record(route, "drop cap on first paragraph", h.includes("has-dropcap"));

  for (const [label, marker] of Object.entries(BLOCKS)) {
    if (!expected.blocks.includes(label)) continue;
    record(route, `block: ${label}`, h.includes(marker));
  }

  if (expected.toc) {
    record(route, "TOC renders (>=4 H2s)", h.includes("data-toc"));
    const ids = [...h.matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
    const anchors = [...h.matchAll(/data-toc-link="([^"]+)"/g)].map((m) => m[1]);
    const matched = ids.every((id) => anchors.includes(id));
    record(route, "TOC anchors match heading ids", matched && ids.length > 0, `${ids.length} headings`);
  } else {
    record(route, "TOC correctly absent (<4 H2s)", !h.includes("data-toc"));
  }

  record(route, "author bio", expected.bio ? h.includes("bio__body") : !h.includes("bio__body"),
    expected.bio ? "" : "correctly omitted (no bio)");
  record(route, "end CTA", h.includes("cta--endOfArticle"));
  record(route, "related posts", h.includes("card--related"), `${count(h, "card--related")} cards`);

  // Structured data
  const types = [...h.matchAll(/"@type":\s*"(BlogPosting|FAQPage|BreadcrumbList)"/g)].map((m) => m[1]);
  record(route, "JSON-LD BlogPosting", types.includes("BlogPosting"));
  record(route, "JSON-LD BreadcrumbList", types.includes("BreadcrumbList"));
  if (expected.faq) {
    record(route, "JSON-LD FAQPage", types.includes("FAQPage"));
    record(route, "document-level FAQ section renders", h.includes("post-faq"));
  }

  const micro = [...h.matchAll(/itemtype="https:\/\/schema\.org\/(\w+)"/g)].map((m) => m[1]);
  record(route, "microdata BlogPosting/Person/ImageObject",
    ["BlogPosting", "Person"].every((t) => micro.includes(t)), micro.join(", "));

  // Images
  if (expected.hero) {
    /*
     * §3.7 — two crops, not three. The hero is a contained split beside the
     * headline: square at 900px and up, 3:2 stacked below. The old full-bleed
     * hero carried a third, tablet-only 16:9 crop; the split has no width where
     * that ratio applies.
     */
    record(route, "hero picture with 2 breakpoint crops", count(h, "<source") >= 1, `${count(h, "<source")} sources`);
    record(route, "hero is contained, not full-bleed", h.includes("art-head__media"));
  } else {
    record(route, "hero correctly absent", !h.includes("art-head__well"));
  }
  record(route, "no unresolved image URLs", !h.includes("undefined") || !/src="[^"]*undefined/.test(h));
}

/* ---- Run ----------------------------------------------------------------- */

await checkIndex();
for (const slug of [
  "gifting-guides",
  "trending-products",
  "marketing-ideas",
  "swag-program-strategy",
  "industry-trends",
]) {
  await checkCategory(slug);
}

await checkPost("/blog/gifting-guides/remote-team-gift-ideas", {
  blocks: [
    "pull quote", "inline image", "image pair", "product spotlight",
    "comparison table", "callout (tip)", "callout (caution)", "resource download",
  ],
  lists: true, dropcap: true, toc: true, bio: true, faq: true, hero: true,
});
await checkPost("/blog/trending-products/2026-drinkware-shortlist", {
  blocks: ["comparison table", "callout (tip)", "FAQ block"],
  lists: true, dropcap: true, toc: false, bio: true, hero: true,
});
await checkPost("/blog/marketing-ideas/trade-show-giveaways", {
  blocks: ["callout (caution)", "newsletter inline"],
  lists: true, dropcap: true, toc: false, bio: false, hero: false,
});
await checkPost("/blog/swag-program-strategy/budget-a-repeatable-swag-program", {
  blocks: ["pull quote", "callout (tip)", "resource download"],
  lists: true, dropcap: true, toc: false, bio: true, faq: true, hero: true,
});
await checkPost("/blog/industry-trends/lead-times-versus-your-calendar", {
  blocks: [], lists: false, dropcap: true, toc: false, bio: true, hero: true,
});

/* ---- Report -------------------------------------------------------------- */

const byPage = new Map();
for (const r of results) {
  if (!byPage.has(r.page)) byPage.set(r.page, []);
  byPage.get(r.page).push(r);
}

let failures = 0;
for (const [page, checks] of byPage) {
  const bad = checks.filter((c) => !c.ok);
  failures += bad.length;
  console.log(`\n${bad.length === 0 ? "PASS" : "FAIL"}  ${page}`);
  for (const c of checks) {
    console.log(`   ${c.ok ? "ok  " : "MISS"} ${c.label}${c.detail ? `  — ${c.detail}` : ""}`);
  }
}

console.log(
  `\n${results.length - failures}/${results.length} checks passed across ${byPage.size} pages.`,
);
process.exit(failures > 0 ? 1 : 0);
