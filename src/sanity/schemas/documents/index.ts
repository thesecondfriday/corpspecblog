/*
 * Component Spec §2 — the four remaining document types.
 * post lives in its own file because it carries the most validation.
 */

import { defineArrayMember, defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) =>
        rule.required().custom((slug) =>
          // `page` is the reserved segment in /blog/{category}/page/{n}.
          (slug as { current?: string })?.current === "page"
            ? 'A category cannot be slugged "page" — it collides with the pagination route.'
            : true,
        ),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 4,
      description: "Renders in the category header. One paragraph, 220–320 chars.",
      validation: (rule) => rule.required().min(220).max(320),
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Fixes the order of the category nav.",
      validation: (rule) => rule.required().integer(),
    }),
  ],
  orderings: [{ name: "order", title: "Nav order", by: [{ field: "order", direction: "asc" }] }],
});

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "role", type: "string" }),
    defineField({
      name: "avatar",
      type: "image",
      options: { hotspot: true },
      description: "Optional — without it the byline renders an initials circle.",
      fields: [defineField({ name: "alt", type: "string", validation: (r) => r.required() })],
    }),
    defineField({
      name: "bio",
      type: "text",
      rows: 4,
      description:
        "2–3 sentences. Without it the author bio block is omitted entirely — there is no empty state (§3.9).",
    }),
    defineField({
      name: "links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "url", type: "url", validation: (r) => r.required() }),
          ],
        }),
      ],
    }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "avatar" } },
});

export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  description: "Tags are cross-category (§7). The archive filter row shows tags, not sub-categories.",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
  ],
});

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  description: "Referenced by the product spotlight block (§4.4).",
  fields: [
    defineField({ name: "name", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name" },
      description: "Links to the storefront when present.",
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string", validation: (r) => r.required() })],
    }),
    defineField({
      name: "oneLiner",
      type: "string",
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: "priceLow",
      type: "number",
      description: "Both price fields or neither — the line is omitted if either is missing.",
      validation: (rule) =>
        rule.custom((low, context) => {
          const high = (context.document as { priceHigh?: number } | undefined)?.priceHigh;
          if ((low === undefined) !== (high === undefined)) {
            return "Set both priceLow and priceHigh, or neither (§4.4).";
          }
          if (low !== undefined && high !== undefined && low > high) {
            return "priceLow must not exceed priceHigh.";
          }
          return true;
        }),
    }),
    defineField({ name: "priceHigh", type: "number" }),
    defineField({ name: "minQty", type: "number", validation: (rule) => rule.integer().positive() }),
    defineField({
      name: "ctaLabel",
      type: "string",
      initialValue: "Request pricing",
    }),
  ],
  preview: { select: { title: "name", subtitle: "oneLiner", media: "image" } },
});
