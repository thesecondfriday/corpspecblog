# Get the Studio on the web — from a cold terminal

Your content is **already in Sanity**: 31 published documents in CSBLOG
(`8og1x4eu` / `production`). What's missing is the Studio — the app you edit
content in. `sanity.io/manage` is only the admin console (datasets, tokens,
members); it has no editor. That's why you saw nothing.

A Studio has to be built and uploaded from a machine that can reach sanity.io.
This build environment can't (its egress policy blocks the domain), so these
seven steps run on **your** machine. Budget five minutes.

---

## 0 · Check Node

```bash
node -v
```

Use **v22.20 or higher**. Astro 7 and Sanity 6 themselves only require 22.12,
but two transitive dependencies want more: `undici` (which is what
`@sanity/client` actually makes HTTP calls through) needs 22.19+, and `skills`
needs 22.20+. On 22.14 you get EBADENGINE warnings at install and a real risk of
a runtime failure inside the Sanity client.

```bash
nvm install 22.20 && nvm use 22.20     # or install Node 24 LTS
```

---

## 1 · Get the code

```bash
git clone https://github.com/thesecondfriday/corpspecblog
cd corpspecblog
git checkout claude/swag-content-hub-6ferhj
git pull                                # essential if the clone already existed
```

**If the clone already existed**, `git clone` fails with "destination path
already exists" and you keep whatever that directory had — which may predate the
commits that add the deploy script. `git pull` is what makes that safe.

Confirm you're on the right commit:

```bash
git log --oneline -1
```

Should print something ending in `Default the project id in the Sanity configs`.

---

## 2 · Install

```bash
npm install
```

Takes a minute or two. Warnings about deprecated transitive packages are normal;
errors are not.

---

## 3 · Log in to Sanity

This is the step you were missing. The CLI has its own login, separate from
being logged into sanity.io in a browser.

```bash
npx sanity login
```

It prints a list of providers and opens your browser. **Choose GitHub** — that's
the provider your Sanity account uses (`thesecondfriday`, GitHub). Picking
Google or email would create or log into a *different* account that has no
access to this project.

Confirm it worked:

```bash
npx sanity projects list
```

You should see:

```
Id         Name     Members
8og1x4eu   CSBLOG   1
```

If CSBLOG isn't listed, you're logged into the wrong account — run
`npx sanity logout`, then step 3 again and pick GitHub.

---

## 4 · Deploy the Studio

```bash
npm run studio:deploy
```

It builds the Studio and uploads it. The hostname is pinned in `sanity.cli.ts`,
so it won't prompt you to pick one. Expect roughly a minute of bundling, then:

```
Success! Studio deployed to https://corpspecblog.sanity.studio
```

**Open that URL.** Log in with GitHub. You'll land in a Studio titled
*The Swag Desk*, with a left-hand structure of:

```
Posts ──┬─ All posts          (5)
        ├─ Drafts
        ├─ Can headline the homepage
        ├─ Evergreen guides   (2)
        ├─ By category
        └─ By author
Authors      (4)
Categories   (5, in menu order)
Tags         (9)
Products     (2)
```

You can create and edit posts there immediately. That is your CMS.

I already added `https://corpspecblog.sanity.studio` to the project's CORS
origins, so it works on the first load — no CORS error to go fix.

---

## 5 · Run the blog locally

The Studio edits content; this is the site that renders it.

```bash
printf 'PUBLIC_SANITY_PROJECT_ID=8og1x4eu\nPUBLIC_SANITY_DATASET=production\n' > .env.local
npm run dev
```

- Blog → http://localhost:4321/blog
- Studio, embedded → http://localhost:4321/studio

Both localhost origins are already in CORS too.

*(Step 4 doesn't need `.env.local` — the configs default the project id. The
Astro site does need it.)*

---

## 6 · Add the images

**Expect the blog to look sparse at first.** The seeded posts have no images.
The connection I used to write the content can create documents but can't upload
binaries, so every post is currently rendering its *designed* no-image state:
the sage "CS" monogram tile on cards, initials circles instead of author photos,
a text-only product spotlight. Nothing is broken — those are the fallbacks the
spec calls for — but it isn't the design with photography in it.

Fastest fix, now that you're logged in and unblocked:

```bash
# Create an Editor token first: https://www.sanity.io/manage/project/8og1x4eu/api#tokens
SANITY_WRITE_TOKEN=sk... npm run seed
```

That uploads 12 placeholder images and 2 PDFs, then rewrites the documents to
reference them. Re-runnable — it updates rather than duplicating.

Or skip it and drag real photos onto the image fields in the Studio, which is
what the original brief actually asked for ("drop-in image slots I fill with
real photos myself").

---

## 7 · Optional: push the schema

```bash
npm run schema:deploy
```

Not needed for the Studio to work — a deployed Studio carries its own schema.
This publishes the schema to the Content Lake so other Sanity tooling (and the
MCP connection) can read the field definitions. Harmless, and useful later.

---

## Troubleshooting

**`npm error Missing script: "studio:deploy"`** — one of two things. Either
you're not in the repo directory (`pwd` should end in `/corpspecblog`), or your
checkout predates the commit that added the script. `git pull`, then
`npm run` on its own to list what's available.

**`sanity: command not found`** — use `npx sanity …` or the `npm run` scripts;
the CLI is a local dependency, not global.

**`Error: No project ID found`** — you're not in the repo root. `cd` to the
directory containing `sanity.cli.ts`.

**Deploy says the hostname is taken** — `corpspecblog` was claimed by someone
else in the interim. Edit `studioHost` in `sanity.cli.ts` to something free,
redeploy, then add the new URL at
https://www.sanity.io/manage/project/8og1x4eu/cors — origin
`https://<yourhost>.sanity.studio`, **Allow credentials ticked**.

**Studio loads but shows "Not authorized"** — you're signed into the Studio with
a different account than the one that owns the project. Sign out inside the
Studio and back in with GitHub.

**Studio loads but shows no documents** — check the dataset switcher reads
`production`.

**Two posts show a validation warning** — expected. The `resourceDownload`
blocks require a PDF and don't have one yet; step 6 attaches them.

---

## Housekeeping

**Rotate the Editor token you pasted into chat** —
https://www.sanity.io/manage/project/8og1x4eu/api#tokens. Treat it as
compromised regardless.

**All seeded content is placeholder** (Component Spec §6). Author names are
fictional; every price, lead time and the "forty people ops leads" survey is
invented. The five categories are real — they came from your brief.
