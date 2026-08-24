# The Swag Desk — implementation notes

Astro front end built from `project/Component Spec.dc.html` (v1.0, Aug 2026),
with `project/Swag Content Hub.dc.html` as the visual reference.

```
npm install
npm run dev      # http://localhost:4321/blog
npm run build    # 29 static pages
npm run check    # astro check — currently 0 errors, 0 warnings, 0 hints
```

## Layout

```
src/
  styles/tokens.css        §1 — every colour role, type step, space, radius, ratio
  styles/base.css          §5 — focus ring, buttons, inputs, layout primitives
  styles/prose.css         §4.1 — prose defaults and the shared block spacing law
  lib/types.ts             §2 — the content model, as TypeScript
  lib/derive.ts            everything §2 marks `derived` (slugs, readTime, headings)
  lib/queries.ts           the ONLY module pages import content from
  lib/schema.ts            JSON-LD builders
  lib/site.ts              site constants and URL construction
  content/                 fixture data standing in for the Sanity dataset
  components/              §3 page components
  components/blocks/       §4 insertable body blocks
  sanity/schemas/          §2 + §4 as Sanity schemas (deliverable, not wired — see below)
  pages/blog/              the three pages
```

## How the spec maps onto the code

**Tokens (§1).** Every value in the spec's token tables is a CSS custom property
in `tokens.css`. No component file contains a raw hex or px value for anything
the token table covers. Where a component genuinely needed a one-off, it is
hoisted into a documented exception block at the bottom of `tokens.css` (§1.6)
with the reason inline, rather than left as a literal in the component:
`--border-on-inverse`, `--border-accent-input`, `--type-card-related-size`,
`--monogram`, `--toc-rest-rule`, and a handful of on-inverse text roles the
colour table did not name.

**Consolidations.** Built exactly as merged in §3: one `PostCard` with a
`variant` prop and no `RelatedCard`; one `Chip` with `kind` + `style`; one
`CtaBlock` with `placement`; one `NewsletterSignup` with `placement`.

**Body blocks (§4).** Each is a discrete component under `components/blocks/`
and a matching Sanity object schema. They share one spacing law, expressed once
in `prose.css` against a `.block` class, rather than per-block margins.

**Content seam.** Pages import only from `lib/queries.ts`. Moving to a live
dataset means reimplementing those functions as GROQ projections returning the
same shapes — no page or component changes.

## Calls I made

These are mine, not the spec's. Each is cheap to reverse.

**Route shape.** §3.4 gives `basePath` as `/blog/gifting-guides` and
`{basePath}/page/{n}`, which fixes the archive URLs but leaves post URLs open.
Posts nest under their category — `/blog/{category}/{slug}` — so the
`BreadcrumbList` is the real path and there is no collision between a category
slug and a post slug. `page` is therefore a reserved slug segment, enforced in
the category schema's validation.

**Placeholder imagery.** The prototype used drag-and-drop image slots, which do
not survive an export. `public/placeholder/*.svg` are generated stand-ins that
say PLACEHOLDER on their face, so nothing can be mistaken for selected
photography (§6). Ratios and crops are the spec; the images are not. Some
fixture posts deliberately have no `heroImage` so the §3.1 monogram fallback
renders on the index, an archive and the related row.

**Archive tag filtering is not wired.** The filter row renders as real links
with live counts, but narrowing does nothing yet: with static output a `?tag=`
query cannot re-render server-side. Two ways to finish it, and the choice
matters beyond this row — see Open questions.

**`isFeatured` picks the hero.** §2 defines the flag as "eligible for the index
hero" without saying how one is chosen. The newest eligible post wins.

**Forms post to `/api/*`.** The three forms (newsletter, in-feed CTA, gated
download) progressively enhance from a real POST to `fetch()`, and implement the
full §3.10 state machine — submitting, success-in-place, error-with-retry. The
endpoints do not exist; they are one file each once the ESP is chosen.

## Two things worth knowing before you extend this

**Never write a bare `<` in Astro frontmatter, even inside a comment.** The
compiler reads it as the start of markup and silently drops `Props` inference,
leaving every prop in that component typed `any` with no error until you call a
method on one. This bit `TableOfContents.astro` (a comment reading `< 900px`).
`npm run check` catches it; a plain `astro build` does not.

**The skeleton is built but unused.** `PostCardSkeleton.astro` implements §3.3
exactly, and nothing imports it. That is deliberate per §7 — Astro's static
output means URL-driven pagination never shows a loading state. It becomes real
the moment filtering goes client-side; if you decide filtering stays static,
delete the file rather than keeping it warm.

## Sanity schemas

`src/sanity/schemas/` is a deliverable for whoever stands the Studio up, not
something this build imports — this project has no `sanity` dependency, and
`tsconfig.json` excludes the directory from the front-end typecheck. Copy it
into the Studio project, `npm i sanity`, and register `schemaTypes`.

The validation rules encode the spec's hard constraints rather than leaving them
to editorial discipline: `alt` required on every image (§4.3's one hard block),
pull quotes capped at 220 chars, comparison tables at 3–5 columns, category
descriptions at 220–320 chars, `listId` required when a resource is gated, both
price fields or neither, and one FAQ per page (a document-level `faq` is
rejected when the body already contains an FAQ block, §4.8).

## Open questions — §7, still yours

The spec closes with four decisions it explicitly left to you. All four are
still open, and each has a specific consequence here:

1. **Per-category accent colours.** Every category label currently renders in
   `--brand-green`. Adding per-category accents means one token per category and
   a `data-category` hook on `Chip` — the component is already the single place
   that renders a category label.
2. **A `/guides` landing page.** `GuidesModule` links to `/guides`, and the
   footer does too. Neither route exists, so both are currently dead links.
3. **Author pages.** `AuthorBio` links to `/authors/{slug}` on the assumption
   they exist. That route does not exist either. Drop the link or build the page.
4. **The ESP.** Determines the form-submission path for all three forms above.

One more, which came out of building rather than the spec: **does archive
filtering go static or client-side?** Static (`/blog/{category}/tag/{tag}`) keeps
everything crawlable and means the §3.3 skeleton is dead code forever.
Client-side makes the filter instant and makes the skeleton real, at the cost of
filtered views that search engines never see. I built the row so either works.

## Placeholder inventory (§6)

Everything §6 lists is present and flagged in a comment at the top of the file
that carries it. Nothing here is approved copy: article titles, deks, body copy,
quotes and FAQ answers are invented and unresearched; author names and bios are
fictional; all prices, lead times and the "forty people ops leads" survey are
made up; counts and metrics ("9,400 buyers", "12 guides") are illustrative and
need wiring to real derived values.

Two §6 items are resolved rather than carried over: the masthead search field is
a real GET form pointed at `/search` instead of a dead visual stand-in (build
that endpoint or delete the form — a dead search field is worse than none), and
the TOC share group's "Link" item now actually copies the URL. The LinkedIn and
email items are still glyph stand-ins needing real icons.

The prototype's `No image · fallback` caption is a spec annotation and is **not**
shipped — production fallback is the monogram tile only, as §6 requires.

The five categories are real; they came from the brief. Tags, the guides list and
the footer's Resources and Company columns are invented to prove the modules.

Type is Mulish standing in for licensed Proxima Nova, and Playfair Display for
the logo serif. `--font-sans` already names `"Proxima Nova"` first, so dropping
the licensed `.woff2` files into `public/fonts/` and adding `@font-face` rules is
the whole swap. Re-check the H1 optical size afterwards — Proxima runs slightly
narrower.
