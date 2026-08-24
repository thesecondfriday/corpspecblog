/*
 * Component Spec §2 — the `post` document.
 *
 * Field names match src/lib/types.ts exactly. Change one, change the other.
 */

import { defineArrayMember, defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "dek",
      title: "Dek",
      type: "text",
      rows: 3,
      description: "Also the meta description fallback.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 2,
      description: "Shown on the featured card variant only. Omit and the line disappears.",
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: "heroImage",
      type: "image",
      options: { hotspot: true },
      description: "Upload at 21:9 or wider — the hotspot drives the 3:2 mobile crop (§7).",
      fields: [
        defineField({
          name: "alt",
          type: "string",
          // §4.3 — an image with no alt fails validation. The one hard block.
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "caption", type: "string" }),
        defineField({ name: "credit", type: "string" }),
      ],
    }),
    defineField({
      name: "category",
      type: "reference",
      to: [{ type: "category" }],
      // §7 — one category per post; every card must carry one unambiguous label.
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "tag" }] })],
      description: "Cross-category. Drives the archive filter row.",
    }),
    defineField({
      name: "author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "updatedAt", type: "datetime" }),
    defineField({
      name: "readTime",
      type: "number",
      description: "Minutes. Leave empty to derive from body word count ÷ 220.",
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({
      name: "body",
      type: "portableText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "faq",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
      description:
        "Document-level FAQ, rendered between the body and the end CTA. Ignored if the body already contains an FAQ block (§4.8).",
      validation: (rule) =>
        rule.custom((faq, context) => {
          const body = (context.document?.body ?? []) as Array<{ _type?: string }>;
          const hasBodyFaq = body.some((node) => node._type === "faqBlock");
          if (hasBodyFaq && faq && (faq as unknown[]).length > 0) {
            return "This post already has an FAQ block in the body. One FAQ per page maximum (§4.8) — remove one.";
          }
          return true;
        }),
    }),
    defineField({
      name: "isGuide",
      title: "Evergreen guide",
      type: "boolean",
      description: "Routes this post into the Guides module.",
      initialValue: false,
    }),
    defineField({
      name: "isFeatured",
      title: "Eligible for the index hero",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "reviewedBy",
      type: "string",
      description: 'Shows in the byline as "Reviewed by {value}".',
    }),
    defineField({ name: "seo", type: "seo" }),
  ],

  preview: {
    select: { title: "title", subtitle: "category.title", media: "heroImage" },
  },
});
