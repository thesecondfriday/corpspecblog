/*
 * Categories are REAL — Component Spec §6: "The five categories, by contrast,
 * came from the brief and are real." The descriptions are placeholder copy.
 * Tags are invented (§6).
 */

import type { Category, Product, Tag } from "../lib/types";

export const categories: Category[] = [
  {
    title: "Gifting Guides",
    slug: "gifting-guides",
    description:
      "Who to gift, when, and what it costs. Shortlists built for real budgets and real in-hands dates — holiday, milestones, onboarding, client thank-yous — with the compliance footnotes nobody enjoys reading but everybody needs.",
    order: 1,
  },
  {
    title: "Trending Products",
    slug: "trending-products",
    description:
      "What is actually shipping this quarter, what has quietly gone out of stock, and which categories are worth the premium. Written from current supplier quotes rather than a catalogue refresh cycle.",
    order: 2,
  },
  {
    title: "Marketing Ideas",
    slug: "marketing-ideas",
    description:
      "Campaign-side thinking: trade show giveaways that survive the walk to the car, onboarding kits that do not feel like onboarding kits, and how a logo behaves once it leaves the brand guidelines PDF.",
    order: 3,
  },
  {
    title: "Swag Program Strategy",
    slug: "swag-program-strategy",
    description:
      "Running the program, not placing the order. Per-head budget models that survive a freeze, intake forms that stop ad-hoc requests, and the arguments that get a swag line item renewed next year.",
    order: 4,
  },
  {
    title: "Industry Trends",
    slug: "industry-trends",
    description:
      "Lead times, materials, certifications and pricing pressure — the supply-side context behind every quote you receive. Reported for buyers, not for the trade press.",
    order: 5,
  },
];

export function categoryBySlug(slug: string): Category {
  const found = categories.find((c) => c.slug === slug);
  if (!found) throw new Error(`Unknown category: ${slug}`);
  return found;
}

/** PLACEHOLDER (§6) — invented to prove the archive filter row. */
export const tags: Tag[] = [
  { title: "Remote teams", slug: "remote-teams" },
  { title: "Under $25", slug: "under-25" },
  { title: "Client gifts", slug: "client-gifts" },
  { title: "Holiday", slug: "holiday" },
  { title: "Onboarding", slug: "onboarding" },
  { title: "Milestones", slug: "milestones" },
  { title: "Apparel", slug: "apparel" },
  { title: "Drinkware", slug: "drinkware" },
  { title: "Lead times", slug: "lead-times" },
];

export function tagBySlug(slug: string): Tag {
  const found = tags.find((t) => t.slug === slug);
  if (!found) throw new Error(`Unknown tag: ${slug}`);
  return found;
}

/** PLACEHOLDER (§6) — prices and minimums are invented. */
export const merinoSock: Product = {
  name: "Merino Crew Sock, Sole-Marked",
  slug: "merino-crew-sock",
  image: { src: "/placeholder/product-sock.svg", alt: "Merino crew sock with a sole-marked logo" },
  oneLiner: "Mid-weight merino blend that survives a dryer — the version people re-wear, not re-gift.",
  priceLow: 14,
  priceHigh: 19,
  minQty: 100,
};

/** No image — exercises the §4.4 "media column collapses" path. */
export const debossedMug: Product = {
  name: "14oz Debossed Stoneware Mug",
  oneLiner: "A debossed mark instead of a print, so the logo cannot chip off in a dishwasher.",
  priceLow: 11,
  priceHigh: 16,
  minQty: 72,
};
