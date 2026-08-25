// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import { createClient } from "@sanity/client";

/*
 * astro.config.mjs runs at config time, before Astro's env loading, so
 * import.meta.env.PUBLIC_* is not available here. loadEnv reads the same
 * PUBLIC_ variables the pages use. Inside .astro files, keep using
 * import.meta.env directly — this shim is config-only.
 */
const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

/*
 * Defaulted rather than required. A host that builds this repo without env vars
 * set would otherwise fail with an opaque error from inside the Sanity
 * integration. These are public identifiers — they ship in the client bundle —
 * so a default costs nothing and removes a first-deploy failure.
 */
const PUBLIC_SANITY_PROJECT_ID =
  env.PUBLIC_SANITY_PROJECT_ID ?? env.SANITY_PROJECT_ID ?? "8og1x4eu";
const PUBLIC_SANITY_DATASET =
  env.PUBLIC_SANITY_DATASET ?? env.SANITY_DATASET ?? "production";
const PUBLIC_SANITY_API_HOST = env.PUBLIC_SANITY_API_HOST ?? env.SANITY_API_HOST;

/*
 * Optional read token, needed only for a private dataset. Never PUBLIC_
 * prefixed — it must not reach the browser. See src/sanity/lib/client.ts for
 * why a missing token here is so easy to misdiagnose.
 */
const SANITY_READ_TOKEN = env.SANITY_READ_TOKEN || env.SANITY_VIEWER_TOKEN || undefined;

/*
 * Flag 7 — `redirectFrom` is the one field no component can render: it is a
 * routing concern, so it is consumed here.
 *
 * Editors list old paths on a post; this turns them into real redirects at
 * build time. Fails soft: an unreachable dataset costs you redirects, not the
 * whole build, and says so loudly.
 */
async function redirectsFromSanity() {
  if (!PUBLIC_SANITY_PROJECT_ID || !PUBLIC_SANITY_DATASET) return {};

  try {
    const client = createClient({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      apiVersion: "2026-08-24",
      useCdn: false,
      perspective: "published",
      ...(SANITY_READ_TOKEN ? { token: SANITY_READ_TOKEN } : {}),
      ...(PUBLIC_SANITY_API_HOST
        ? { apiHost: PUBLIC_SANITY_API_HOST, useProjectHostname: false }
        : {}),
    });

    const posts = await client.fetch(
      `*[_type == "post" && defined(slug.current) && count(redirectFrom) > 0]{
        "slug": slug.current,
        "category": category->slug.current,
        redirectFrom
      }`,
    );

    const map = {};
    for (const post of posts) {
      if (!post.category) continue;
      for (const from of post.redirectFrom ?? []) {
        if (map[from]) {
          console.warn(
            `[redirects] "${from}" is claimed by more than one post. Keeping ${map[from]}, ignoring /blog/${post.category}/${post.slug}.`,
          );
          continue;
        }
        map[from] = `/blog/${post.category}/${post.slug}`;
      }
    }

    if (Object.keys(map).length > 0) {
      console.log(`[redirects] ${Object.keys(map).length} from Sanity`);
    }
    return map;
  } catch (error) {
    console.warn(
      `[redirects] Could not reach Sanity (${error.message}). Building without redirectFrom entries.`,
    );
    return {};
  }
}

/*
 * A build-time content check, printed at the very top of the build log.
 *
 * The site is prerendered: if the Content Lake returns nothing, every
 * getStaticPaths returns an empty array and the build SUCCEEDS while producing
 * a site with no posts in it. That is the one failure mode here that looks
 * exactly like success, and it is the reason this function exists — so the log
 * always states, in one line, how much content the build actually saw.
 *
 * Fails soft. This is a diagnostic; it must never be the thing that breaks a
 * deploy.
 */
async function reportContent() {
  const target = `project ${PUBLIC_SANITY_PROJECT_ID}, dataset ${PUBLIC_SANITY_DATASET}`;

  try {
    const client = createClient({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      apiVersion: "2026-08-24",
      useCdn: false,
      perspective: "published",
      ...(SANITY_READ_TOKEN ? { token: SANITY_READ_TOKEN } : {}),
      ...(PUBLIC_SANITY_API_HOST
        ? { apiHost: PUBLIC_SANITY_API_HOST, useProjectHostname: false }
        : {}),
    });

    const counts = await client.fetch(`{
      "posts": count(*[_type == "post" && defined(slug.current)]),
      "categories": count(*[_type == "category" && defined(slug.current)]),
      "orphans": count(*[_type == "post" && defined(slug.current) && !defined(category->slug.current)])
    }`);

    console.log(`[content] ${target}, token ${SANITY_READ_TOKEN ? "sent" : "NOT sent"}`);
    console.log(
      `[content] ${counts.posts} post(s), ${counts.categories} category/ies published`,
    );

    if (counts.posts === 0) {
      console.warn(
        `[content] NO POSTS FOUND. The build will produce a site with an empty feed.`,
      );
      if (!SANITY_READ_TOKEN) {
        // The likeliest cause by far, and the one that gives no other signal:
        // an unauthenticated read of a private dataset returns 200 + nothing.
        console.warn(
          `[content] This build sent NO TOKEN. A private dataset answers an\n` +
            `[content] unauthenticated query with HTTP 200 and an empty result — it\n` +
            `[content] does not error. If the dataset above is private, set\n` +
            `[content] SANITY_READ_TOKEN to a Viewer token and redeploy.`,
        );
      } else {
        console.warn(
          `[content] A token was sent, so the dataset above genuinely has no\n` +
            `[content] published posts. Check you are pointed at the right dataset.`,
        );
      }
    }

    // A post whose category reference is missing or unpublished has no URL to
    // live at, so it is silently dropped from the routes. Say so.
    if (counts.orphans > 0) {
      console.warn(
        `[content] ${counts.orphans} post(s) have no published category and will NOT get a page.`,
      );
    }
  } catch (error) {
    console.warn(
      `[content] Could not reach Sanity (${target}): ${error.message}\n` +
        `[content] The build will continue and produce an empty feed.`,
    );
  }
}

await reportContent();

/**
 * The hub is a static site: Astro ships HTML with no client framework, which is
 * what the brief means by "needs to be read by ai bots".
 *
 * The adapter is here for the draft preview routes only — every other page is
 * prerendered to static HTML at build time. See src/pages/preview/.
 *
 * Swapping hosts is a one-line change: @astrojs/netlify, @astrojs/cloudflare
 * and @astrojs/node all drop in here. If you decide you do not need to preview
 * unpublished drafts, delete src/pages/preview/ and src/pages/api/preview*.ts,
 * remove the adapter entirely, and the output becomes pure static — deployable
 * to any CDN or object store.
 */
export default defineConfig({
  site: "https://corporatespecialties.com",
  adapter: vercel(),
  redirects: {
    // The hub lives under /blog; the storefront owns the real root.
    "/": "/blog",
    ...(await redirectsFromSanity()),
  },
  integrations: [
    react(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false,
      apiVersion: "2026-08-24",
      // Embedded Studio. See IMPLEMENTATION-NOTES.md for why this over hosted.
      studioBasePath: "/studio",
    }),
  ],
});
