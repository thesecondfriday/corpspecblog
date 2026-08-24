// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import react from "@astrojs/react";

/*
 * astro.config.mjs runs at config time, before Astro's env loading, so
 * import.meta.env.PUBLIC_* is not available here. loadEnv reads the same
 * PUBLIC_ variables the pages use. Inside .astro files, keep using
 * import.meta.env directly — this shim is config-only.
 */
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

/**
 * The hub is a static site: Astro ships HTML with no client framework, which is
 * what the brief means by "needs to be read by ai bots". The only client JS is
 * the progressive-enhancement scripts (TOC, FAQ accordion, form submits) and
 * the Studio, which is its own island at /studio.
 *
 * `site` feeds absolute URLs in the structured data (src/lib/schema.ts).
 */
export default defineConfig({
  site: "https://corporatespecialties.com",
  redirects: {
    // The hub lives under /blog; the storefront owns the real root.
    "/": "/blog",
  },
  integrations: [
    react(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      // Content is fetched at build time, so the CDN would only serve staleness.
      useCdn: false,
      apiVersion: "2026-08-24",
      // Embedded Studio. See IMPLEMENTATION-NOTES.md for why this over hosted.
      studioBasePath: "/studio",
    }),
  ],
});
