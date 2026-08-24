/*
 * The schema registry. Registered in sanity.config.ts.
 *
 * Type names are load-bearing: `post`, `category`, `author`, `tag`, `product`
 * are queried by name in src/sanity/lib/queries.ts, and every block name under
 * blocks/ is a `_type` that src/components/PortableText.astro switches on.
 * Renaming one here silently renders nothing there.
 */

import type { SchemaTypeDefinition } from "sanity";

import { post } from "./documents/post";
import { author, category, product, tag } from "./documents";
import { faqItem } from "./objects/faqItem";
import { portableText } from "./objects/portableText";
import { seo } from "./objects/seo";
import {
  callout,
  comparisonTable,
  faqBlock,
  imagePair,
  inlineImage,
  newsletterInline,
  productSpotlight,
  pullQuote,
  resourceDownload,
} from "./blocks";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  post,
  category,
  author,
  tag,
  product,

  // Shared objects
  seo,
  faqItem,
  portableText,

  // §4 article body blocks
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
