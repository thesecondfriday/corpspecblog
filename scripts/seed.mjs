/*
 * Seeds the CSBLOG dataset with placeholder editorial.
 *
 *   SANITY_WRITE_TOKEN=sk... node scripts/seed.mjs
 *   node scripts/seed.mjs --dry-run     print what would be written, touch nothing
 *
 * Rerunnable: documents use deterministic ids and `createOrReplace`, so running
 * it twice updates rather than duplicates. Image assets dedupe on content hash
 * inside Sanity, so re-uploads are free.
 *
 * The token needs Editor permission. Create one at
 * https://www.sanity.io/manage/project/8og1x4eu/api#tokens — it is write access
 * to the whole dataset, so keep it out of the repo (.env.local is gitignored).
 */

import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

import { resetKeys, blk, h2, h3, img, keyed, ol, p, ref, ul } from "./portable-text.mjs";
import {
  authors,
  categories,
  images,
  posts,
  products,
  redirectOverrides,
  relatedOverrides,
  tags,
} from "./seed-data.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !dataset) {
  console.error("Missing PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET. Load .env.local first:");
  console.error("  set -a; . ./.env.local; set +a; node scripts/seed.mjs");
  process.exit(1);
}
if (!token && !DRY_RUN) {
  console.error("Missing SANITY_WRITE_TOKEN (needs Editor permission).");
  console.error("Create one at https://www.sanity.io/manage/project/" + projectId + "/api#tokens");
  console.error("Then: SANITY_WRITE_TOKEN=sk... node scripts/seed.mjs");
  console.error("Or preview without writing: node scripts/seed.mjs --dry-run");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-08-24",
  useCdn: false,
});

/* ---- Assets -------------------------------------------------------------- */

/*
 * The placeholder art ships as SVG, but Sanity's image pipeline can't crop,
 * hotspot or resize an SVG — it serves it untouched. Rasterising at upload
 * means the real crop and responsive machinery gets exercised by the seed,
 * which is the point of having seed content at all.
 */
async function uploadImages() {
  const uploaded = {};

  for (const [name, spec] of Object.entries(images)) {
    const svgPath = path.join(ROOT, "public", "placeholder", `${spec.slot}.svg`);
    const svg = await readFile(svgPath);
    const jpeg = await sharp(svg, { density: 200 }).jpeg({ quality: 82 }).toBuffer();

    if (DRY_RUN) {
      console.log(`  would upload ${spec.slot}.jpg (${(jpeg.length / 1024).toFixed(0)}kb)`);
      uploaded[name] = `image-DRYRUN-${spec.slot}`;
      continue;
    }

    const asset = await client.assets.upload("image", jpeg, {
      filename: `${spec.slot}.jpg`,
      // §6: flagged in the asset itself, so it is obvious in the media library
      // that nothing here is selected photography.
      title: `PLACEHOLDER — ${spec.alt}`,
      description: "Placeholder imagery from the design handoff. Replace before launch.",
    });
    uploaded[name] = asset._id;
    console.log(`  uploaded ${spec.slot}.jpg → ${asset._id}`);
  }

  return uploaded;
}

/* ---- Document builders --------------------------------------------------- */

const slug = (current) => ({ _type: "slug", current });

function buildCategory(c) {
  return {
    _id: c._id,
    _type: "category",
    title: c.title,
    slug: slug(c.slug),
    description: c.description,
    order: c.order,
  };
}

function buildTag(t) {
  return { _id: t._id, _type: "tag", title: t.title, slug: slug(t.slug) };
}

function buildAuthor(a, assets) {
  return {
    _id: a._id,
    _type: "author",
    name: a.name,
    slug: slug(a.slug),
    ...(a.role ? { role: a.role } : {}),
    ...(a.image ? { avatar: img(assets[a.image], images[a.image].alt) } : {}),
    ...(a.bio ? { bio: a.bio } : {}),
    ...(a.links ? { links: keyed(a.links) } : {}),
  };
}

function buildProduct(pr, assets) {
  return {
    _id: pr._id,
    _type: "product",
    name: pr.name,
    ...(pr.slug ? { slug: slug(pr.slug) } : {}),
    ...(pr.image ? { image: img(assets[pr.image], images[pr.image].alt) } : {}),
    oneLiner: pr.oneLiner,
    ...(pr.priceLow !== undefined ? { priceLow: pr.priceLow, priceHigh: pr.priceHigh } : {}),
    ...(pr.minQty ? { minQty: pr.minQty } : {}),
  };
}

/**
 * Resolves the seed's shorthand inside body blocks into real Sanity shapes:
 * image slot names into asset references, product ids into references, and
 * comparison rows into the `rows[].cells[]` the schema stores.
 */
function resolveBlock(node, assets) {
  if (node._type === "inlineImage") {
    const { image, ...rest } = node;
    return { ...rest, ...img(assets[image], images[image].alt), _type: "inlineImage" };
  }

  if (node._type === "imagePair") {
    return {
      ...node,
      images: keyed(
        node.images.map((entry) => ({
          ...img(assets[entry.image], images[entry.image].alt),
          ...(entry.caption ? { caption: entry.caption } : {}),
        })),
      ),
    };
  }

  if (node._type === "productSpotlight") {
    return { ...node, product: ref(node.product) };
  }

  if (node._type === "comparisonTable") {
    return { ...node, rows: keyed(node.rows.map((cells) => ({ _type: "row", cells }))) };
  }

  if (node._type === "faqBlock") {
    return {
      ...node,
      items: keyed(
        node.items.map((item) => ({
          _type: "faqItem",
          question: item.question,
          answer: item.answer.map((text) => p(text)),
        })),
      ),
    };
  }

  if (node._type === "resourceDownload") {
    /*
     * There is no real PDF to upload, and `file` is required by the schema —
     * so the seed omits it and the runner reports it. See the summary printed
     * at the end: these two blocks need a real asset before they validate.
     */
    const { ...rest } = node;
    return rest;
  }

  return node;
}

function buildPost(post, assets) {
  const hero = post.hero
    ? {
        heroImage: {
          ...img(assets[post.hero.image], images[post.hero.image].alt),
          ...(post.hero.caption ? { caption: post.hero.caption } : {}),
          ...(post.hero.credit ? { credit: post.hero.credit } : {}),
        },
      }
    : {};

  return {
    _id: post._id,
    _type: "post",
    title: post.title,
    slug: slug(post.slug),
    dek: post.dek,
    ...(post.excerpt ? { excerpt: post.excerpt } : {}),
    ...hero,
    category: ref(post.category),
    author: ref(post.author),
    ...(post.tags ? { tags: keyed(post.tags.map((t) => ref(t))) } : {}),
    publishedAt: post.publishedAt,
    ...(post.updatedAt ? { updatedAt: post.updatedAt } : {}),
    ...(post.readTime ? { readTime: post.readTime } : {}),
    ...(post.reviewedBy ? { reviewedBy: post.reviewedBy } : {}),
    ...(post.featured ? { featured: true } : {}),
    ...(post.isGuide ? { isGuide: true } : {}),
    body: post.body.map((node) => resolveBlock(node, assets)),
    ...(post.faq
      ? {
          faq: keyed(
            post.faq.map((item) => ({
              _type: "faqItem",
              question: item.question,
              answer: item.answer.map((text) => p(text)),
            })),
          ),
        }
      : {}),
    ...(post.seo ? { seo: { _type: "seo", ...post.seo } } : {}),
    ...(relatedOverrides[post._id]
      ? { relatedPosts: keyed(relatedOverrides[post._id].map((id) => ref(id))) }
      : {}),
    ...(redirectOverrides[post._id] ? { redirectFrom: redirectOverrides[post._id] } : {}),
  };
}

/* ---- Run ----------------------------------------------------------------- */

async function main() {
  console.log(`Seeding ${projectId}/${dataset}${DRY_RUN ? " (dry run — nothing will be written)" : ""}\n`);

  resetKeys();

  console.log("Images:");
  const assets = await uploadImages();

  const documents = [
    ...categories.map(buildCategory),
    ...tags.map(buildTag),
    ...authors.map((a) => buildAuthor(a, assets)),
    ...products.map((pr) => buildProduct(pr, assets)),
    ...posts.map((post) => buildPost(post, assets)),
  ];

  console.log(`\nDocuments: ${documents.length}`);
  for (const doc of documents) {
    console.log(`  ${doc._type.padEnd(9)} ${doc._id}`);
  }

  if (DRY_RUN) {
    console.log("\nDry run complete — nothing written.");
    return;
  }

  /*
   * References must resolve at write time, so everything goes in one
   * transaction: posts referencing categories that don't exist yet would fail
   * if written separately.
   */
  const tx = documents.reduce((acc, doc) => acc.createOrReplace(doc), client.transaction());
  await tx.commit();

  console.log(`\nWrote ${documents.length} documents.`);

  const missingFiles = posts.flatMap((post) =>
    post.body.filter((n) => n._type === "resourceDownload").map(() => post.slug),
  );
  if (missingFiles.length > 0) {
    console.log(
      `\nNote: ${missingFiles.length} resourceDownload block(s) have no PDF attached ` +
        `(${[...new Set(missingFiles)].join(", ")}). The schema requires one, so those ` +
        `posts will show a validation warning in the Studio until a real file is uploaded. ` +
        `The front end renders them regardless.`,
    );
  }
}

main().catch((error) => {
  console.error("\nSeed failed:", error.message);
  if (error.statusCode === 401 || error.statusCode === 403) {
    console.error("That looks like a token problem — check SANITY_WRITE_TOKEN has Editor permission.");
  }
  process.exit(1);
});
