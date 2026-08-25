# Deploying

Two things, in this order — the webhook needs a URL that only exists once the
site is deployed.

---

# Part 1 · Deploy the site

The repo is configured for **Vercel** (`@astrojs/vercel` in `astro.config.mjs`).
Switching to another host is a one-line change — see "Other hosts" at the bottom.

## 1 · Push the branch, or merge it

Vercel builds a branch. Either merge `claude/swag-content-hub-6ferhj` into `main`
first, or point Vercel at the branch directly in step 3.

## 2 · Import the repo

1. Go to https://vercel.com/new
2. Sign in with GitHub, **Import** `thesecondfriday/corpspecblog`
3. Vercel detects Astro on its own — leave framework, build command and output
   directory at their defaults. Do not override them.

## 3 · Set the production branch

If you did not merge to `main`: Project → **Settings → Git → Production Branch**
→ `claude/swag-content-hub-6ferhj`.

## 4 · Environment variables

Project → **Settings → Environment Variables**. Add to **Production** *and*
**Preview**:

| Name | Value | Needed for |
| --- | --- | --- |
| `PUBLIC_SANITY_PROJECT_ID` | `8og1x4eu` | the site |
| `PUBLIC_SANITY_DATASET` | `production` | the site |
| `SANITY_VIEWER_TOKEN` | a **Viewer** token | draft preview only |
| `PREVIEW_SECRET` | any random string | draft preview only |

The first two are defaulted in the config, so the build succeeds without them —
set them anyway, so pointing at a different dataset is a config change rather
than a code change. The last two are only needed if you want `/preview/…` to
work; leave them out and the rest of the site is unaffected.

Viewer token: https://www.sanity.io/manage/project/8og1x4eu/api#tokens —
**Viewer**, not Editor. It only needs to read drafts.

## 5 · Deploy

Click **Deploy**. First build takes 2–4 minutes. You get a URL like
`corpspecblog.vercel.app`.

Check `https://<your-url>/blog` — five posts, five categories, the hero, the
reference shelf.

## 6 · Tell Sanity about the domain

Only needed because the Studio is also embedded at `/studio` on your domain.
Add the origin at
https://www.sanity.io/manage/project/8og1x4eu/cors:

- Origin: `https://corpspecblog.vercel.app` (and your custom domain later)
- **Allow credentials: ticked**

Without this the embedded Studio shows a CORS error. The public blog is
unaffected either way — it fetches at build time, from the server, where CORS
does not apply.

## 7 · Custom domain

Project → **Settings → Domains** → add it, follow the DNS instructions. Then add
that origin to CORS as well (step 6), and update `site` in `astro.config.mjs` —
it is currently `https://corporatespecialties.com` and it feeds the canonical
URLs and structured data. Wrong value there means wrong canonicals.

---

# Part 2 · The rebuild webhook

**Without this, publishing in the Studio changes nothing on the live site.**
The site is built statically: content is baked in at build time. The webhook is
what tells Vercel to rebuild when content changes.

## 1 · Create a Deploy Hook in Vercel

Project → **Settings → Git → Deploy Hooks**.

- Name: `sanity-publish`
- Branch: your production branch
- **Create Hook**, then copy the URL. It looks like
  `https://api.vercel.com/v1/integrations/deploy/prj_XXXX/YYYY`

Treat it like a password — anyone with it can trigger builds.

## 2 · Create the webhook in Sanity

Go to https://www.sanity.io/manage/project/8og1x4eu/api/webhooks → **Create
webhook**:

| Field | Value |
| --- | --- |
| Name | `Rebuild site on publish` |
| URL | the Deploy Hook URL from step 1 |
| Dataset | `production` |
| Trigger on | **Create**, **Update**, **Delete** |
| Filter | `_type in ["post","author","category","tag","product"]` |
| Projection | leave empty |
| HTTP method | `POST` |
| API version | `v2021-03-25` |
| Secret | leave empty |

The **filter** matters. Without it every asset upload and every draft keystroke
triggers a production build. With it, only the five content types that actually
change the site do.

### Drafts do not trigger builds

Sanity fires webhooks for draft edits too — those documents have ids starting
`drafts.`. The filter above does not exclude them, which means saving a draft
would rebuild the site for no reason. Add this to the filter to stop that:

```
_type in ["post","author","category","tag","product"] && !(_id in path("drafts.**"))
```

Use that version. It rebuilds on publish and on delete, and ignores draft
editing entirely.

## 3 · Test it

1. Open https://corpspecblog.sanity.studio
2. Change a post headline, hit **Publish**
3. Vercel → **Deployments** — a new build should start within a few seconds
4. When it goes green, the live site shows the new headline

If nothing happens: Sanity's webhook page has a **Delivery log** (or "Attempts")
showing each call and the response code. A 401/403 means the Deploy Hook URL is
wrong or was regenerated. No entry at all means the filter excluded the change.

---

## What this does not cover

- **Forms.** `/api/subscribe`, `/api/strategist` and `/api/resource` do not
  exist yet, so every form submission 404s. The forms themselves are fully
  built — they just have no endpoint. Blocked on choosing an ESP.
- **Dead links.** `/quote`, `/products`, `/guides`, `/search` and
  `/authors/{slug}` are linked but do not exist. `/quote` is the one that
  matters — it is the primary CTA on every page.
- **Images.** Run `SANITY_WRITE_TOKEN=sk... npm run seed` to upload the
  placeholders, or add real ones in the Studio.

---

## Other hosts

One line in `astro.config.mjs` plus the matching package:

| Host | Package | Config |
| --- | --- | --- |
| Netlify | `@astrojs/netlify` | `adapter: netlify()` |
| Cloudflare | `@astrojs/cloudflare` | `adapter: cloudflare()` |
| Any Node server | `@astrojs/node` | `adapter: node({ mode: "standalone" })` |
| **Any CDN, no server** | none | delete the adapter *and* `src/pages/preview/` + `src/pages/api/preview*.ts` |

That last row is worth considering. The adapter exists **only** for draft
preview. Drop that feature and the whole site becomes static files, deployable
anywhere, with no server runtime at all. Every other page is already prerendered.

Each host has its own equivalent of a Deploy Hook — Netlify calls it a Build
Hook, Cloudflare a Deploy Hook. Part 2 is otherwise identical.
