import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineArrayMember, defineField, defineType } from "sanity";

/*
 * Component Spec §2 — the `post` document.
 *
 * Field names match what src/components already read. Two names were settled
 * against the original brief and are recorded in FIELD-INVENTORY.md Flag 3:
 * `featured` (not isFeatured) and `avatar` on author (not photo).
 *
 * Four fields the brief omitted are kept because components render them:
 * `dek`, `reviewedBy`, `isGuide`, and `order` on category.
 */
export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: DocumentTextIcon,

  // Field groups so the form isn't one long scroll (§2 of the build request).
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "Details" },
    { name: "media", title: "Images" },
    { name: "seo", title: "Search & social" },
    { name: "advanced", title: "Advanced" },
  ],

  fields: [
    /* ---- Content --------------------------------------------------------- */
    defineField({
      name: "title",
      title: "Headline",
      type: "string",
      group: "content",
      description: "Long headlines are fine — cards are built to hold three lines.",
      validation: (rule) => rule.required().error("Every post needs a headline."),
    }),

    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      group: "content",
      description:
        "The web address for this post. Generated from the headline the first time — after that it stays put, even if you rewrite the headline. Only change it before publishing; changing it later breaks existing links unless you add the old one under Advanced → Redirect from.",
      options: {
        source: "title",
        maxLength: 96,
        /*
         * Sanity only generates a slug when the editor presses Generate — it
         * never re-derives on save. So editing the title after the fact leaves
         * the slug alone, which is the behaviour asked for. This slugify just
         * enforces the shape when they do press it.
         */
        slugify: (input) =>
          input
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 96),
      },
      validation: (rule) =>
        rule
          .required()
          .error("A post needs a URL. Press Generate to make one from the headline.")
          .custom(async (slug, context) => {
            const current = (slug as { current?: string } | undefined)?.current;
            if (!current) return true;

            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(current)) {
              return "Use lowercase letters, numbers and hyphens only — no spaces, capitals or punctuation.";
            }
            if (current === "page") {
              return '"page" is reserved for page numbering. Pick something else.';
            }

            // Unique across posts. Drafts and their published version share a
            // slug legitimately, so compare on the published id.
            const client = context.getClient({ apiVersion: "2026-08-24" });
            const id = context.document?._id?.replace(/^drafts\./, "");
            const duplicates = await client.fetch<number>(
              `count(*[_type == "post" && slug.current == $slug && !(_id in [$id, "drafts." + $id])])`,
              { slug: current, id },
            );

            return duplicates === 0 || "Another post already uses this URL. Change one of them.";
          }),
    }),

    defineField({
      name: "dek",
      title: "Standfirst",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "The paragraph under the headline that says why the piece is worth reading. Also used as the Google description unless you override it under Search & social.",
      validation: (rule) => rule.required().error("The standfirst shows under every headline — it can't be empty."),
    }),

    defineField({
      name: "excerpt",
      title: "Card summary",
      type: "text",
      rows: 2,
      group: "content",
      description:
        "A shorter line used only on the large featured card on the homepage. Leave empty and that card just shows the headline.",
      validation: (rule) => rule.max(140).warning("Over 140 characters gets cut off on the card."),
    }),

    defineField({
      name: "body",
      title: "Article",
      type: "portableText",
      group: "content",
      validation: (rule) => rule.required().error("The article has no body text yet."),
    }),

    defineField({
      name: "faq",
      title: "Questions & answers",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
      group: "content",
      description:
        "Shown after the article. Google can display these in search results. Skip this if you already added an FAQ block inside the article itself.",
      validation: (rule) =>
        rule.custom((faq, context) => {
          const body = (context.document?.body ?? []) as Array<{ _type?: string }>;
          const hasBodyFaq = body.some((node) => node._type === "faqBlock");
          if (hasBodyFaq && Array.isArray(faq) && faq.length > 0) {
            return "This article already has an FAQ block inside the body. Keep one or the other — two sets of questions confuse Google.";
          }
          return true;
        }),
    }),

    /* ---- Details --------------------------------------------------------- */
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      group: "meta",
      description: "One per post. This is the label readers see on every card, so it has to be unambiguous.",
      validation: (rule) => rule.required().error("Pick a category — every card shows one."),
    }),

    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "tag" }] })],
      group: "meta",
      description: "Optional. Tags cut across categories and drive the filter row on category pages.",
      validation: (rule) => rule.unique().error("That tag is already on this post."),
    }),

    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      group: "meta",
      validation: (rule) => rule.required().error("Every post needs a byline."),
    }),

    defineField({
      name: "publishedAt",
      title: "Publish date",
      type: "datetime",
      group: "meta",
      description: "Sets the order posts appear in. A future date won't hide the post.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required().error("Set a publish date — it decides where the post sorts."),
    }),

    defineField({
      name: "updatedAt",
      title: "Last updated",
      type: "datetime",
      group: "meta",
      description: 'Only set this if you substantially revise the piece. Guides show it as "Updated March 2026".',
      validation: (rule) =>
        rule.custom((updatedAt, context) => {
          const published = (context.document as { publishedAt?: string } | undefined)?.publishedAt;
          if (updatedAt && published && new Date(updatedAt as string) < new Date(published)) {
            return "The update date is before the publish date. Check which one is wrong.";
          }
          return true;
        }),
    }),

    defineField({
      name: "readTime",
      title: "Read time",
      type: "number",
      group: "meta",
      description: "In minutes. Leave empty and it's worked out from the word count.",
      validation: (rule) => rule.integer().positive().error("Read time is a whole number of minutes."),
    }),

    defineField({
      name: "reviewedBy",
      title: "Fact-checked by",
      type: "string",
      group: "meta",
      description: 'Shows in the byline as "Reviewed by sourcing". Leave empty and nothing appears.',
    }),

    defineField({
      name: "featured",
      title: "Can headline the homepage",
      type: "boolean",
      group: "meta",
      description: "Makes this post eligible for the big hero slot. The most recent eligible post wins.",
      initialValue: false,
    }),

    defineField({
      name: "isGuide",
      title: "Evergreen guide",
      type: "boolean",
      group: "meta",
      description:
        'Puts this in "The reference shelf" on the homepage instead of the normal feed. For long pieces you keep updating.',
      initialValue: false,
    }),

    /* ---- Images ---------------------------------------------------------- */
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      group: "media",
      options: { hotspot: true },
      description:
        "Upload 4:3 landscape, at least 2000 × 1500px. One picture is cropped three ways — 4:3 in the featured banner on the home page, square beside the article headline, and 3:2 on cards and on phones — so set the hotspot on whatever has to survive all three. Avoid panoramas and tall portraits; each loses its subject in one of the crops. No image is fine: cards fall back to a monogram tile and the article just leads with the headline.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describe the picture for readers using a screen reader.",
          validation: (rule) =>
            rule.required().error("Alt text is required whenever there's an image. Describe what it shows."),
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          description: "Printed under the hero. Leave empty and no caption appears.",
        }),
        defineField({ name: "credit", title: "Photo credit", type: "string" }),
      ],
    }),

    /* ---- Search & social -------------------------------------------------- */
    defineField({ name: "seo", title: "Search & social", type: "seo", group: "seo" }),

    /* ---- Advanced --------------------------------------------------------- */
    defineField({
      name: "relatedPosts",
      title: "Related posts",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "post" }],
          options: {
            filter: ({ document }) => ({
              filter: "!(_id in [$id, $draftId])",
              params: {
                id: document._id.replace(/^drafts\./, ""),
                draftId: `drafts.${document._id.replace(/^drafts\./, "")}`,
              },
            }),
          },
        }),
      ],
      group: "advanced",
      description:
        "Leave empty and three related posts are picked automatically — same category first, then shared tags, then most recent. Only fill this in when you want to override that.",
      validation: (rule) =>
        rule
          .unique()
          .error("That post is already in the list.")
          .max(3)
          .error("Three at most — the section only has room for three cards."),
    }),

    defineField({
      name: "redirectFrom",
      title: "Redirect from",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      group: "advanced",
      description:
        "Old web addresses that should send visitors here. Use this when you change the URL of a post that's already published, so existing links keep working. One path per line, starting with a slash.",
      validation: (rule) =>
        rule
          .unique()
          .error("That path is listed twice.")
          .custom((paths) => {
            const list = (paths ?? []) as string[];
            const bad = list.find((path) => !/^\/[^\s?#]*$/.test(path));
            if (bad) {
              return `"${bad}" doesn't look like a path. Write it as it appeared in the address bar, starting with a slash — e.g. /blog/old-post-name`;
            }
            return true;
          }),
    }),
  ],

  // §2 of the build request: list previews showing hero image and title.
  preview: {
    select: {
      title: "title",
      category: "category.title",
      author: "author.name",
      media: "heroImage",
      publishedAt: "publishedAt",
      featured: "featured",
      isGuide: "isGuide",
    },
    prepare: ({ title, category, author, media, publishedAt, featured, isGuide }) => {
      const date = publishedAt
        ? new Date(publishedAt as string).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "No date";
      const badges = [featured && "★ Hero", isGuide && "Guide"].filter(Boolean).join(" · ");
      return {
        title: title || "Untitled post",
        subtitle: [category, author, date, badges].filter(Boolean).join("  ·  "),
        media,
      };
    },
  },

  orderings: [
    {
      name: "publishedAtDesc",
      title: "Newest first",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      name: "titleAsc",
      title: "Headline A–Z",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
});
