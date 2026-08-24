/*
 * Turns the seed content into an in-memory dataset: the same document shapes
 * the seed script writes to Sanity, plus the `sanity.imageAsset` documents that
 * `asset->url` dereferences against.
 *
 * Shared by scripts/local-dataset.mjs (verification) and scripts/seed.mjs
 * (the real write), so the two can never describe different content.
 */

import { resetKeys, img, keyed, p, ref } from "./portable-text.mjs";
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

/** Deterministic fake asset ids, matching Sanity's `image-{hash}-{dims}-{ext}` shape. */
export function fakeAssetId(slot) {
  const hash = slot.replace(/[^a-z0-9]/g, "").padEnd(40, "0").slice(0, 40);
  return `image-${hash}-1200x800-jpg`;
}

/** The asset documents `asset->` resolves against. */
function assetDocuments() {
  return Object.entries(images).map(([, spec]) => {
    const _id = fakeAssetId(spec.slot);
    return {
      _id,
      _type: "sanity.imageAsset",
      url: `https://cdn.sanity.io/images/local/production/${spec.slot}-1200x800.jpg`,
      originalFilename: `${spec.slot}.jpg`,
      metadata: {
        // A 1x1 grey pixel — enough to prove the LQIP path renders.
        lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKAA/9k=",
        dimensions: { width: 1200, height: 800, aspectRatio: 1.5 },
      },
    };
  });
}

const slug = (current) => ({ _type: "slug", current });
const imageRef = (name) => img(fakeAssetId(images[name].slot), images[name].alt);

function resolveBlock(node) {
  if (node._type === "inlineImage") {
    const { image, ...rest } = node;
    return { ...rest, ...imageRef(image), _type: "inlineImage" };
  }
  if (node._type === "imagePair") {
    return {
      ...node,
      images: keyed(
        node.images.map((entry) => ({
          ...imageRef(entry.image),
          ...(entry.caption ? { caption: entry.caption } : {}),
        })),
      ),
    };
  }
  if (node._type === "productSpotlight") return { ...node, product: ref(node.product) };
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
  return node;
}

export function buildDataset() {
  resetKeys();

  const docs = [
    ...assetDocuments(),

    ...categories.map((c) => ({
      _id: c._id,
      _type: "category",
      title: c.title,
      slug: slug(c.slug),
      description: c.description,
      order: c.order,
    })),

    ...tags.map((t) => ({ _id: t._id, _type: "tag", title: t.title, slug: slug(t.slug) })),

    ...authors.map((a) => ({
      _id: a._id,
      _type: "author",
      name: a.name,
      slug: slug(a.slug),
      ...(a.role ? { role: a.role } : {}),
      ...(a.image ? { avatar: imageRef(a.image) } : {}),
      ...(a.bio ? { bio: a.bio } : {}),
      ...(a.links ? { links: keyed(a.links) } : {}),
    })),

    ...products.map((pr) => ({
      _id: pr._id,
      _type: "product",
      name: pr.name,
      ...(pr.slug ? { slug: slug(pr.slug) } : {}),
      ...(pr.image ? { image: imageRef(pr.image) } : {}),
      oneLiner: pr.oneLiner,
      ...(pr.priceLow !== undefined ? { priceLow: pr.priceLow, priceHigh: pr.priceHigh } : {}),
      ...(pr.minQty ? { minQty: pr.minQty } : {}),
    })),

    ...posts.map((post) => ({
      _id: post._id,
      _type: "post",
      title: post.title,
      slug: slug(post.slug),
      dek: post.dek,
      ...(post.excerpt ? { excerpt: post.excerpt } : {}),
      ...(post.hero
        ? {
            heroImage: {
              ...imageRef(post.hero.image),
              ...(post.hero.caption ? { caption: post.hero.caption } : {}),
              ...(post.hero.credit ? { credit: post.hero.credit } : {}),
            },
          }
        : {}),
      category: ref(post.category),
      author: ref(post.author),
      ...(post.tags ? { tags: keyed(post.tags.map((t) => ref(t))) } : {}),
      publishedAt: post.publishedAt,
      ...(post.updatedAt ? { updatedAt: post.updatedAt } : {}),
      ...(post.readTime ? { readTime: post.readTime } : {}),
      ...(post.reviewedBy ? { reviewedBy: post.reviewedBy } : {}),
      ...(post.featured ? { featured: true } : {}),
      ...(post.isGuide ? { isGuide: true } : {}),
      body: post.body.map(resolveBlock),
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
    })),
  ];

  return docs;
}
