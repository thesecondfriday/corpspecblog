# The Swag Desk

Content hub for Corporate Specialties — an education-first blog for B2B swag
buyers. Astro front end, Sanity CMS.

- **Studio (edit content):** https://corpspecblog.sanity.studio
- **Sanity project:** CSBLOG · `8og1x4eu` · dataset `production`

## Quick start

```bash
nvm use 22.20                # 22.20+ required
npm install
printf 'PUBLIC_SANITY_PROJECT_ID=8og1x4eu\nPUBLIC_SANITY_DATASET=production\n' > .env.local
npm run dev
```

- Blog → http://localhost:4321/blog
- Studio, embedded → http://localhost:4321/studio

| Command | |
| --- | --- |
| `npm run dev` | site + embedded Studio |
| `npm run build` | static build (fetches content from Sanity) |
| `npm run check` | typecheck — currently 0 errors |
| `npm run verify` | walk the built HTML, assert every component rendered |
| `npm run seed` | write placeholder content + images (needs `SANITY_WRITE_TOKEN`) |
| `npm run studio:deploy` | redeploy the hosted Studio |
| `npm run schema:validate` | validate the schema without deploying |

## Layout

```
src/
  components/        page components (§3) and article body blocks (§4)
  layouts/           the page shell
  pages/blog/        index, category archive, single post
  pages/preview/     draft preview — the only non-prerendered route
  sanity/schemaTypes/  the CMS schema
  sanity/lib/        client, GROQ queries, image builder
  styles/tokens.css  every colour, type step and space in the design system
scripts/             seed, offline verification harness
project/, chats/     the original Claude Design handoff bundle
```

## Docs

| File | |
| --- | --- |
| [`DEPLOYING.md`](DEPLOYING.md) | deploy, **and the rebuild webhook** |
| [`GETTING-STARTED.md`](GETTING-STARTED.md) | Studio setup from a cold terminal |
| [`IMPLEMENTATION-NOTES.md`](IMPLEMENTATION-NOTES.md) | how the design spec maps onto the code |
| [`FIELD-INVENTORY.md`](FIELD-INVENTORY.md) | every component prop → schema field |
| [`project/README.md`](project/README.md) | the original design handoff |

The design spec these were built from is
[`project/Component Spec.dc.html`](project/Component%20Spec.dc.html). Section
references throughout the code (§3.1, §4.6…) point at it.

## Outstanding

- **The rebuild webhook is not wired.** Until it is, publishing in the Studio
  does not change the live site — see `DEPLOYING.md` part 2.
- **Forms 404.** `/api/subscribe`, `/api/strategist`, `/api/resource` do not
  exist. The forms are built; they need an ESP and three endpoints.
- **Dead links:** `/quote`, `/products`, `/guides`, `/search`, `/authors/{slug}`.
  `/quote` matters most — it is the primary CTA on every page.
- **Images.** Seeded content is text-only; run `npm run seed` or add real
  photography in the Studio.
- **All seeded copy is placeholder** (Component Spec §6). Author names are
  fictional; prices and lead times are invented. The five categories are real.
