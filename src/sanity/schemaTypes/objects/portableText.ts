import { defineArrayMember, defineField, defineType } from "sanity";

/*
 * Component Spec §4.1 — the article body.
 *
 * The `block` member below is the PROSE DEFAULTS: the styles, lists and marks
 * an editor gets without inserting anything. Everything after it is an
 * insertable block from §4.
 *
 * Deliberate omissions, all from §4.1:
 *   - no h1 — the page owns the only h1
 *   - no h4+ — the type scale stops at h3, and the table of contents ignores them
 *   - no underline (reads as a broken link), no text colour, no font sizes,
 *     no alignment. The design system owns all of that.
 *   - `blockquote` is present but labelled for imported content only; editors
 *     get the pullQuote block instead.
 */
export const portableText = defineType({
  name: "portableText",
  title: "Article body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading", value: "h2" },
        { title: "Subheading", value: "h3" },
        { title: "Quote (imported articles only)", value: "blockquote" },
      ],
      lists: [
        { title: "Bulleted", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Code", value: "code" },
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
                description: "Internal links start with a slash, e.g. /blog/gifting-guides.",
                validation: (rule) =>
                  rule
                    .required()
                    .uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true })
                    .error("Needs to be a web address, or an internal path starting with /"),
              }),
            ],
          },
        ],
      },
    }),

    // §4 insertable blocks. These names are the `_type` the front end switches on.
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
