import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { defineArrayMember, defineField, defineType } from "sanity";

/*
 * One question/answer pair. Shared by the document-level `post.faq` field and
 * the insertable `faqBlock` (§4.8), so both produce identical FAQPage markup.
 *
 * The answer is Portable Text rather than a plain string because §4.8 allows
 * links inside an answer — but the styles are deliberately limited to normal
 * paragraphs and lists. An answer is not a place for headings.
 */
export const faqItem = defineType({
  name: "faqItem",
  title: "Question",
  type: "object",
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: "question",
      type: "string",
      description: "Write it the way a reader would ask it, question mark and all.",
      validation: (rule) => rule.required().error("Every FAQ entry needs a question."),
    }),
    defineField({
      name: "answer",
      type: "array",
      description: "One or two short paragraphs. If it needs three, it's an article section, not an FAQ.",
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
      validation: (rule) => rule.required().min(1).error("Add an answer — an empty question hurts more than no FAQ."),
    }),
  ],
  preview: {
    select: { title: "question" },
    prepare: ({ title }) => ({ title: title || "Untitled question" }),
  },
});
