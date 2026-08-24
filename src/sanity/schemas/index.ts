/*
 * The full schema registry for the Studio.
 *
 * NOT WIRED UP: this project is the Astro front end only — it has no Studio and
 * does not depend on `sanity`, so these files are a deliverable for whoever
 * stands the Studio up, not something the build imports. Copy this directory
 * into the Studio project, `npm i sanity`, and register:
 *
 *   import { schemaTypes } from "./schemas";
 *   export default defineConfig({ schema: { types: schemaTypes }, ... });
 *
 * Until then the imports below will not resolve, which is why tsconfig excludes
 * this directory from the front-end typecheck.
 */

import { post } from "./documents/post";
import { author, category, product, tag } from "./documents";
import {
  callout,
  comparisonTable,
  faqBlock,
  faqItem,
  imagePair,
  inlineImage,
  newsletterInline,
  portableText,
  productSpotlight,
  pullQuote,
  resourceDownload,
  seo,
} from "./objects";

export const schemaTypes = [
  // §2 documents
  post,
  category,
  author,
  tag,
  product,
  // Shared objects
  seo,
  faqItem,
  portableText,
  // §4 insertable body blocks
  pullQuote,
  inlineImage,
  imagePair,
  productSpotlight,
  comparisonTable,
  callout,
  resourceDownload,
  faqBlock,
  newsletterInline,
];
