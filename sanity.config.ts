import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

/*
 * The Studio is embedded in the Astro app at /studio (see astro.config.mjs),
 * so it deploys with the site and its schemas live beside the components that
 * consume them.
 */
export default defineConfig({
  name: "default",
  title: "The Swag Desk",

  projectId: process.env.PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.PUBLIC_SANITY_DATASET!,

  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: "2026-08-24" })],

  schema: {
    types: schemaTypes,

    templates: (prev) => [
      ...prev,
      {
        /*
         * Used by the "By category" pane in the desk structure: starting a post
         * from inside a category pre-fills that category, so the commonest way
         * to create a post skips a required field.
         */
        id: "post-by-category",
        title: "Post in this category",
        schemaType: "post",
        parameters: [{ name: "categoryId", type: "string" }],
        value: ({ categoryId }: { categoryId: string }) => ({
          category: { _type: "reference", _ref: categoryId },
        }),
      },
    ],
  },
});
