import { SearchIcon } from "@sanity/icons/Search";
import { defineField, defineType } from "sanity";
import { characterCount } from "../../components/CharacterCountInput";

/*
 * Reusable SEO object. Every field is an OVERRIDE — leave it empty and the page
 * falls back to the post's own title / dek / hero image. Nothing here is
 * required, and an editor should only reach for it when the default is wrong.
 */
export const seo = defineType({
  name: "seo",
  title: "Search & social",
  type: "object",
  icon: SearchIcon,
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Search result title",
      type: "string",
      description:
        "Overrides the headline in Google results and the browser tab. Leave empty to use the post title.",
      components: { input: characterCount(55, 60) },
      validation: (rule) =>
        rule
          .max(60)
          .warning("Longer than 60 characters — Google will cut the end off."),
    }),
    defineField({
      name: "metaDescription",
      title: "Search result description",
      type: "text",
      rows: 3,
      description:
        "The grey summary under the link in Google. Leave empty to use the post's dek.",
      components: { input: characterCount(155, 160) },
      validation: (rule) =>
        rule
          .max(160)
          .warning("Longer than 160 characters — Google will cut the end off."),
    }),
    defineField({
      name: "canonical",
      title: "Canonical URL",
      type: "url",
      description:
        "Only fill this in if this article was first published somewhere else. It tells Google which copy is the original. Leave empty otherwise.",
      validation: (rule) =>
        rule
          .uri({ scheme: ["http", "https"] })
          .error("Needs to be a full web address starting with http:// or https://"),
    }),
    defineField({
      name: "noindex",
      title: "Hide from search engines",
      type: "boolean",
      description:
        "Turn this on to keep the page off Google. The page stays live and anyone with the link can still read it.",
      initialValue: false,
    }),
    defineField({
      name: "ogImage",
      title: "Social sharing image",
      type: "image",
      description:
        "The picture that shows when someone shares this on LinkedIn or Slack. Leave empty to use the hero image. Works best at 1200 × 630.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describe the image for screen readers.",
        }),
      ],
    }),
  ],
});
