import { defineCliConfig } from "sanity/cli";

/*
 * CLI config for schema deploys and dataset operations:
 *
 *   npx sanity schema deploy      push the schema to the Content Lake
 *   npx sanity dataset export     back up before a destructive change
 *
 * The Studio runs two ways, from this one config:
 *   npm run dev            → embedded in the Astro app at /studio
 *   npm run studio:deploy  → hosted at https://corpspecblog.sanity.studio
 * Both read sanity.config.ts, so the schema can never differ between them.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.PUBLIC_SANITY_DATASET,
  },
  /*
   * Pinned so `sanity deploy` never prompts and lands on a predictable URL:
   * https://corpspecblog.sanity.studio — already added to the project's CORS
   * origins, so the hosted Studio works on the first deploy.
   */
  studioHost: "corpspecblog",
});
