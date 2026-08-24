import { defineCliConfig } from "sanity/cli";

/*
 * CLI config for schema deploys and dataset operations:
 *
 *   npx sanity schema deploy      push the schema to the Content Lake
 *   npx sanity dataset export     back up before a destructive change
 *
 * The Studio itself is embedded in the Astro app at /studio (see
 * astro.config.mjs), so `sanity dev` and `sanity deploy` are not the path here —
 * `npm run dev` serves the Studio alongside the site.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.PUBLIC_SANITY_DATASET,
  },
});
