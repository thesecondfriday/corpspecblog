/*
 * PLACEHOLDER CONTENT — Component Spec §6.
 * "Author names & bios: Marissa Vaughn, Dev Okonkwo, Hallie Brenner, Tom Reyes,
 * 'Priya N.' — all fictional. Replace before launch; the bio block's tone is
 * the only thing to keep."
 *
 * Tom Reyes deliberately has no avatar and no bio, so the initials circle
 * (§3.7) and the omitted AuthorBio block (§3.9) both render somewhere real.
 */

import type { Author } from "../lib/types";

export const marissa: Author = {
  name: "Marissa Vaughn",
  slug: "marissa-vaughn",
  role: "Editorial Director",
  avatar: { src: "/placeholder/author-marissa.svg", alt: "Marissa Vaughn" },
  bio: "Editorial Director at Corporate Specialties. Nine years running merch programs in-house before switching sides — she has personally apologized for a late hoodie order and does not intend to do it again.",
  links: [{ label: "LinkedIn", url: "https://www.linkedin.com/" }],
  postCount: 34,
};

export const dev: Author = {
  name: "Dev Okonkwo",
  slug: "dev-okonkwo",
  role: "Sourcing Lead",
  avatar: { src: "/placeholder/author-dev.svg", alt: "Dev Okonkwo" },
  bio: "Sourcing lead. Spends most of the year on factory calls about stitch density and container dates, and the rest explaining why a four-week lead time is not a suggestion.",
  postCount: 21,
};

export const hallie: Author = {
  name: "Hallie Brenner",
  slug: "hallie-brenner",
  role: "Program Strategist",
  avatar: { src: "/placeholder/author-hallie.svg", alt: "Hallie Brenner" },
  bio: "Builds and rebuilds swag programs for companies between 50 and 5,000 people. Keeps a spreadsheet of every budget she has watched get frozen mid-year.",
  postCount: 17,
};

/** No avatar, no bio — the fallback paths in §3.7 and §3.9. */
export const tom: Author = {
  name: "Tom Reyes",
  slug: "tom-reyes",
  role: "Contributing Writer",
  postCount: 6,
};

export const authors = [marissa, dev, hallie, tom];
