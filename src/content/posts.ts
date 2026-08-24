/*
 * PLACEHOLDER CONTENT — Component Spec §6.
 * "All article titles, deks, body copy, quotes, FAQ answers: written to be
 * plausible and to stress-test length (notably the 3-line headline test
 * string). Not researched, not fact-checked. Prices, lead times and the
 * 'forty people ops leads' survey are invented."
 *
 * This file stands in for the Sanity dataset. Swapping in the real client means
 * replacing the exports below with GROQ projections of the same shapes — see
 * src/lib/queries.ts, which is the only module the pages import from.
 */

import type { BodyNode, Post } from "../lib/types";
import { dev, hallie, marissa, tom } from "./authors";
import { categoryBySlug, debossedMug, merinoSock, tags } from "./taxonomy";

const tag = (slug: string) => tags.find((t) => t.slug === slug)!;

/* ---- The full article. Every §4 block appears once. ---------------------- */

const remoteGiftsBody: BodyNode[] = [
  {
    _type: "block",
    style: "normal",
    text: "The most-kept item in our survey cost eleven dollars. The least-kept cost sixty-two. That gap is the whole story: remote employees keep things that solve a problem in the room they already work in, and quietly discard anything that asks them to change their life to accommodate a logo.",
  },
  {
    _type: "block",
    style: "normal",
    text: "Below are seventeen ideas that cleared that bar, grouped by per-person budget, with the sourcing notes we'd give a client on a call — decoration constraints, realistic lead times, and where the cheap version falls apart.",
  },
  { _type: "block", style: "h2", text: "What people actually keep" },
  {
    _type: "block",
    style: "normal",
    text: "Three attributes predicted retention better than price, brand, or category. An item was kept when it had a daily job, when it worked without explanation, and when its branding was small enough to survive being seen by someone outside the company.",
  },
  {
    _type: "list",
    listItem: "bullet",
    items: [
      "It has a job — desk, kitchen, commute, or gym. Novelty has no job.",
      "It works alone. No app, no pairing, no proprietary charger.",
      "It passes the coffee-shop test: wearable or usable in public without explaining where you work.",
    ],
  },
  {
    _type: "pullQuote",
    quote:
      "We stopped asking what people would like and started asking what they'd replace. Retention doubled and we spent less.",
    attribution: "Priya N., People Ops Lead",
    attributionDetail: "340-person SaaS",
  },
  { _type: "block", style: "h2", text: "The 17 ideas, by budget" },
  { _type: "block", style: "h3", text: "Under $25 per person" },
  {
    _type: "block",
    style: "normal",
    text: "This tier lives or dies on material quality, not feature count. Buy one good thing rather than three adequate ones, and put the savings into packaging — the unboxing is most of the perceived value at this price.",
  },
  {
    _type: "list",
    listItem: "number",
    items: [
      "Heavyweight crew socks in a single accent color, logo on the sole.",
      "A 14oz ceramic mug with a debossed mark instead of a print.",
      "A dot-grid notebook with a printed inside cover — cheaper than foil, reads more expensive.",
    ],
  },
  { _type: "productSpotlight", product: merinoSock, ctaHref: "/quote?sku=merino-crew-sock" },
  {
    _type: "callout",
    tone: "tip",
    body: [
      "Ask for a pre-production sample with your actual artwork, not a stock sample. Thread color and stitch density change how a logo reads more than the garment does.",
    ],
  },
  { _type: "block", style: "h3", text: "$25 – $60 per person" },
  {
    _type: "block",
    style: "normal",
    text: "The most competitive tier and the easiest to overspend in. This is where insulated drinkware, mid-weight fleece, and small tech accessories all overlap — and where a second color of decoration starts adding real cost per unit.",
  },
  {
    _type: "inlineImage",
    image: {
      src: "/placeholder/decoration-compare.svg",
      alt: "Two fleece jackets side by side, one with a laser-etched patch and one with a puff print",
    },
    caption:
      "Two decoration passes on the same fleece: laser-etched patch (left) held up to eight washes better than the puff print.",
  },
  {
    _type: "imagePair",
    images: [
      { src: "/placeholder/pair-kept.svg", alt: "An insulated bottle in daily use on a desk" },
      { src: "/placeholder/pair-regifted.svg", alt: "A boxed gadget still sealed in its packaging" },
    ],
    captions: ["Kept — daily job", "Regifted — needs an app"],
  },
  {
    _type: "comparisonTable",
    label: "Compare · best drinkware for remote kits",
    columns: ["Item", "Range", "Lead time", "Best for"],
    rows: [
      ["20oz insulated tumbler", "$22–$31", "3–4 wks", "All-team gifting"],
      ["24oz steel bottle", "$26–$38", "4–6 wks", "Field & gym use"],
      ["12oz ceramic mug", "$11–$16", "2–3 wks", "Rush & budget"],
    ],
    footnote: "Ranges assume one-color decoration at 100 units, Aug 2026 quotes.",
    highlightRow: 0,
  },
  {
    _type: "callout",
    tone: "caution",
    body: [
      "Shipping to home addresses is not a line item you can add late. Budget $9–$14 per package domestically and collect addresses two weeks before your in-hands date — address collection, not production, is what misses December.",
    ],
  },
  { _type: "block", style: "h3", text: "$60 and up per person" },
  {
    _type: "block",
    style: "normal",
    text: "Reserve this tier for milestones and executive gifting, not for an all-hands send. At sixty dollars a head the decision stops being about the object and starts being about the note that goes with it — budget writing time the way you budget decoration.",
  },
  { _type: "productSpotlight", product: debossedMug, ctaHref: "/quote?sku=debossed-mug" },
  { _type: "block", style: "h2", text: "Shipping to home addresses" },
  {
    _type: "block",
    style: "normal",
    text: "Individual fulfilment roughly doubles the per-unit handling cost and adds a two-week collection window before anything can ship. It is also the single highest-satisfaction change most programs make, because the alternative is a box of unclaimed hoodies in an office nobody visits.",
  },
  { _type: "block", style: "h2", text: "What to skip entirely" },
  {
    _type: "block",
    style: "normal",
    text: "Bluetooth anything under $20. Stress balls. Full-front logo placement on apparel people are supposed to wear voluntarily. Anything that requires the recipient to download something to justify its existence.",
  },
  {
    _type: "resourceDownload",
    title: "The 2026 Remote Team Gift Guide",
    file: "/downloads/remote-team-gift-guide-2026.pdf",
    pageCount: 18,
    description:
      "All 17 picks with current price ranges, decoration notes, and a shipping cost worksheet.",
    gated: true,
    listId: "gift-guide-2026",
  },
];

/* ---- Body used by every other post. Short, but real enough that readTime
 * derives and the TOC threshold (≥4 H2s) is correctly *not* met. ---------- */

function shortBody(topic: string, headings: string[]): BodyNode[] {
  const nodes: BodyNode[] = [
    {
      _type: "block",
      style: "normal",
      text: `${topic} PLACEHOLDER body copy — written to prove the layout and the reading measure, not to be published.`,
    },
  ];
  for (const heading of headings) {
    nodes.push({ _type: "block", style: "h2", text: heading });
    nodes.push({
      _type: "block",
      style: "normal",
      text: "Two or three paragraphs of sourcing detail sit here in a real article: what it costs, what it takes to produce, and where the cheap version stops working. This stand-in exists so the type ramp and the block spacing can be reviewed against real line lengths rather than lorem ipsum.",
    });
  }
  return nodes;
}

/* ---- Posts, newest first ------------------------------------------------- */

export const posts: Post[] = [
  {
    title: "17 Corporate Gift Ideas Your Remote Team Will Actually Use",
    slug: "remote-team-gift-ideas",
    dek: "We asked forty people ops leads what their teams kept, what got regifted, and what quietly died in a drawer. The pattern had almost nothing to do with price — and a lot to do with whether the thing had a job.",
    excerpt:
      "Forty people ops leads on what their teams kept, what got regifted, and what died in a drawer.",
    heroImage: {
      src: "/placeholder/remote-gift-kit.svg",
      alt: "A first-week kit laid out on a table: insulated bottle, notebook, socks and a printed card",
      caption:
        "A first-week kit assembled for a 60-person distributed team: insulated bottle, notebook, socks, and a card that explains what the budget was.",
      credit: "Corporate Specialties",
    },
    category: categoryBySlug("gifting-guides"),
    tags: [tag("remote-teams"), tag("onboarding"), tag("under-25")],
    author: marissa,
    publishedAt: "2026-08-18",
    readTime: 11,
    reviewedBy: "sourcing",
    isFeatured: true,
    body: remoteGiftsBody,
    faq: [
      {
        question: "How much should we budget per person for a remote team gift?",
        answer: [
          "Most programs land between $25 and $60 per person before shipping. Add $9 to $14 per package for domestic home delivery, and decide early whether that comes out of the same line item — it is the number that surprises people.",
        ],
      },
      {
        question: "How early do we need to order for a December in-hands date?",
        answer: [
          "Work backwards from December 12. Production runs three to six weeks depending on decoration method, and home address collection realistically needs two weeks ahead of that. Late November orders become January gifts.",
        ],
      },
      {
        question: "Can you ship to individual home addresses?",
        answer: [
          "Yes. Kitting and individual fulfillment are handled in house, including an address collection link you send to employees so you never touch a spreadsheet of home addresses.",
        ],
      },
    ],
  },
  {
    title: "How to Budget a Swag Program You'll Actually Repeat Next Year",
    slug: "budget-a-repeatable-swag-program",
    dek: "A per-head model that survives a mid-year freeze, with the math shown.",
    excerpt: "A per-head model that survives a mid-year freeze, with the math shown.",
    heroImage: { src: "/placeholder/budget-desk.svg", alt: "A budget worksheet open on a desk" },
    category: categoryBySlug("swag-program-strategy"),
    tags: [tag("lead-times")],
    author: hallie,
    publishedAt: "2026-08-15",
    readTime: 9,
    body: shortBody("Budgeting.", ["Start from headcount", "Where programs overspend"]),
  },
  {
    title: "The 2026 Drinkware Shortlist: What's Actually Shipping On Time",
    slug: "2026-drinkware-shortlist",
    dek: "Six bottles and tumblers we can still land inside a four-week window.",
    excerpt: "Six bottles and tumblers we can still land inside a four-week window.",
    heroImage: {
      src: "/placeholder/drinkware-shortlist.svg",
      alt: "A row of insulated bottles and tumblers",
    },
    category: categoryBySlug("trending-products"),
    tags: [tag("drinkware"), tag("lead-times")],
    author: dev,
    publishedAt: "2026-08-14",
    readTime: 7,
    body: shortBody("Drinkware.", ["The shortlist", "What slipped"]),
  },
  {
    title: "Trade Show Giveaways That Survive the Walk to the Car",
    slug: "trade-show-giveaways",
    dek: "Booth swag is judged twice: once at the table and once in a hotel room at 9pm.",
    heroImage: { src: "/placeholder/trade-show.svg", alt: "A trade show booth table with giveaways" },
    category: categoryBySlug("marketing-ideas"),
    tags: [tag("apparel")],
    author: tom,
    publishedAt: "2026-08-14",
    readTime: 8,
    body: shortBody("Trade shows.", ["The hotel-room test", "What to bring instead"]),
  },
  {
    /** No heroImage — the §3.1 monogram fallback tile. */
    title: "Onboarding Kits That Don't Feel Like Onboarding Kits",
    slug: "onboarding-kits",
    dek: "What to send day one, week two, and month six — and what to skip.",
    excerpt: "What to send day one, week two, and month six — and what to skip.",
    category: categoryBySlug("marketing-ideas"),
    tags: [tag("onboarding")],
    author: tom,
    publishedAt: "2026-08-12",
    readTime: 6,
    body: shortBody("Onboarding.", ["Day one", "Month six"]),
  },
  {
    title: "Sustainable Swag: Reading Certifications Without Getting Greenwashed",
    slug: "reading-sustainability-certifications",
    dek: "Four marks that mean something, and three that mean a supplier paid a fee.",
    heroImage: {
      src: "/placeholder/sustainable-goods.svg",
      alt: "Certified organic cotton goods on a neutral background",
    },
    category: categoryBySlug("industry-trends"),
    author: dev,
    publishedAt: "2026-08-11",
    readTime: 10,
    body: shortBody("Certifications.", ["Marks worth checking", "Marks worth ignoring"]),
  },
  {
    title: "What a $25 Per-Person Gift Actually Buys in 2026",
    slug: "what-25-dollars-buys",
    dek: "The sub-$25 tier moved more than any other this year. Here is where it landed.",
    excerpt: "The sub-$25 tier moved more than any other this year.",
    heroImage: { src: "/placeholder/gift-under-25.svg", alt: "A flat-lay of gifts under $25" },
    category: categoryBySlug("gifting-guides"),
    tags: [tag("under-25"), tag("remote-teams")],
    author: marissa,
    publishedAt: "2026-08-08",
    readTime: 6,
    body: shortBody("Sub-$25.", ["What moved", "What to avoid"]),
  },
  {
    title: "Lead Times Are Back to Normal. Your Calendar Isn't.",
    slug: "lead-times-versus-your-calendar",
    dek: "Production recovered eighteen months ago. Internal approval cycles did not.",
    heroImage: {
      src: "/placeholder/warehouse-calendar.svg",
      alt: "A production calendar pinned in a warehouse",
    },
    category: categoryBySlug("industry-trends"),
    tags: [tag("lead-times"), tag("holiday")],
    author: dev,
    publishedAt: "2026-08-05",
    readTime: 5,
    body: shortBody("Lead times.", ["What recovered", "What did not"]),
  },
  {
    /** No heroImage — fallback tile on a category archive. */
    title: "Client Gifting Limits by Industry: Finance, Health, Public Sector",
    slug: "client-gifting-limits-by-industry",
    dek: "The per-recipient caps that decide your budget before you have picked anything.",
    category: categoryBySlug("gifting-guides"),
    tags: [tag("client-gifts")],
    author: hallie,
    publishedAt: "2026-08-03",
    readTime: 12,
    body: shortBody("Compliance.", ["Finance", "Health", "Public sector"]),
  },
  {
    title: "Six Ways to Kill a Swag Budget — and How to Justify It Instead",
    slug: "six-ways-to-kill-a-swag-budget",
    dek: "The line item is rarely cut on cost. It is cut on the absence of a number.",
    heroImage: {
      src: "/placeholder/spreadsheet-budget.svg",
      alt: "A per-head budget spreadsheet on a laptop screen",
    },
    category: categoryBySlug("swag-program-strategy"),
    author: hallie,
    publishedAt: "2026-08-01",
    readTime: 9,
    body: shortBody("Budget defence.", ["How it dies", "How to defend it"]),
  },
  {
    title: "Five-Year Anniversary Gifts That Aren't a Glass Award",
    slug: "five-year-anniversary-gifts",
    dek: "Milestone gifting is the one tier where the note matters more than the object.",
    heroImage: { src: "/placeholder/milestone-gift.svg", alt: "A milestone gift box and card" },
    category: categoryBySlug("gifting-guides"),
    tags: [tag("milestones")],
    author: marissa,
    publishedAt: "2026-07-30",
    readTime: 7,
    body: shortBody("Milestones.", ["What to send", "What to write"]),
  },
  {
    title: "Blanket, Bottle, Beanie: The Cold-Weather Trio, Ranked",
    slug: "cold-weather-trio-ranked",
    dek: "Three items, one budget, and a clear order of operations.",
    heroImage: {
      src: "/placeholder/cold-weather-trio.svg",
      alt: "A blanket, bottle and beanie arranged together",
    },
    category: categoryBySlug("trending-products"),
    tags: [tag("apparel"), tag("holiday")],
    author: dev,
    publishedAt: "2026-07-28",
    readTime: 7,
    body: shortBody("Cold weather.", ["The ranking", "The budget split"]),
  },
  {
    title: "The Holiday Gifting Calendar: Work Backwards From December 12",
    slug: "holiday-gifting-calendar",
    dek: "Every date that matters, counted back from the one date that does not move.",
    heroImage: {
      src: "/placeholder/holiday-packaging.svg",
      alt: "Holiday packaging moving along a kitting line",
    },
    category: categoryBySlug("gifting-guides"),
    tags: [tag("holiday")],
    author: hallie,
    publishedAt: "2026-07-26",
    readTime: 9,
    body: shortBody("Holiday timing.", ["The backward count", "Where it slips"]),
  },
  {
    title: "Why Your Logo Shrinks on a Curved Surface",
    slug: "logo-on-curved-surfaces",
    dek: "Decoration area is not the same as printable area, and a bottle proves it.",
    category: categoryBySlug("marketing-ideas"),
    author: tom,
    publishedAt: "2026-07-24",
    readTime: 4,
    body: shortBody("Decoration.", ["Curvature", "What to send your supplier"]),
  },
  {
    title: "Choice Portals vs. Curated Kits: Which Lands Better",
    slug: "choice-portals-vs-curated-kits",
    dek: "Choice raises satisfaction and cost at the same rate. Here is where the lines cross.",
    heroImage: {
      src: "/placeholder/choice-portal.svg",
      alt: "A choice portal on a laptop next to a curated gift kit",
    },
    category: categoryBySlug("gifting-guides"),
    tags: [tag("client-gifts")],
    author: marissa,
    publishedAt: "2026-07-22",
    readTime: 8,
    body: shortBody("Choice vs curation.", ["Where choice wins", "Where it costs"]),
  },
  {
    title: "The Client Gift Rules Nobody Tells You About",
    slug: "client-gift-rules",
    dek: "Disclosure thresholds, reciprocity policies, and the gifts that get returned.",
    category: categoryBySlug("gifting-guides"),
    tags: [tag("client-gifts")],
    author: hallie,
    publishedAt: "2026-07-21",
    readTime: 6,
    body: shortBody("Client gifting.", ["Thresholds", "Returns"]),
  },
  {
    title: "A One-Page Intake Form for Internal Swag Requests",
    slug: "swag-request-intake-form",
    dek: "Nine questions that stop a Slack message from becoming a rush order.",
    category: categoryBySlug("swag-program-strategy"),
    author: hallie,
    publishedAt: "2026-07-17",
    readTime: 3,
    body: shortBody("Intake.", ["The nine questions", "What to do with the answers"]),
  },
];

/* ---- Guides (isGuide) — PLACEHOLDER list per §6 --------------------------- */

export const guides: Post[] = [
  {
    title: "The Complete Guide to Corporate Gifting Compliance",
    slug: "corporate-gifting-compliance",
    dek: "Disclosure thresholds, per-recipient caps and record-keeping, by sector.",
    category: categoryBySlug("gifting-guides"),
    author: hallie,
    publishedAt: "2026-02-10",
    updatedAt: "2026-07-04",
    readTime: 24,
    isGuide: true,
    body: shortBody("Compliance guide.", ["Scope", "By sector", "Records", "Review cadence"]),
  },
  {
    title: "Swag Program Playbook: First Order to Annual Budget",
    slug: "swag-program-playbook",
    dek: "Standing a program up from nothing, and keeping it funded past year one.",
    category: categoryBySlug("swag-program-strategy"),
    author: hallie,
    publishedAt: "2026-01-20",
    updatedAt: "2026-08-02",
    readTime: 31,
    isGuide: true,
    body: shortBody("Playbook.", ["First order", "Second order", "Annual budget", "Handover"]),
  },
  {
    title: "Apparel Sizing & Fit: A Buyer's Field Guide",
    slug: "apparel-sizing-and-fit",
    dek: "Size curves, unisex versus cut ranges, and how to run a size collection that works.",
    category: categoryBySlug("trending-products"),
    author: dev,
    publishedAt: "2025-11-12",
    updatedAt: "2026-06-18",
    readTime: 18,
    isGuide: true,
    body: shortBody("Sizing.", ["Size curves", "Cut ranges", "Collection", "Reorders"]),
  },
  {
    title: "Decoration Methods: Embroidery, Screen Print, DTG, Laser",
    slug: "decoration-methods",
    dek: "What each method costs, what it survives, and which artwork it refuses.",
    category: categoryBySlug("trending-products"),
    author: dev,
    publishedAt: "2025-09-30",
    updatedAt: "2026-05-22",
    readTime: 15,
    isGuide: true,
    body: shortBody("Decoration.", ["Embroidery", "Screen print", "DTG", "Laser"]),
  },
];

/** PLACEHOLDER (§6) — "12 guides" is illustrative; wire to a real derived count. */
export const totalGuideCount = 12;
