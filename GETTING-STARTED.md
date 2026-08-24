# Getting the Studio on the web

**Your dataset is already seeded and live.** CSBLOG (`8og1x4eu` / `production`)
now holds 31 published documents: 5 posts (one per category), 5 categories,
9 tags, 4 authors, 2 products.

What is left is one command, because the Studio has to be *built and uploaded*
from a machine that can reach `sanity.io` — and this build environment cannot
(see "Why I couldn't do this part" below).

---

## The one command

```bash
git clone https://github.com/thesecondfriday/corpspecblog
cd corpspecblog && git checkout claude/swag-content-hub-6ferhj
npm install

# Point at the project (or copy the .env.local you already have)
printf 'PUBLIC_SANITY_PROJECT_ID=8og1x4eu\nPUBLIC_SANITY_DATASET=production\n' > .env.local

npm run studio:deploy
```

That publishes the Studio to **https://corpspecblog.sanity.studio** — already
added to the project's CORS origins, so it works on the first try, no prompt.
Log in with the same GitHub account and the seeded content is there.

To see the blog itself:

```bash
npm run dev     # site at localhost:4321, Studio also at localhost:4321/studio
```

Both read the same `sanity.config.ts`, so the schema can never drift between
the embedded Studio and the hosted one.

---

## Two things to finish

**1. Images.** The seeded content has none. The MCP connection I used to write
the content can create documents but cannot upload binaries, so every post
currently renders its designed no-image fallback: the sage "CS" monogram tile on
cards, initials circles instead of author photos, and a text-only product
spotlight. Nothing is broken — those are the states §3.1 and §4.4 specify — but
it is not what the design looks like with photography in it.

Two ways to fix, either is fine:

```bash
# a) Bulk: uploads 12 placeholder images + 2 PDFs and re-writes the documents
SANITY_WRITE_TOKEN=sk... npm run seed

# b) By hand: open the Studio and drag real photos onto each image field
```

Option (b) is closer to the original intent — the brief said "drop-in image
slots I fill with real photos myself" — but (a) gives you something to look at
in about thirty seconds.

**2. The two `resourceDownload` blocks have no PDF attached.** Same reason. The
schema requires a file, so those two blocks show a validation warning in the
Studio until one is uploaded. `npm run seed` attaches the placeholder PDFs in
`public/downloads/`. The front end renders the blocks either way.

---

## Why I couldn't do this part

Two different network paths, and only one of them was open to me:

```
  MCP path      me → mcp-proxy.anthropic.com → Sanity's MCP server → api.sanity.io
                     ^^^^^^ on the egress bypass list ^^^^^^          ^^^^^^^^^^^^
                                                            reached from THEIR network

  Direct path   me → egress policy gateway → api.sanity.io
                     ^^^ 403: sanity.io not on this org's allowlist
```

Everything under `sanity.io` is denied to this container — `api`, `cdn`, even
`www`. The proxy's own guidance is to report a 403 policy denial rather than
route around it, so I did not try.

That is why the content is seeded (MCP wrote it from Sanity's side) but the
Studio is not deployed (`sanity deploy` uploads a bundle directly, from here).
It is also why `npm run build` cannot run in this environment: Astro's
`getStaticPaths` calls the Sanity API directly at build time. On your machine,
or in your CI, none of this applies.

If you want builds to work in the Claude Code environment too, the fix is to
allow `*.api.sanity.io`, `*.apicdn.sanity.io` and `cdn.sanity.io` in the
environment's network policy — configured where the environment was created.

---

## What was verified, and how

`npm run check` → 0 errors. The rendered HTML was verified page by page against
the seed content: **131/131 checks across 11 pages**, covering every §4 block
type, both callout tones, the FAQ in both modes, TOC anchors matching heading
ids, JSON-LD for BlogPosting / FAQPage / BreadcrumbList, and the designed
fallbacks (no-image card, initials byline, omitted bio).

Because the API was blocked, that verification ran against a local server
(`scripts/local-dataset.mjs`) that serves the seed content through **groq-js** —
Sanity's own GROQ engine. So the real queries ran against the real content;
what it did *not* cover is dataset permissions, the drafts perspective, and real
asset transforms. Re-run it against the live dataset once you can:

```bash
npm run build && npm run verify
```

That verification caught one genuine bug: `faq` was missing from the `FULL`
GROQ projection, so document-level FAQs rendered nothing and emitted no
`FAQPage` JSON-LD — invisible in both the schema and the components. Fixed.

Two states the five-post seed is too small to reach were verified separately
with variant datasets: the empty archive (§3.6) and pagination past page 1
(§3.4). See `scripts/local-dataset.mjs --empty-category` and `--multiply`.

---

## Draft preview

`/api/preview?secret=…&slug=/blog/…` sets an httpOnly cookie and redirects to
`/preview/…`, which renders drafts through the *same* `PostView` the published
route uses. It needs a Viewer token in `.env.local`:

```
SANITY_VIEWER_TOKEN=sk...     # Viewer permission, not Editor
PREVIEW_SECRET=<any string>
```

This is the one feature that requires the Node adapter, and therefore a Node
runtime rather than pure static hosting. If you would rather deploy to a CDN,
delete `src/pages/preview/`, `src/pages/api/preview*.ts` and the adapter from
`astro.config.mjs` — everything else prerenders.

---

## Housekeeping

**Rotate the Editor token** you pasted into chat:
https://www.sanity.io/manage/project/8og1x4eu/api#tokens

**All seeded content is placeholder** per Component Spec §6. Author names are
fictional, and every price, lead time and the "forty people ops leads" survey is
invented. The five categories are real — they came from the brief.
