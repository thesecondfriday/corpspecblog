import { PackageIcon } from "@sanity/icons/Package";
import { TagIcon } from "@sanity/icons/Tag";
import { TagsIcon } from "@sanity/icons/Tags";
import { UserIcon } from "@sanity/icons/User";
import { defineArrayMember, defineField, defineType } from "sanity";

/** Shared slug shape: lowercase, hyphens, no reserved words. */
const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);

/* ---- Author -------------------------------------------------------------- */

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required().error("An author needs a name."),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      options: { source: "name", slugify },
      description: "Used for this author's page. Generated from the name — press Generate.",
      validation: (rule) => rule.required().error("Press Generate to create the URL."),
    }),
    defineField({
      name: "role",
      title: "Job title",
      type: "string",
      description: 'Shows under the name in the byline, e.g. "Editorial Director".',
    }),
    defineField({
      name: "avatar",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description:
        "Square headshot. Without one, the byline shows the author's initials in a circle instead — that's a deliberate fallback, not a broken image.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Usually just the person's name.",
          validation: (rule) => rule.required().error("Add alt text — usually just the person's name."),
        }),
      ],
    }),
    defineField({
      name: "bio",
      title: "Biography",
      type: "text",
      rows: 4,
      description:
        "Two or three sentences, shown at the end of their articles. Leave empty and the whole bio box is skipped — there's no half-empty state.",
    }),
    defineField({
      name: "links",
      title: "Profile links",
      type: "array",
      of: [
        defineArrayMember({
          name: "profileLink",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Link text",
              type: "string",
              description: 'What the reader sees, e.g. "LinkedIn".',
              validation: (rule) => rule.required().error("Give the link something to say."),
            }),
            defineField({
              name: "url",
              title: "Web address",
              type: "url",
              validation: (rule) =>
                rule.required().uri({ scheme: ["http", "https"] }).error("Needs to start with https://"),
            }),
          ],
          preview: { select: { title: "label", subtitle: "url" } },
        }),
      ],
      description: "Optional. LinkedIn, a personal site, anywhere readers can find more of their work.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "avatar" },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Unnamed author",
      subtitle: subtitle || "No job title",
      media,
    }),
  },
});

/* ---- Category ------------------------------------------------------------ */

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagsIcon,
  description: "The five sections of the hub. Every post belongs to exactly one.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required().error("A category needs a name."),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      options: { source: "title", slugify },
      description: "Becomes /blog/your-slug. Don't change it once posts are published.",
      validation: (rule) =>
        rule
          .required()
          .error("Press Generate to create the URL.")
          .custom((slug) => {
            const current = (slug as { current?: string } | undefined)?.current;
            if (current === "page") {
              return '"page" is reserved for page numbering. Pick something else.';
            }
            return true;
          }),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      description:
        "One paragraph at the top of the category page explaining what belongs here. Aim for 220–320 characters — roughly three full lines.",
      validation: (rule) =>
        rule
          .required()
          .error("The category page has a large empty space without this.")
          .min(220)
          .warning("Shorter than 220 characters looks thin next to the big heading.")
          .max(320)
          .warning("Longer than 320 characters pushes the article grid too far down the page."),
    }),
    defineField({
      name: "order",
      title: "Position in the menu",
      type: "number",
      description: "1 shows first, 2 second, and so on. Controls the category bar across the top of every page.",
      validation: (rule) =>
        rule.required().integer().min(1).error("Use a whole number — 1 for the first category in the menu."),
    }),
  ],
  orderings: [{ name: "menuOrder", title: "Menu order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", order: "order", description: "description" },
    prepare: ({ title, order, description }) => ({
      title: title || "Untitled category",
      subtitle: `${order ? `${order}. ` : ""}${description ? String(description).slice(0, 70) + "…" : "No description"}`,
    }),
  },
});

/* ---- Tag ----------------------------------------------------------------- */

export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  icon: TagIcon,
  description:
    "Tags cut across categories — a post about remote teams can be tagged that whether it's a gifting guide or a strategy piece.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required().error("A tag needs a name."),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      options: { source: "title", slugify },
      validation: (rule) => rule.required().error("Press Generate to create the URL."),
    }),
  ],
  preview: { select: { title: "title", subtitle: "slug.current" } },
});

/* ---- Product ------------------------------------------------------------- */

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: PackageIcon,
  description: "Products you can spotlight inside an article. Not a full catalogue — just the ones you write about.",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required().error("The product needs a name."),
    }),
    defineField({
      name: "slug",
      title: "Storefront URL",
      type: "slug",
      options: { source: "name", slugify },
      description: "Optional. Only needed if this product has a page on the main shop.",
    }),
    defineField({
      name: "image",
      title: "Product photo",
      type: "image",
      options: { hotspot: true },
      description:
        "Square crop. Any background works — white cut-outs and studio shots both sit fine against the warm tile. Don't remove backgrounds or add drop shadows. Without a photo the spotlight becomes a text-only block, which is fine.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (rule) => rule.required().error("Describe the product for screen readers."),
        }),
      ],
    }),
    defineField({
      name: "oneLiner",
      title: "One-line description",
      type: "string",
      description: "What makes it worth buying, in one sentence.",
      validation: (rule) =>
        rule
          .required()
          .error("The spotlight looks bare without this.")
          .max(90)
          .error("Keep it under 90 characters — it's one line in the design, not a paragraph."),
    }),
    defineField({
      name: "priceLow",
      title: "Price from",
      type: "number",
      description: "In dollars. Fill in both price fields or neither — a half-filled range shows nothing.",
      validation: (rule) =>
        rule.custom((low, context) => {
          const high = (context.document as { priceHigh?: number } | undefined)?.priceHigh;
          if ((low === undefined || low === null) !== (high === undefined || high === null)) {
            return "Fill in both prices, or leave both empty. A single price can't make a range.";
          }
          if (typeof low === "number" && typeof high === "number" && low > high) {
            return '"Price from" is higher than "Price to" — swap them.';
          }
          return true;
        }),
    }),
    defineField({ name: "priceHigh", title: "Price to", type: "number" }),
    defineField({
      name: "minQty",
      title: "Minimum order",
      type: "number",
      description: 'Shows after the price as "/ 100 pc min". Leave empty and nothing appears.',
      validation: (rule) => rule.integer().positive().error("Use a whole number of units."),
    }),
    defineField({
      name: "ctaLabel",
      title: "Button text",
      type: "string",
      initialValue: "Request pricing",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "oneLiner", media: "image" },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Unnamed product",
      subtitle,
      media,
    }),
  },
});
