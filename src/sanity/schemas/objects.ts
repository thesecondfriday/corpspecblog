/*
 * Component Spec §4 — the article body blocks, as Sanity object schemas.
 *
 * These are INSERTABLE BLOCKS in the Portable Text array — each one appears in
 * the editor's insert menu. They are not styling applied to article content.
 * That distinction is the whole point of §4: each block is one schema
 * definition, one component, one data shape.
 *
 * §4.1 (prose defaults) is not a block — it is the `block` type's allowed
 * styles, lists and marks, configured in `portableText` at the bottom.
 */

import { defineArrayMember, defineField, defineType } from "sanity";

/* ---- Shared ------------------------------------------------------------- */

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "metaTitle", type: "string" }),
    defineField({ name: "metaDescription", type: "text", rows: 2 }),
    defineField({
      name: "ogImage",
      type: "image",
      fields: [defineField({ name: "alt", type: "string" })],
    }),
  ],
});

export const faqItem = defineType({
  name: "faqItem",
  title: "Question",
  type: "object",
  fields: [
    defineField({ name: "question", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "answer",
      type: "array",
      of: [defineArrayMember({ type: "block", styles: [{ title: "Normal", value: "normal" }] })],
      description: "One or two short paragraphs.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "question" } },
});

/* ---- §4.2 --------------------------------------------------------------- */

export const pullQuote = defineType({
  name: "pullQuote",
  title: "Pull quote",
  type: "object",
  description:
    "A display element, not a blockquote of body copy — the same words should not also appear in the running text.",
  fields: [
    defineField({
      name: "quote",
      type: "text",
      rows: 3,
      // Longer than 220 chars defeats the type size (§4.2).
      validation: (rule) => rule.required().max(220),
    }),
    defineField({ name: "attribution", type: "string" }),
    defineField({
      name: "attributionDetail",
      type: "string",
      description: "Role, company size.",
    }),
  ],
  preview: { select: { title: "quote", subtitle: "attribution" } },
});

/* ---- §4.3 --------------------------------------------------------------- */

export const inlineImage = defineType({
  name: "inlineImage",
  title: "Image with caption",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "caption", type: "string" }),
    defineField({ name: "credit", type: "string" }),
    defineField({
      name: "width",
      type: "string",
      options: {
        list: [
          { title: "Measure (default)", value: "measure" },
          { title: "Wide — breaks past the measure, desktop only", value: "wide" },
        ],
        layout: "radio",
      },
      initialValue: "measure",
    }),
    defineField({
      name: "ratio",
      type: "string",
      options: { list: ["3/2", "4/5", "1/1"] },
      initialValue: "3/2",
    }),
  ],
});

export const imagePair = defineType({
  name: "imagePair",
  title: "Two-up images",
  type: "object",
  description: "Stays two-up down to 390px — the block exists to hold two things side by side (§7).",
  fields: [
    defineField({
      name: "images",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", type: "string", validation: (r) => r.required() }),
            defineField({ name: "caption", type: "string" }),
          ],
        }),
      ],
      validation: (rule) => rule.required().length(2).error("Exactly two images."),
    }),
    defineField({
      name: "ratio",
      type: "string",
      description: "Shared — both crops are identical.",
      options: { list: ["4/5", "3/2", "1/1"] },
      initialValue: "4/5",
    }),
  ],
});

/* ---- §4.4 --------------------------------------------------------------- */

export const productSpotlight = defineType({
  name: "productSpotlight",
  title: "Product spotlight",
  type: "object",
  fields: [
    defineField({
      name: "product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ctaHref",
      type: "string",
      description:
        "The quote form with the SKU prefilled, not the product page — unless product.slug is set and you deliberately choose 'View product'.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "product.name", media: "product.image" } },
});

/* ---- §4.5 --------------------------------------------------------------- */

export const comparisonTable = defineType({
  name: "comparisonTable",
  title: "Comparison table",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: 'Eyebrow, e.g. "Compare · best drinkware for remote kits".',
    }),
    defineField({
      name: "columns",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      // 6 columns cannot be read on mobile (§4.5).
      validation: (rule) => rule.required().min(3).max(5),
    }),
    defineField({
      name: "rows",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "row",
          fields: [
            defineField({
              name: "cells",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              description: "The first cell is the row label.",
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "footnote",
      type: "string",
      description: "Sourcing and date. Strongly encouraged.",
    }),
    defineField({
      name: "highlightRow",
      type: "number",
      description: "Row index for an editor's pick. Leave empty for none.",
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  preview: { select: { title: "label" } },
});

/* ---- §4.6 --------------------------------------------------------------- */

export const callout = defineType({
  name: "callout",
  title: "Callout",
  type: "object",
  fields: [
    defineField({
      name: "tone",
      type: "string",
      options: {
        list: [
          { title: "Tip", value: "tip" },
          { title: "Caution", value: "caution" },
        ],
        layout: "radio",
      },
      initialValue: "tip",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      type: "string",
      description:
        'Defaults to "Tip" / "Watch out". An empty string suppresses the label row entirely.',
    }),
    defineField({
      name: "body",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
        }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { subtitle: "tone" }, prepare: ({ subtitle }) => ({ title: "Callout", subtitle }) },
});

/* ---- §4.7 --------------------------------------------------------------- */

export const resourceDownload = defineType({
  name: "resourceDownload",
  title: "Downloadable resource",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "file", type: "file", validation: (rule) => rule.required() }),
    defineField({
      name: "pageCount",
      type: "number",
      description: 'Feeds the derived format line, "PDF · {n} pages".',
    }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({
      name: "gated",
      type: "boolean",
      description: "Gating is email-only per the brief: one field, no company, no phone.",
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "formatLabel", type: "string" }),
    defineField({ name: "submitLabel", type: "string", initialValue: "Send me the PDF" }),
    defineField({
      name: "listId",
      type: "string",
      description: "ESP list. Required when gated.",
      validation: (rule) =>
        rule.custom((listId, context) => {
          const gated = (context.parent as { gated?: boolean } | undefined)?.gated;
          return gated && !listId ? "A gated resource needs a listId (§4.7)." : true;
        }),
    }),
    defineField({
      name: "reassurance",
      type: "string",
      initialValue: "Email only. No follow-up sequence.",
    }),
    defineField({
      name: "thumbnail",
      type: "image",
      description: 'Optional cover. Without it the ungated variant shows the sage "PDF" plate.',
      fields: [defineField({ name: "alt", type: "string" })],
    }),
  ],
  preview: { select: { title: "title", subtitle: "gated" } },
});

/* ---- §4.8 --------------------------------------------------------------- */

export const faqBlock = defineType({
  name: "faqBlock",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string", initialValue: "Common questions" }),
    defineField({
      name: "items",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "display",
      type: "string",
      description: "Recommend `open` for 4 items or fewer at any width.",
      options: {
        list: [
          { title: "Open", value: "open" },
          { title: "Accordion", value: "accordion" },
        ],
        layout: "radio",
      },
      initialValue: "open",
    }),
  ],
});

/* ---- §3.10, offered as a body block ------------------------------------- */

export const newsletterInline = defineType({
  name: "newsletterInline",
  title: "Newsletter signup",
  type: "object",
  fields: [
    defineField({ name: "heading", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "body", type: "text", rows: 2 }),
    defineField({ name: "placeholder", type: "string", initialValue: "Work email" }),
    defineField({ name: "submitLabel", type: "string", initialValue: "Subscribe" }),
    defineField({ name: "proofLine", type: "string" }),
    defineField({ name: "listId", type: "string", validation: (rule) => rule.required() }),
  ],
});

/* ---- §4.1 — the prose defaults, as the Portable Text field --------------- */

export const portableText = defineType({
  name: "portableText",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      // No h1 (the page owns it), no h4+.
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        // Reserved for imported content — editors get the pullQuote block (§4.2).
        { title: "Quote (imported content only)", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        // No underline, no text colour, no font-size overrides, no centred text.
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Code", value: "code" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              defineField({ name: "href", type: "url", validation: (r) => r.required() }),
            ],
          },
        ],
      },
    }),
    // The §4 insertable blocks.
    defineArrayMember({ type: "pullQuote" }),
    defineArrayMember({ type: "inlineImage" }),
    defineArrayMember({ type: "imagePair" }),
    defineArrayMember({ type: "productSpotlight" }),
    defineArrayMember({ type: "comparisonTable" }),
    defineArrayMember({ type: "callout" }),
    defineArrayMember({ type: "resourceDownload" }),
    defineArrayMember({ type: "faqBlock" }),
    defineArrayMember({ type: "newsletterInline" }),
  ],
});
