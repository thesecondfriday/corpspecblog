import { createClient, type ClientPerspective } from "@sanity/client";

/*
 * Two clients, deliberately separate.
 *
 * `client` reads PUBLISHED content only, with no token. The dataset is public,
 * so build-time fetches need no credentials at all — which means a static build
 * can run in CI without secrets.
 *
 * `draftClient` reads DRAFTS, and therefore needs a token. It is only ever
 * constructed inside on-demand routes (see src/pages/preview/), never in a
 * prerendered page, so the token cannot leak into built HTML.
 */

export const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
export const dataset = import.meta.env.PUBLIC_SANITY_DATASET;

/** Pinned: a floating version would let a dated API change break a build silently. */
export const apiVersion = "2026-08-24";

/*
 * Points the client somewhere other than api.sanity.io. Only set by
 * scripts/local-dataset.mjs, which serves the seed content through groq-js so
 * the real queries can be verified without network access. Unset in every
 * normal build and deploy.
 */
const apiHost = import.meta.env.PUBLIC_SANITY_API_HOST || undefined;

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  ...(apiHost ? { apiHost, useProjectHostname: false } : {}),
  // Content is fetched at build time, so the CDN would only serve staleness.
  useCdn: false,
  perspective: "published" satisfies ClientPerspective,
});

/**
 * A client that can see drafts. Returns null when no viewer token is
 * configured, so callers degrade to published content instead of throwing.
 */
export function getDraftClient() {
  const token = import.meta.env.SANITY_VIEWER_TOKEN;
  if (!token) return null;

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
    ...(apiHost ? { apiHost, useProjectHostname: false } : {}),
    // `drafts` returns the draft of any document that has one, and the
    // published version of any that doesn't — which is what an editor expects
    // "preview" to mean.
    perspective: "drafts" satisfies ClientPerspective,
  });
}
