// @ts-check
import { defineConfig } from "astro/config";

/**
 * The hub is a static site: Astro ships HTML with no client framework, which is
 * what the brief means by "needs to be read by ai bots". The only client JS is
 * the three progressive-enhancement scripts (TOC, FAQ accordion, form submits).
 *
 * `site` feeds absolute URLs in the structured data (src/lib/schema.ts).
 */
export default defineConfig({
  site: "https://corporatespecialties.com",
  redirects: {
    // The hub lives under /blog; the storefront owns the real root.
    "/": "/blog",
  },
});
