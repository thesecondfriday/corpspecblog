/*
 * A local stand-in for the Sanity query API.
 *
 *   node scripts/local-dataset.mjs [--port 3999]
 *
 * WHY THIS EXISTS: verification, not development. It runs the project's real
 * GROQ queries — the ones in src/sanity/lib/queries.ts — against the real seed
 * documents, using groq-js, which is the same GROQ implementation Sanity's own
 * Content Lake uses. So the projections are genuinely exercised: a wrong field
 * name or a broken `rows[].cells` flattening fails here exactly as it would
 * against the live dataset.
 *
 * What it does NOT verify: anything server-side that isn't GROQ — dataset
 * permissions, draft perspectives, real asset transforms, or the actual
 * published content. Point the build at the real dataset once it is reachable.
 *
 * Usage with the build:
 *   node scripts/local-dataset.mjs &
 *   PUBLIC_SANITY_API_HOST=http://localhost:3999 npx astro build
 */

import { createServer } from "node:http";
import { evaluate, parse } from "groq-js";
import { buildDataset } from "./build-dataset.mjs";

const port = Number(process.argv[process.argv.indexOf("--port") + 1]) || 3999;

/*
 * Verification variants. The seed is one post per category, which is the right
 * shape for judging layout but too small to reach two states the spec requires:
 * the empty archive (§3.6) and pagination past page 1 (§3.4). These flags
 * generate a dataset that does reach them, so both can actually be walked.
 *
 *   --empty-category <slug>   removes every post in that category
 *   --multiply <n>            clones each post n times with distinct slugs
 */
const emptyCategory = process.argv.includes("--empty-category")
  ? process.argv[process.argv.indexOf("--empty-category") + 1]
  : null;
const multiply = process.argv.includes("--multiply")
  ? Number(process.argv[process.argv.indexOf("--multiply") + 1])
  : 1;

let documents = buildDataset();

if (emptyCategory) {
  const id = `category.${emptyCategory}`;
  documents = documents.filter((d) => !(d._type === "post" && d.category?._ref === id));
}

if (multiply > 1) {
  const posts = documents.filter((d) => d._type === "post");
  for (let copy = 2; copy <= multiply; copy++) {
    for (const post of posts) {
      documents.push({
        ...post,
        _id: `${post._id}-copy${copy}`,
        slug: { _type: "slug", current: `${post.slug.current}-copy${copy}` },
        title: `${post.title} (${copy})`,
        // Only one post may headline the homepage.
        featured: false,
        // Stagger dates so ordering is deterministic across copies.
        publishedAt: new Date(
          new Date(post.publishedAt).getTime() - copy * 86400000,
        ).toISOString(),
        relatedPosts: undefined,
        redirectFrom: undefined,
      });
    }
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);

  // Mirrors /v{version}/data/query/{dataset}?query=…&$param=…
  if (!url.pathname.includes("/data/query/")) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Only /data/query/ is implemented" }));
    return;
  }

  const query = url.searchParams.get("query");
  if (!query) {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Missing ?query=" }));
    return;
  }

  // Sanity passes GROQ params as $-prefixed search params, JSON-encoded.
  const params = {};
  for (const [key, value] of url.searchParams) {
    if (!key.startsWith("$")) continue;
    try {
      params[key.slice(1)] = JSON.parse(value);
    } catch {
      params[key.slice(1)] = value;
    }
  }

  try {
    const tree = parse(query, { params });
    const value = await (await evaluate(tree, { dataset: documents, params })).get();
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ result: value, ms: 0 }));
  } catch (error) {
    console.error(`[local-dataset] query failed: ${error.message}\n  ${query.slice(0, 160)}`);
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: { description: error.message } }));
  }
});

server.listen(port, () => {
  const variant = [
    emptyCategory && `empty:${emptyCategory}`,
    multiply > 1 && `x${multiply}`,
  ].filter(Boolean).join(" ");
  console.log(
    `[local-dataset] ${documents.length} documents on http://localhost:${port}${variant ? ` (${variant})` : ""}`,
  );
});
