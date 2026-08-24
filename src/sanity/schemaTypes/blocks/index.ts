/*
 * Component Spec §4 — the article body blocks.
 *
 * Each one is an INSERTABLE BLOCK in the Portable Text array: an object schema
 * the editor picks from the insert menu, not styling applied to article content.
 * The `name` of each type is the `_type` the front-end dispatcher switches on
 * (src/components/PortableText.astro) — renaming one here renders nothing there.
 */

import { BlockquoteIcon } from "@sanity/icons/Blockquote";
import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { DocumentPdfIcon } from "@sanity/icons/DocumentPdf";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { ImageIcon } from "@sanity/icons/Image";
import { ImagesIcon } from "@sanity/icons/Images";
import { PackageIcon } from "@sanity/icons/Package";
import { ThListIcon } from "@sanity/icons/ThList";
import { defineArrayMember, defineField, defineType } from "sanity";

/* ---- §4.2 Pull quote ----------------------------------------------------- */

export const pullQuote = defineType({
  name: "pullQuote",
  title: "Pull quote",
  type: "object",
  icon: BlockquoteIcon,
  description: "A quote lifted out at large size. Don't repeat text that's already in the article.",
  fields: [
    defineField({
      name: "quote",
      type: "text",
      rows: 3,
      description: "Type the quotation marks as part of the text — the design doesn't add them.",
      validation: (rule) =>
        rule
          .required()
          .error("A pull quote needs some text.")
          .max(220)
          .error("Keep it under 220 characters. Longer than that and it stops reading as a quote."),
    }),
    defineField({
      name: "attribution",
      title: "Who said it",
      type: "string",
      description: "Leave empty for an unattributed quote — the credit line disappears entirely.",
    }),
    defineField({
      name: "attributionDetail",
      title: "Their role or company",
      type: "string",
      description: 'Shows after the name, e.g. "People Ops Lead · 340-person SaaS".',
    }),
  ],
  preview: {
    select: { title: "quote", subtitle: "attribution" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Empty pull quote",
      subtitle: subtitle ? `— ${subtitle}` : "No attribution",
    }),
  },
});

/* ---- §4.3 Inline image --------------------------------------------------- */

export const inlineImage = defineType({
  name: "inlineImage",
  title: "Image with caption",
  type: "image",
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description:
        "Describe what's in the picture for readers using a screen reader. Required — this is the one thing the site won't publish without.",
      validation: (rule) =>
        rule.required().error("Alt text is required on every image. Describe what the picture shows."),
    }),
    defineField({
      name: "caption",
      type: "string",
      description: "Printed under the image. Leave empty and no caption line appears.",
    }),
    defineField({
      name: "credit",
      title: "Photo credit",
      type: "string",
      description: "Added to the end of the caption after a dash.",
    }),
    defineField({
      name: "width",
      title: "Width",
      type: "string",
      description: "Wide breaks out past the text column on desktop. On phones both look the same.",
      options: {
        list: [
          { title: "Same width as the text", value: "measure" },
          { title: "Wider than the text", value: "wide" },
        ],
        layout: "radio",
      },
      initialValue: "measure",
    }),
    defineField({
      name: "ratio",
      title: "Crop shape",
      type: "string",
      description: "The image is cropped to this shape whatever you upload. Use the hotspot to pick what stays.",
      options: {
        list: [
          { title: "Landscape (3:2)", value: "3/2" },
          { title: "Portrait (4:5)", value: "4/5" },
          { title: "Square (1:1)", value: "1/1" },
        ],
      },
      initialValue: "3/2",
    }),
  ],
});

/* ---- §4.3 Two-up image pair ---------------------------------------------- */

export const imagePair = defineType({
  name: "imagePair",
  title: "Two images side by side",
  type: "object",
  icon: ImagesIcon,
  description: "For before/after or this-vs-that. Stays side by side even on a phone.",
  fields: [
    defineField({
      name: "images",
      title: "The two images",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (rule) => rule.required().error("Both images need alt text."),
            }),
            defineField({
              name: "caption",
              type: "string",
              description: "Sits under this image only.",
            }),
          ],
        }),
      ],
      validation: (rule) =>
        rule.required().length(2).error("This block holds exactly two images — no more, no fewer."),
    }),
    defineField({
      name: "ratio",
      title: "Crop shape",
      type: "string",
      description: "Both images get the same crop, so the comparison stays fair.",
      options: {
        list: [
          { title: "Portrait (4:5)", value: "4/5" },
          { title: "Landscape (3:2)", value: "3/2" },
          { title: "Square (1:1)", value: "1/1" },
        ],
      },
      initialValue: "4/5",
    }),
  ],
  preview: {
    select: { media: "images.0", caption: "images.0.caption" },
    prepare: ({ media, caption }) => ({
      title: "Two images side by side",
      subtitle: caption || undefined,
      media,
    }),
  },
});

/* ---- §4.4 Product spotlight ---------------------------------------------- */

export const productSpotlight = defineType({
  name: "productSpotlight",
  title: "Product spotlight",
  type: "object",
  icon: PackageIcon,
  description: "Highlights one product inside the article, with a link to request pricing.",
  fields: [
    defineField({
      name: "product",
      type: "reference",
      to: [{ type: "product" }],
      description: "Pick a product. Its name, photo, description and price range come from that record.",
      validation: (rule) => rule.required().error("Choose which product to spotlight."),
    }),
    defineField({
      name: "ctaHref",
      title: "Button link",
      type: "string",
      description:
        'Where the button goes. Normally the quote form with the item pre-filled, e.g. "/quote?sku=merino-crew-sock" — not the shop page.',
      initialValue: "/quote",
      validation: (rule) => rule.required().error("The button needs somewhere to go."),
    }),
  ],
  preview: {
    select: { title: "product.name", subtitle: "product.oneLiner", media: "product.image" },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "No product selected",
      subtitle,
      media,
    }),
  },
});

/* ---- §4.5 Comparison table ----------------------------------------------- */

export const comparisonTable = defineType({
  name: "comparisonTable",
  title: "Comparison table",
  type: "object",
  icon: ThListIcon,
  description: 'For "best X for Y" sections. Scrolls sideways on a phone rather than restacking.',
  fields: [
    defineField({
      name: "label",
      title: "Label above the table",
      type: "string",
      description: 'Optional, e.g. "Compare · best drinkware for remote kits".',
    }),
    defineField({
      name: "columns",
      title: "Column headings",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description: "The first column is the row label — usually the product or option name.",
      validation: (rule) =>
        rule
          .required()
          .min(3)
          .error("A comparison needs at least three columns to be worth a table.")
          .max(5)
          .error("Five columns is the maximum — six can't be read on a phone."),
    }),
    defineField({
      name: "rows",
      type: "array",
      of: [
        defineArrayMember({
          name: "row",
          type: "object",
          fields: [
            defineField({
              name: "cells",
              title: "Cells, left to right",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              description: "Add one cell per column heading. Leave a cell empty if there's no value.",
            }),
          ],
          preview: {
            select: { cells: "cells" },
            prepare: ({ cells }) => ({
              title: (cells as string[] | undefined)?.[0] || "Empty row",
              subtitle: (cells as string[] | undefined)?.slice(1).join(" · "),
            }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).error("Add at least one row."),
    }),
    defineField({
      name: "footnote",
      title: "Source note",
      type: "string",
      description:
        'Strongly encouraged — say where the numbers came from and when, e.g. "Ranges assume one-colour decoration at 100 units, Aug 2026 quotes."',
    }),
    defineField({
      name: "highlightRow",
      title: "Highlight a row",
      type: "number",
      description: "Row number to shade as your pick — 1 for the first row. Leave empty for none.",
      validation: (rule) => rule.integer().min(1).error("Use 1 for the first row, 2 for the second, and so on."),
    }),
  ],
  preview: {
    select: { title: "label", rows: "rows" },
    prepare: ({ title, rows }) => ({
      title: title || "Comparison table",
      subtitle: `${(rows as unknown[] | undefined)?.length ?? 0} rows`,
    }),
  },
});

/* ---- §4.6 Callout -------------------------------------------------------- */

export const callout = defineType({
  name: "callout",
  title: "Callout box",
  type: "object",
  icon: BulbOutlineIcon,
  description: "A tip or a warning, set apart from the main text.",
  fields: [
    defineField({
      name: "tone",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Tip — helpful advice", value: "tip" },
          { title: "Caution — something that goes wrong", value: "caution" },
        ],
        layout: "radio",
      },
      initialValue: "tip",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description:
        'Defaults to "Tip" or "Watch out" depending on the type above. Type your own to change it, or a single space to hide the label entirely.',
    }),
    defineField({
      name: "body",
      title: "Text",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [
            { title: "Bulleted", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    title: "Web address",
                    type: "url",
                    validation: (rule) => rule.required(),
                  }),
                ],
              },
            ],
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).error("An empty callout box just looks like a mistake — add the text."),
    }),
  ],
  preview: {
    select: { tone: "tone", label: "label", body: "body" },
    prepare: ({ tone, label, body }) => {
      const first = (body as Array<{ children?: Array<{ text?: string }> }> | undefined)?.[0];
      const text = first?.children?.map((c) => c.text ?? "").join("") ?? "";
      return {
        title: label || (tone === "caution" ? "Watch out" : "Tip"),
        subtitle: text,
      };
    },
  },
});

/* ---- §4.7 Downloadable resource ------------------------------------------ */

export const resourceDownload = defineType({
  name: "resourceDownload",
  title: "Downloadable resource",
  type: "object",
  icon: DocumentPdfIcon,
  description: "Offers a PDF. Can be a straight download, or ask for an email address first.",
  fields: [
    defineField({
      name: "title",
      title: "What it's called",
      type: "string",
      validation: (rule) => rule.required().error("Give the download a name."),
    }),
    defineField({
      name: "file",
      title: "The file",
      type: "file",
      validation: (rule) => rule.required().error("Upload the PDF."),
    }),
    defineField({
      name: "pageCount",
      title: "Number of pages",
      type: "number",
      description: 'Shows as "PDF · 18 pages". Leave empty and it just says "PDF".',
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({
      name: "description",
      title: "One-line pitch",
      type: "text",
      rows: 2,
      description: "What the reader gets. Leave empty and only the name and format show.",
    }),
    defineField({
      name: "gated",
      title: "Ask for an email first",
      type: "boolean",
      description:
        "Off: a plain download link. On: a form asking for a work email, and the file downloads straight away once they submit.",
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "listId",
      title: "Mailing list",
      type: "string",
      description: "Which list the email address gets added to. Required when asking for an email.",
      validation: (rule) =>
        rule.custom((listId, context) => {
          const gated = (context.parent as { gated?: boolean } | undefined)?.gated;
          if (gated && !listId) {
            return 'This download asks for an email, so it needs a mailing list. Either add one, or turn off "Ask for an email first".';
          }
          return true;
        }),
    }),
    defineField({
      name: "submitLabel",
      title: "Button text",
      type: "string",
      description: 'Only used when asking for an email. Defaults to "Send me the PDF".',
    }),
    defineField({
      name: "formatLabel",
      title: "Format line override",
      type: "string",
      description: 'Rarely needed — the line is built from the page count automatically.',
    }),
    defineField({
      name: "reassurance",
      title: "Small print under the button",
      type: "string",
      description: 'Defaults to "Email only. No follow-up sequence." Only shown when asking for an email.',
    }),
    defineField({
      name: "thumbnail",
      title: "Cover image",
      type: "image",
      description: "Optional. Without one, a plain sage PDF tile is shown instead.",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
    }),
  ],
  preview: {
    select: { title: "title", gated: "gated" },
    prepare: ({ title, gated }) => ({
      title: title || "Untitled download",
      subtitle: gated ? "Asks for an email" : "Free download",
    }),
  },
});

/* ---- §4.8 FAQ block ------------------------------------------------------ */

export const faqBlock = defineType({
  name: "faqBlock",
  title: "FAQ",
  type: "object",
  icon: HelpCircleIcon,
  description: "A run of questions and answers. Google can show these directly in search results.",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Heading above the questions",
      type: "string",
      initialValue: "Common questions",
    }),
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
      validation: (rule) => rule.required().min(1).error("Add at least one question."),
    }),
    defineField({
      name: "display",
      title: "How it shows",
      type: "string",
      description:
        "Open shows every answer at once — best for four questions or fewer. Collapsible hides them behind a plus sign. Google reads both the same way.",
      options: {
        list: [
          { title: "Open — all answers visible", value: "open" },
          { title: "Collapsible — click to expand", value: "accordion" },
        ],
        layout: "radio",
      },
      initialValue: "open",
    }),
  ],
  preview: {
    select: { eyebrow: "eyebrow", items: "items" },
    prepare: ({ eyebrow, items }) => ({
      title: eyebrow || "FAQ",
      subtitle: `${(items as unknown[] | undefined)?.length ?? 0} questions`,
    }),
  },
});

/* ---- §3.10 Newsletter, offered as a body block --------------------------- */

export const newsletterInline = defineType({
  name: "newsletterInline",
  title: "Newsletter signup",
  type: "object",
  icon: EnvelopeIcon,
  description: "A signup form inside the article. Use sparingly — there's already one in the footer.",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) => rule.required().error("Give the signup a headline."),
    }),
    defineField({ name: "body", title: "Supporting line", type: "text", rows: 2 }),
    defineField({
      name: "proofLine",
      title: "Subscriber count or similar",
      type: "string",
      description: 'Optional, e.g. "Read by 9,400 buyers".',
    }),
    defineField({
      name: "listId",
      title: "Mailing list",
      type: "string",
      validation: (rule) => rule.required().error("Pick which list people are signing up to."),
    }),
    defineField({ name: "placeholder", title: "Field placeholder", type: "string" }),
    defineField({ name: "submitLabel", title: "Button text", type: "string" }),
  ],
  preview: {
    select: { title: "heading" },
    prepare: ({ title }) => ({ title: title || "Newsletter signup", subtitle: "Signup form" }),
  },
});
