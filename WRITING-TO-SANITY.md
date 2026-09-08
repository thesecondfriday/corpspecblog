# Writing to Sanity

How to run anything that changes content — the blog migration, the seed script,
and whatever bulk edits come next. Set this up once and you will not think about
it again.

---

## The one rule

**There are two kinds of Sanity credential and they live in different places.**

| | Read (Viewer) | Write (Editor) |
| --- | --- | --- |
| What it can do | Read documents, including drafts | Create, overwrite and **delete** anything |
| Who needs it | The deployed site, every build | Scripts you run by hand |
| Where it goes | Vercel env vars, and `.env.local` | **`.env.local` only** |
| In Vercel? | Yes — `SANITY_READ_TOKEN`, `SANITY_VIEWER_TOKEN` | **Never** |

A write token in Vercel gives your public site permanent delete rights over
production content, in exchange for nothing — the site only ever reads. That is
the whole reasoning; everything below follows from it.

Never give any token a `PUBLIC_` prefix. That prefix is what ships a value to
the browser.

---

## One-time setup

```bash
cp .env.local.example .env.local
```

Create an **Editor** token at
https://www.sanity.io/manage/project/8og1x4eu/api#tokens — *Add API token*,
name it something you will recognise in a year (`content-scripts`), role
**Editor**, Save. Copy it immediately; Sanity shows it exactly once.

Paste it into `.env.local`:

```
SANITY_WRITE_TOKEN=sk...
```

Done. `.env.local` is gitignored, so it never reaches GitHub, and every script
here loads it automatically via `--env-file-if-exists`. You will never type a
token on the command line, which also keeps it out of your shell history.

To check it worked:

```bash
npm run migrate:blog:dry
```

---

## Running a bulk write safely

The migration script is built as the template for this. Four habits, in order:

**1. Dry run first, always.** Every write script here takes `--dry-run` and
writes a CSV report instead of touching the dataset. Read the report. The
`warnings` column is the point of it.

```bash
npm run migrate:blog:dry      # writes migration/output/dry-run-report.csv
```

**2. Rehearse on a scratch dataset if the change is large or unfamiliar.**

```bash
npm run migrate:blog -- --dataset=staging
```

Create the dataset first in *Manage → Datasets*. This is the difference between
finding a mistake in a sandbox and finding it in production.

**3. Use deterministic document IDs.** Every document this script writes gets an
ID derived from its slug (`drafts.post-<slug>`) and is written with
`createOrReplace`. Running it twice **updates** rather than duplicating. A
script without this property is one you can only safely run once, which means a
half-finished run leaves you with no clean way to resume.

**4. Import as drafts.** Nothing goes live until someone presses Publish in the
Studio. Drafts are `drafts.`-prefixed IDs; that prefix is the whole mechanism.

---

## Token hygiene

- **One named token per purpose**, not one shared token for everything. When you
  need to revoke, you want to revoke one thing, not break everything at once.
- **Sanity tokens do not expire.** Nothing reminds you they exist. Delete ones
  you have stopped using at the tokens page above.
- **If a token is ever pasted somewhere public** — a chat, an issue, a
  screenshot, a commit — delete it at the tokens page and create a new one.
  Deleting is instant and total. Do not try to assess whether anyone saw it.
- **Never commit `.env.local`.** It is gitignored, so this takes deliberate
  effort, but `git add -f` would do it. If it ever happens, rotate the token —
  removing the commit is not enough, git keeps history.

---

## Where things are

| Thing | Path |
| --- | --- |
| Env template | `.env.local.example` |
| Your real env (gitignored) | `.env.local` |
| Blog migration | `scripts/migrate-blog.mjs` |
| Seed / placeholder content | `scripts/seed.mjs` |
| Reports and mapping files | `migration/output/` |
| Deploy + Vercel env vars | `DEPLOYING.md` |

`npm run` targets that touch content:

```
npm run migrate:blog:dry     report only, writes nothing
npm run migrate:blog         import the legacy blog posts as drafts
npm run seed:dry             report only, writes nothing
npm run seed                 placeholder editorial content
```
