# Field inventory — components → schema

Every prop the Astro components actually consume, mapped to the schema field
that will supply it. Produced before writing schemas so the naming disagreements
get settled rather than papered over.

Three sources are in play and they do not agree:

- **spec** — `project/Component Spec.dc.html` §2
- **components** — what `src/lib/types.ts` and the `.astro` files read today
- **brief** — the field list in the build request

Where they disagree the row is flagged and left for you to call.

---

## 1. `post`

| Component prop path | Consumed by | Schema field | Req | Notes |
| --- | --- | --- | --- | --- |
| `post.title` | PostCard, ArticleHeader, IndexHero, GuidesModule | `title` | req | |
| `post.slug` | every link, `getStaticPaths` | `slug` | req | Component reads a **plain string**; Sanity stores `{current}`. GROQ projects `"slug": slug.current`. |
| `post.dek` | ArticleHeader, IndexHero, `<meta description>` | `dek` | req | ⚠️ **Not in the brief's field list.** See Flag 1. |
| `post.excerpt` | PostCard (`featured` variant only) | `excerpt` | opt | Absent → line omitted, no body-slice fallback. |
| `post.heroImage` | PostCard, ArticleHeader, IndexHero, og:image | `heroImage` | opt | Component reads `.src`/`.alt`/`.caption`/`.hotspot`. See Flag 8. |
| `post.heroImage.alt` | `<img alt>` | `heroImage.alt` | req when image present | Validation required per brief. |
| `post.heroImage.caption` | hero `<figcaption>` | `heroImage.caption` | opt | |
| `post.heroImage.credit` | appended to caption | `heroImage.credit` | opt | Spec §3.7; brief doesn't list it. |
| `post.category.title` / `.slug` | PostCard, Chip, breadcrumb, nav active state | `category` → ref | req | GROQ dereferences. |
| `post.tags[].title` / `.slug` | archive filter row, `keywords` JSON-LD | `tags[]` → refs | opt | |
| `post.author.*` | ArticleHeader, AuthorBio, IndexHero | `author` → ref | req | |
| `post.publishedAt` | byline, sort order, JSON-LD | `publishedAt` | req | |
| `post.updatedAt` | `dateModified`, GuidesModule "Updated {month}" | `updatedAt` | opt | |
| `post.readTime` | byline, card meta | `readTime` | opt | Absent → derived from word count ÷ 220. |
| `post.body` | PortableText, TOC headings, word count | `body` | req | Portable Text. See Flag 9 — biggest change. |
| `post.faq` | FaqBlock (document-level), FAQPage JSON-LD | `faq[]` | opt | Ignored if body has a `faqBlock` (§4.8). |
| `post.reviewedBy` | ArticleHeader meta row | `reviewedBy` | opt | ⚠️ **Not in the brief's field list.** See Flag 2. |
| `post.isFeatured` | `featuredPost()` → index hero | ⚠️ `featured` vs `isFeatured` | opt | **Name disagreement.** See Flag 3. |
| `post.isGuide` | `allGuides()` → GuidesModule | `isGuide` | opt | ⚠️ **Not in the brief's field list.** See Flag 4. |
| `post.seo.metaTitle` | `<title>` | `seo.metaTitle` | opt | |
| `post.seo.metaDescription` | `<meta description>` | `seo.metaDescription` | opt | |
| `post.seo.ogImage` | `og:image` | `seo.ogImage` | opt | |
| — | — | `seo.canonical` | opt | **New.** No component reads it yet. See Flag 5. |
| — | — | `seo.noindex` | opt | **New.** No component reads it yet. See Flag 5. |
| — | — | `relatedPosts[]` | opt | **New.** Currently algorithmic. See Flag 6. |
| — | — | `redirectFrom[]` | opt | **New.** No component can consume it. See Flag 7. |

## 2. `author`

| Component prop path | Consumed by | Schema field | Req | Notes |
| --- | --- | --- | --- | --- |
| `author.name` | byline, bio, JSON-LD | `name` | req | |
| `author.slug` | `/authors/{slug}` link | `slug` | req | §7c — author pages still undecided. |
| `author.role` | byline, `jobTitle` | `role` | opt | |
| `author.avatar` | byline (46px), bio (72px) | ⚠️ `photo` vs `avatar` | opt | **Name disagreement.** See Flag 3. Absent → initials circle. |
| `author.bio` | AuthorBio | `bio` | opt | Absent → **whole block omitted**, no empty state. |
| `author.links[]` | AuthorBio, `{label, url}` | ⚠️ array vs single link | opt | **Shape disagreement.** See Flag 3. |
| `author.postCount` | AuthorBio "All {n} articles" | *derived* | — | Computed by GROQ `count()`, never authored. |

## 3. `category`

| Component prop path | Consumed by | Schema field | Req | Notes |
| --- | --- | --- | --- | --- |
| `category.title` | header, nav, chips, footer | `title` | req | |
| `category.slug` | routes, nav active state | `slug` | req | `page` is a reserved slug — collides with `/page/{n}`. |
| `category.description` | CategoryHeader, `<meta description>` | `description` | req | Spec caps 220–320 chars. |
| `category.order` | `allCategories()` nav ordering | `order` | req | ⚠️ **Not in the brief's field list.** See Flag 4. |
| `category.postCount` | CategoryHeader numeral | *derived* | — | GROQ `count()`. |

## 4. `tag`

| Component prop path | Consumed by | Schema field | Req |
| --- | --- | --- | --- |
| `tag.title` | Chip label | `title` | req |
| `tag.slug` | filter href | `slug` | req |
| `tag.count` | Chip count in filter row | *derived* | — |

## 5. Article body blocks

Component `_type` strings the `PortableText` dispatcher switches on. **These are
the schema type names** — they must match exactly or the block renders nothing.

| `_type` | Component | Fields the component reads | Adapter needed |
| --- | --- | --- | --- |
| `block` | inline prose | `style`, `text` | ⚠️ Flag 9 — real PT uses `children[]`, not `text` |
| `list` | inline `<ul>`/`<ol>` | `listItem`, `items[]` | ⚠️ Flag 10 — **this type does not exist in Portable Text** |
| `pullQuote` | PullQuote | `quote`, `attribution`, `attributionDetail` | none |
| `inlineImage` | InlineImage | `image`, `caption`, `credit`, `width`, `ratio` | image shape (Flag 8) |
| `imagePair` | ImagePair | `images[2]`, `captions[2]`, `ratio` | image shape; captions currently a parallel array |
| `productSpotlight` | ProductSpotlight | `product` (resolved), `ctaHref` | GROQ deref |
| `comparisonTable` | ComparisonTable | `label`, `columns[]`, `rows[][]`, `footnote`, `highlightRow` | ⚠️ Flag 11 — Sanity can't nest primitive arrays |
| `callout` | Callout | `tone`, `label`, `body: string[]` | ⚠️ Flag 12 — schema stores PT, component wants strings |
| `resourceDownload` | ResourceDownload | `title`, `file: string`, `pageCount`, `description`, `gated`, `formatLabel`, `submitLabel`, `listId`, `reassurance` | `file.asset->url` |
| `faqBlock` | FaqBlock | `eyebrow`, `items[]`, `display` | answer shape (Flag 12) |
| `newsletterInline` | NewsletterSignup | `heading`, `body`, `placeholder`, `submitLabel`, `proofLine`, `listId` | none |

`product` (referenced by `productSpotlight`): `name`, `slug`, `image`,
`oneLiner`, `priceLow`, `priceHigh`, `minQty`, `ctaLabel`. Not in the brief's
document list, but `productSpotlight` cannot render without it.

---

## Flags — needing your call

**Flag 1 · `dek` is missing from the brief.** The brief lists `title, slug,
excerpt, readTime`. But `dek` is a **required** field in the spec (§2: "also the
meta description fallback") and three components render it: `ArticleHeader`,
`IndexHero`, and the `<meta description>`. `excerpt` is a different, shorter
field used only on the featured card. Dropping `dek` would blank the article
subhead. → **I plan to keep both.**

**Flag 2 · `reviewedBy` is missing from the brief.** Spec §3.7 renders it in the
byline as "Reviewed by sourcing". Small, optional, already built. → **Keeping.**

**Flag 3 · Three name/shape disagreements. I have not renamed either side.**

| Brief says | Components say | Spec says | My recommendation |
| --- | --- | --- | --- |
| `featured` | `isFeatured` | `isFeatured` | **`featured`** — brief and spec both read fine, and `featured`/`isGuide` mixing prefixes is uglier than either alone. Requires a 2-line change in `queries.ts`. |
| `photo` | `avatar` | `avatar` | **`avatar`** — spec and components already agree; `photo` is the odd one out and changing it means touching 3 components. |
| "external profile link" (single) | `links[]` (array of `{label, url}`) | `links[]` | **`links[]`** — already built, and one author will eventually want both LinkedIn and a personal site. |

Say the word if you want it the other way on any of these; each is a small,
contained change, but it has to be a decision, not a silent pick.

**Flag 4 · Two fields the brief omits that the layout depends on.**
`isGuide` drives the entire Guides module on the index (four numbered rows), and
`category.order` fixes the nav order — without it the category bar sorts
arbitrarily. → **Keeping both.**

**Flag 5 · `seo.canonical` and `seo.noindex` have no consumer yet.** Both are
new capabilities, not wiring gaps. `BaseLayout` computes `canonical` from the
route and never emits a robots tag. Adding them is ~4 lines in `BaseLayout`,
which I'll do in step 4 — flagging so it's clear it is a **component change**,
not something the schema delivers on its own.

**Flag 6 · `relatedPosts` changes behaviour.** Today `queries.ts` derives
related posts algorithmically (same category → shared tags → recency, per §3.9).
The brief's field makes it a manual override. → **I plan to make the field win
when set and fall back to the algorithm when empty**, so editors curate only
where they care. Tell me if you'd rather it be manual-only.

**Flag 7 · `redirectFrom` has no component source, by nature.** It is a
build/hosting concern: old paths that should 301 to this post. Nothing renders
it. → **I plan to consume it in `astro.config.mjs`** by generating the redirect
map from Sanity at config time. That is the only place it can work in a static
build.

---

## Shape adapters — Sanity's shapes vs the components'

These are not disagreements, just the gap between fixture data and real CMS
data. Most are resolved in the GROQ projection so components stay untouched.

**Flag 8 · Images.** Components read `image.src` (a URL string). Sanity stores
`{asset: {_ref}, hotspot, crop, alt}`. → Resolved in GROQ: project
`"src": asset->url` alongside `alt`, `hotspot`. `ImageWell` already honours
`hotspot` for its fixed-ratio crops, so the responsive `urlFor()` builder slots
in without markup changes.

**Flag 9 · Portable Text prose.** ⚠️ **The largest change.** My fixture invented
`{_type: 'block', style, text: "<em>html</em>"}`. Real Portable Text is
`{_type: 'block', style, children: [{_type: 'span', text, marks}], markDefs}`.
So `PortableText.astro`'s `case "block"` and every `set:html` in it must be
replaced with the real `astro-portabletext` renderer, and `derive.ts`
(`getHeadings`, `countWords`, `stripMarks`) must read `children[].text` instead
of `.text`. → **Component-side fix**, in step 4.

**Flag 10 · Lists are not a block type.** ⚠️ `PortableText.astro` has a
`case "list"` that dispatches on `{_type: 'list', listItem, items[]}`. **Portable
Text has no such type.** Lists are ordinary `block`s carrying `listItem` and
`level`, one block *per list item*, which the renderer groups. With real data
that `case` never fires and every bullet would render as a bare paragraph. →
**Component-side fix**; `astro-portabletext` handles the grouping natively.

**Flag 11 · Comparison table rows.** Component wants `string[][]`. Sanity cannot
store an array of primitive arrays, so rows must be objects: `rows[]{cells[]}`.
→ Resolved in GROQ: project `"rows": rows[].cells`.

**Flag 12 · Callout body and FAQ answers.** Components want `string[]`
(paragraphs). Schema stores Portable Text so editors get links and lists. Two
options: project to plain strings in GROQ (loses the links), or render Portable
Text in those two components (~6 lines each). → **I plan to render Portable
Text** in `Callout` and `FaqBlock`, since §4.6 explicitly allows "paragraphs,
lists and links" in a callout body. That is a component change.

---

## Summary

- **Schema will define:** `post`, `author`, `category`, `tag`, `product`, plus
  the `seo` object and nine body-block objects.
- **Nothing gets silently renamed.** Three disagreements (Flag 3) have my
  recommendation attached and are waiting on you.
- **Four fields the brief omitted** are being kept because components already
  render them: `dek`, `reviewedBy`, `isGuide`, `category.order`.
- **Component changes needed in step 4**, not schema work: Portable Text prose
  and lists (Flags 9, 10), callout/FAQ rich text (Flag 12), `canonical`/`noindex`
  in `BaseLayout` (Flag 5).
