import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes";

/*
 * The Studio is embedded in the Astro app at /studio (see astro.config.mjs),
 * so it deploys with the site and its schemas live beside the components that
 * consume them.
 *
 * Desk structure lands in step 2 — this config currently uses the default
 * document list.
 */
export default defineConfig({
  name: "default",
  title: "The Swag Desk",

  projectId: process.env.PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.PUBLIC_SANITY_DATASET!,

  plugins: [structureTool(), visionTool({ defaultApiVersion: "2026-08-24" })],

  schema: { types: schemaTypes },
});
