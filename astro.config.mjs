// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import react from "@astrojs/react";
import node from "@astrojs/node";
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
const PUBLIC_SANITY_PROJECT_ID = env.PUBLIC_SANITY_PROJECT_ID ?? "8og1x4eu";
const PUBLIC_SANITY_DATASET = env.PUBLIC_SANITY_DATASET ?? "production";
const PUBLIC_SANITY_API_HOST = env.PUBLIC_SANITY_API_HOST;

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

/**
 * The hub is a static site: Astro ships HTML with no client framework, which is
 * what the brief means by "needs to be read by ai bots".
 *
 * The Node adapter is here for the draft preview routes only — everything else
 * is prerendered. See src/pages/preview/. That does mean the deployment target
 * has to run Node rather than being pure static hosting; if you would rather
 * deploy to a CDN, drop the adapter and the preview routes together.
 */
export default defineConfig({
  site: "https://corporatespecialties.com",
  adapter: node({ mode: "standalone" }),
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
