/*
 * Seed content for the CSBLOG dataset.
 *
 * One fully populated post per category (five), collectively exercising every
 * §4 article-body block type. The flagship gifting-guides post carries most of
 * them so a single page can be reviewed end to end.
 *
 * This is PLACEHOLDER EDITORIAL — plausible, unresearched, and not approved
 * copy. Component Spec §6 governs: author names are fictional, and every price,
 * lead time and the "forty people ops leads" survey are invented. Replace
 * before launch.
 *
 * Document _ids are deterministic (`post.remote-team-gift-ideas`) so the seed
 * can be re-run to update rather than duplicate. Ordinary editor-created
 * content should keep Sanity's generated ids — this convention is for seeds.
 */

import { blk, h2, h3, img, keyed, ol, p, ref, ul } from "./portable-text.mjs";

/*
 * Images the seed uploads. `slot` maps to public/placeholder/<slot>.svg, which
 * the runner rasterises before upload — Sanity's image pipeline can't crop or
 * hotspot an SVG.
 */
export const images = {
  heroRemote: { slot: "remote-gift-kit", alt: "A first-week kit laid out on a table: insulated bottle, notebook, socks and a printed card" },
  heroDrinkware: { slot: "drinkware-shortlist", alt: "A row of insulated bottles and tumblers on a warm background" },
  heroTradeShow: { slot: "trade-show", alt: "A trade show booth table stacked with branded giveaways" },
  heroBudget: { slot: "spreadsheet-budget", alt: "A per-head swag budget spreadsheet open on a laptop" },
  heroLeadTimes: { slot: "warehouse-calendar", alt: "A production calendar pinned to a warehouse wall" },
  bodyDecoration: { slot: "decoration-compare", alt: "Two fleece jackets side by side, one with a laser-etched patch and one with a puff print" },
  pairKept: { slot: "pair-kept", alt: "An insulated bottle in daily use on a desk" },
  pairRegifted: { slot: "pair-regifted", alt: "A boxed gadget still sealed in its original packaging" },
  productSock: { slot: "product-sock", alt: "A merino crew sock with a logo knitted into the sole" },
  authorMarissa: { slot: "author-marissa", alt: "Marissa Vaughn" },
  authorDev: { slot: "author-dev", alt: "Dev Okonkwo" },
  authorHallie: { slot: "author-hallie", alt: "Hallie Brenner" },
};

/* ---- Categories — real, from the brief ----------------------------------- */

export const categories = [
  {
    _id: "category.gifting-guides",
    title: "Gifting Guides",
    slug: "gifting-guides",
    order: 1,
    description:
      "Who to gift, when, and what it costs. Shortlists built for real budgets and real in-hands dates — holiday, milestones, onboarding, client thank-yous — with the compliance footnotes nobody enjoys reading but everybody needs.",
  },
  {
    _id: "category.trending-products",
    title: "Trending Products",
    slug: "trending-products",
    order: 2,
    description:
      "What is actually shipping this quarter, what has quietly gone out of stock, and which categories are worth the premium. Written from current supplier quotes rather than a catalogue refresh cycle, so the lead times are the ones you will be quoted.",
  },
  {
    _id: "category.marketing-ideas",
    title: "Marketing Ideas",
    slug: "marketing-ideas",
    order: 3,
    description:
      "Campaign-side thinking: trade show giveaways that survive the walk to the car, onboarding kits that do not feel like onboarding kits, and how a logo actually behaves once it leaves the brand guidelines PDF and lands on a curved surface.",
  },
  {
    _id: "category.swag-program-strategy",
    title: "Swag Program Strategy",
    slug: "swag-program-strategy",
    order: 4,
    description:
      "Running the program, not placing the order. Per-head budget models that survive a mid-year freeze, intake forms that stop ad-hoc requests, and the arguments that get a swag line item renewed instead of quietly cut next year.",
  },
  {
    _id: "category.industry-trends",
    title: "Industry Trends",
    slug: "industry-trends",
    order: 5,
    description:
      "Lead times, materials, certifications and pricing pressure — the supply-side context behind every quote you receive. Reported for the people who have to buy this stuff, not for the trade press that covers the people who sell it.",
  },
];

/* ---- Tags ---------------------------------------------------------------- */

export const tags = [
  { _id: "tag.remote-teams", title: "Remote teams", slug: "remote-teams" },
  { _id: "tag.under-25", title: "Under $25", slug: "under-25" },
  { _id: "tag.client-gifts", title: "Client gifts", slug: "client-gifts" },
  { _id: "tag.holiday", title: "Holiday", slug: "holiday" },
  { _id: "tag.onboarding", title: "Onboarding", slug: "onboarding" },
  { _id: "tag.milestones", title: "Milestones", slug: "milestones" },
  { _id: "tag.apparel", title: "Apparel", slug: "apparel" },
  { _id: "tag.drinkware", title: "Drinkware", slug: "drinkware" },
  { _id: "tag.lead-times", title: "Lead times", slug: "lead-times" },
];

/* ---- Authors — fictional (§6) -------------------------------------------- */

export const authors = [
  {
    _id: "author.marissa-vaughn",
    name: "Marissa Vaughn",
    slug: "marissa-vaughn",
    role: "Editorial Director",
    image: "authorMarissa",
    bio: "Editorial Director at Corporate Specialties. Nine years running merch programs in-house before switching sides — she has personally apologised for a late hoodie order and does not intend to do it again.",
    links: [{ label: "LinkedIn", url: "https://www.linkedin.com/" }],
  },
  {
    _id: "author.dev-okonkwo",
    name: "Dev Okonkwo",
    slug: "dev-okonkwo",
    role: "Sourcing Lead",
    image: "authorDev",
    bio: "Spends most of the year on factory calls about stitch density and container dates, and the rest of it explaining why a four-week lead time is a fact rather than an opening position.",
    links: [{ label: "LinkedIn", url: "https://www.linkedin.com/" }],
  },
  {
    _id: "author.hallie-brenner",
    name: "Hallie Brenner",
    slug: "hallie-brenner",
    role: "Program Strategist",
    image: "authorHallie",
    bio: "Builds and rebuilds swag programs for companies between 50 and 5,000 people. Keeps a running spreadsheet of every budget she has watched get frozen in the second quarter.",
  },
  {
    /* No photo and no bio — exercises the initials-circle byline (§3.7) and the
     * omitted-bio-block path (§3.9) against real data. */
    _id: "author.tom-reyes",
    name: "Tom Reyes",
    slug: "tom-reyes",
    role: "Contributing Writer",
  },
];

/* ---- Products ------------------------------------------------------------ */

export const products = [
  {
    _id: "product.merino-crew-sock",
    name: "Merino Crew Sock, Sole-Marked",
    slug: "merino-crew-sock",
    image: "productSock",
    oneLiner: "Mid-weight merino blend that survives a dryer — the version people re-wear, not re-gift.",
    priceLow: 14,
    priceHigh: 19,
    minQty: 100,
  },
  {
    /* No image — exercises §4.4's "media column collapses, text-only block". */
    _id: "product.debossed-mug",
    name: "14oz Debossed Stoneware Mug",
    oneLiner: "A debossed mark instead of a print, so the logo cannot chip off in a dishwasher.",
    priceLow: 11,
    priceHigh: 16,
    minQty: 72,
  },
];

/* ---- Posts --------------------------------------------------------------- */

export const posts = [
  /* 1 · Gifting Guides — the flagship. Carries most block types. */
  {
    _id: "post.remote-team-gift-ideas",
    title: "17 Corporate Gift Ideas Your Remote Team Will Actually Use",
    slug: "remote-team-gift-ideas",
    category: "category.gifting-guides",
    author: "author.marissa-vaughn",
    tags: ["tag.remote-teams", "tag.onboarding", "tag.under-25"],
    publishedAt: "2026-08-18T09:00:00.000Z",
    readTime: 11,
    reviewedBy: "sourcing",
    featured: true,
    dek: "We asked forty people ops leads what their teams kept, what got regifted, and what quietly died in a drawer. The pattern had almost nothing to do with price — and a lot to do with whether the thing had a job.",
    excerpt: "Forty people ops leads on what their teams kept, what got regifted, and what died in a drawer.",
    hero: {
      image: "heroRemote",
      caption:
        "A first-week kit assembled for a 60-person distributed team: insulated bottle, notebook, socks, and a card that explains what the budget was.",
      credit: "Corporate Specialties",
    },
    seo: {
      metaTitle: "17 Corporate Gift Ideas Remote Teams Actually Keep",
      metaDescription:
        "Forty people ops leads on which corporate gifts their remote teams kept and which got regifted, with budgets, lead times and sourcing notes.",
    },
    body: [
      p("The most-kept item in our survey cost eleven dollars. The least-kept cost sixty-two. That gap is the whole story: remote employees keep things that solve a problem in the room they already work in, and quietly discard anything that asks them to change their life to accommodate a logo."),
      p("Below are seventeen ideas that cleared that bar, grouped by per-person budget, with the sourcing notes we'd give a client on a call — decoration constraints, realistic lead times, and where the cheap version falls apart."),

      h2("What people actually keep"),
      p("Three attributes predicted retention better than price, brand, or category. An item was kept when it had a **daily job**, when it worked without explanation, and when its branding was small enough to survive being seen by someone outside the company."),
      ...ul([
        "It has a job — desk, kitchen, commute, or gym. Novelty has no job.",
        "It works alone. No app, no pairing, no proprietary charger.",
        "It passes the coffee-shop test: wearable or usable in public without explaining where you work.",
      ]),

      blk({
        _type: "pullQuote",
        quote: "We stopped asking what people would like and started asking what they'd replace. Retention doubled and we spent less.",
        attribution: "Priya N., People Ops Lead",
        attributionDetail: "340-person SaaS",
      }),

      h2("The 17 ideas, by budget"),
      h3("Under $25 per person"),
      p("This tier lives or dies on material quality, not feature count. Buy one good thing rather than three adequate ones, and put the savings into packaging — the unboxing is most of the perceived value at this price."),
      ...ol([
        "Heavyweight crew socks in a single accent colour, logo on the sole.",
        "A 14oz ceramic mug with a debossed mark instead of a print.",
        "A dot-grid notebook with a printed inside cover — cheaper than foil, reads more expensive.",
      ]),

      blk({ _type: "productSpotlight", product: "product.merino-crew-sock", ctaHref: "/quote?sku=merino-crew-sock" }),

      blk({
        _type: "callout",
        tone: "tip",
        body: [p("Ask for a pre-production sample with your actual artwork, not a stock sample. Thread colour and stitch density change how a logo reads more than the garment does.")],
      }),

      h3("$25 – $60 per person"),
      p("The most competitive tier and the easiest to overspend in. This is where insulated drinkware, mid-weight fleece and small tech accessories all overlap — and where a second colour of decoration starts adding real cost per unit."),

      blk({
        _type: "inlineImage",
        image: "bodyDecoration",
        caption: "Two decoration passes on the same fleece: the laser-etched patch (left) held up to eight washes better than the puff print.",
        width: "measure",
        ratio: "3/2",
      }),

      blk({
        _type: "imagePair",
        images: [
          { image: "pairKept", caption: "Kept — daily job" },
          { image: "pairRegifted", caption: "Regifted — needs an app" },
        ],
        ratio: "4/5",
      }),

      blk({
        _type: "comparisonTable",
        label: "Compare · best drinkware for remote kits",
        columns: ["Item", "Range", "Lead time", "Best for"],
        rows: [
          ["20oz insulated tumbler", "$22–$31", "3–4 wks", "All-team gifting"],
          ["24oz steel bottle", "$26–$38", "4–6 wks", "Field & gym use"],
          ["12oz ceramic mug", "$11–$16", "2–3 wks", "Rush & budget"],
        ],
        footnote: "Ranges assume one-colour decoration at 100 units, Aug 2026 quotes.",
        highlightRow: 1,
      }),

      blk({
        _type: "callout",
        tone: "caution",
        body: [p("Shipping to home addresses is not a line item you can add late. Budget $9–$14 per package domestically and collect addresses two weeks before your in-hands date — address collection, not production, is what misses December.")],
      }),

      h3("$60 and up per person"),
      p("Reserve this tier for milestones and executive gifting, not for an all-hands send. At sixty dollars a head the decision stops being about the object and starts being about the note that goes with it — budget writing time the way you budget decoration."),

      blk({ _type: "productSpotlight", product: "product.debossed-mug", ctaHref: "/quote?sku=debossed-mug" }),

      h2("Shipping to home addresses"),
      p("Individual fulfilment roughly doubles the per-unit handling cost and adds a two-week collection window before anything can ship. It is also the single highest-satisfaction change most programs make, because the alternative is a box of unclaimed hoodies in an office nobody visits."),
      p("If you are working to a December date, our [holiday gifting calendar](/blog/gifting-guides/holiday-gifting-calendar) counts the whole thing backwards for you."),

      h2("What to skip entirely"),
      p("Bluetooth anything under $20. Stress balls. Full-front logo placement on apparel people are supposed to wear voluntarily. Anything that requires the recipient to download something to justify its existence."),

      blk({
        _type: "resourceDownload",
        title: "The 2026 Remote Team Gift Guide",
        pageCount: 18,
        description: "All 17 picks with current price ranges, decoration notes, and a shipping cost worksheet.",
        gated: true,
        listId: "gift-guide-2026",
      }),
    ],
    faq: [
      {
        question: "How much should we budget per person for a remote team gift?",
        answer: ["Most programs land between $25 and $60 per person before shipping. Add $9 to $14 per package for domestic home delivery, and decide early whether that comes out of the same line item — it is the number that surprises people."],
      },
      {
        question: "How early do we need to order for a December in-hands date?",
        answer: ["Work backwards from December 12. Production runs three to six weeks depending on decoration method, and home address collection realistically needs two weeks ahead of that. Late November orders become January gifts."],
      },
      {
        question: "Can you ship to individual home addresses?",
        answer: ["Yes. Kitting and individual fulfilment are handled in house, including an address collection link you send to employees so you never touch a spreadsheet of home addresses."],
      },
    ],
  },

  /* 2 · Trending Products — carries the FAQ block inline (not the document field). */
  {
    _id: "post.2026-drinkware-shortlist",
    title: "The 2026 Drinkware Shortlist: What's Actually Shipping On Time",
    slug: "2026-drinkware-shortlist",
    category: "category.trending-products",
    author: "author.dev-okonkwo",
    tags: ["tag.drinkware", "tag.lead-times"],
    publishedAt: "2026-08-14T09:00:00.000Z",
    readTime: 7,
    isGuide: true,
    updatedAt: "2026-08-19T09:00:00.000Z",
    dek: "Six bottles and tumblers we can still land inside a four-week window, and the three that quietly slipped to eight.",
    excerpt: "Six bottles and tumblers we can still land inside a four-week window.",
    hero: { image: "heroDrinkware", caption: "Current stock on the sourcing bench, August 2026." },
    body: [
      p("Drinkware is the most requested category we quote and the one where lead times move fastest. This is where the shortlist stands as of this month's quotes — not last season's catalogue."),

      h2("What's still inside four weeks"),
      p("Three of the six are domestic-decorated on imported blanks, which is what keeps them quick. The moment a programme needs a custom colour, add two weeks."),
      ...ul([
        "20oz insulated tumbler — the default, and the one with the deepest stock.",
        "12oz ceramic mug — quickest of all, but only worth it for office-based teams.",
        "24oz steel bottle — reliable, though the gym-friendly lid is the constraint.",
      ]),

      blk({
        _type: "comparisonTable",
        label: "Compare · lead time against decoration method",
        columns: ["Method", "Lead time", "Colour limit", "Holds up to"],
        rows: [
          ["Pad print", "2–3 wks", "2 colours", "Hand washing"],
          ["Laser etch", "3–4 wks", "Single tone", "Dishwasher, indefinitely"],
          ["Full wrap", "5–7 wks", "Unlimited", "Hand washing only"],
        ],
        footnote: "Quotes at 100 units, August 2026. Full wrap pricing moves most with volume.",
      }),

      blk({
        _type: "callout",
        tone: "tip",
        body: [p("If the gift is going to people who commute, ask which lid the sample ships with. A push-fit lid in a bag is the single most common complaint we field after delivery.")],
      }),

      h2("What slipped"),
      p("Two vacuum-sealed lines moved from four weeks to eight when their coating supplier changed. Neither is worth waiting for unless a specific colour match is non-negotiable."),

      blk({
        _type: "faqBlock",
        eyebrow: "Sourcing questions",
        display: "accordion",
        items: [
          { question: "Can we match a Pantone exactly on a powder-coated bottle?", answer: ["Close, not exact. Powder coat shifts one to two steps warmer than the swatch. Ask for a coated sample before you commit — a screen proof will not show it."] },
          { question: "Is a lifetime-warranty brand worth the premium for swag?", answer: ["Rarely. The warranty is administered by the brand, not by you, so the recipient deals with it directly. Put the money into a better lid instead."] },
        ],
      }),
    ],
  },

  /* 3 · Marketing Ideas — the no-hero-image post. Exercises the §3.7 skip and
   * the §3.1 monogram card fallback against real data. */
  {
    _id: "post.trade-show-giveaways",
    title: "Trade Show Giveaways That Survive the Walk to the Car",
    slug: "trade-show-giveaways",
    category: "category.marketing-ideas",
    author: "author.tom-reyes",
    tags: ["tag.apparel"],
    publishedAt: "2026-08-12T09:00:00.000Z",
    readTime: 8,
    dek: "Booth swag gets judged twice: once at the table, and again in a hotel room at 9pm when someone decides what actually goes in the suitcase.",
    excerpt: "Booth swag gets judged twice — once at the table, once in a hotel room at 9pm.",
    body: [
      p("Everything you hand out at a booth is competing for suitcase space against a laptop, a pair of shoes and whatever the attendee already bought. That is the only test that matters, and most booth swag fails it before the closing keynote."),

      h2("The hotel-room test"),
      p("Ask one question of every candidate: would someone repack this instead of leaving it on the desk? Flat, light and useful beats clever every time, which is why notebooks still outperform almost everything with a battery in it."),
      ...ol([
        "Flat enough to slide into a laptop sleeve.",
        "Light enough that it does not register in a carry-on.",
        "Useful within a week, or it gets left behind.",
      ]),

      blk({
        _type: "callout",
        tone: "caution",
        body: [p("Avoid anything with a lithium battery. It is not just a cost question — attendees flying home have to declare it, and a surprising number simply bin it at security rather than deal with the hassle.")],
      }),

      h2("What to bring instead"),
      p("The best-performing booth item we track is an unbranded-looking tote with a small woven label. It gets used for the rest of the show, which means your logo walks the floor for two days instead of sitting in a bag."),

      blk({
        _type: "newsletterInline",
        heading: "One idea, every other Tuesday",
        body: "Booth tactics, lead-time warnings and the occasional product worth knowing about.",
        proofLine: "Read by 9,400 buyers",
        listId: "swag-desk-weekly",
      }),
    ],
  },

  /* 4 · Swag Program Strategy — carries the ungated resource variant. */
  {
    _id: "post.budget-a-repeatable-swag-program",
    title: "How to Budget a Swag Program You'll Actually Repeat Next Year",
    slug: "budget-a-repeatable-swag-program",
    category: "category.swag-program-strategy",
    author: "author.hallie-brenner",
    tags: ["tag.lead-times", "tag.onboarding"],
    publishedAt: "2026-08-15T09:00:00.000Z",
    readTime: 9,
    isGuide: true,
    updatedAt: "2026-08-22T09:00:00.000Z",
    dek: "A per-head model that survives a mid-year freeze, with the arithmetic shown rather than asserted.",
    excerpt: "A per-head model that survives a mid-year freeze, with the math shown.",
    hero: { image: "heroBudget", caption: "The per-head model, as it usually looks by the second quarter." },
    body: [
      p("Swag budgets rarely get cut because they are too large. They get cut because nobody can say what the number buys, which makes them the easiest line on the sheet to defend against."),

      h2("Start from headcount, not from a total"),
      p("A single annual figure is impossible to defend and impossible to plan against. A per-head figure survives a hiring freeze, a headcount jump and a mid-year review, because it scales with the thing it is attached to."),
      ...ul([
        "New starters: one kit per hire, budgeted per head.",
        "Company-wide moments: one send per year, budgeted per head.",
        "Milestones: budgeted per event, not per person.",
      ]),

      blk({
        _type: "pullQuote",
        quote: "The first year I presented it per head instead of as a total, nobody argued. It stopped looking like a party and started looking like an operating cost.",
        attribution: "Programme lead",
        attributionDetail: "1,200-person fintech",
      }),

      h2("Where programmes overspend"),
      p("Almost always in two places: rush fees from a date nobody worked backwards from, and a second decoration colour added late. Both are avoidable and both are invisible until the invoice."),

      blk({
        _type: "callout",
        tone: "tip",
        body: [p("Hold ten per cent of the annual figure back as a rush reserve. You will use it, and having it stops a single late request from cannibalising the next quarter's send.")],
      }),

      blk({
        _type: "resourceDownload",
        title: "Per-head budget worksheet",
        pageCount: 4,
        description: "The model above as a spreadsheet, with the rush reserve and shipping lines already broken out.",
        gated: false,
      }),
    ],
    faq: [
      {
        question: "What per-head figure should we start from?",
        answer: ["Most programmes we work with land between $40 and $90 per employee per year, all-in. The spread is mostly about whether you ship to homes."],
      },
      {
        question: "How do we defend the budget in a cost review?",
        answer: ["Bring the per-head number and the retention data together. A programme that costs $60 a head and gets worn is a different conversation from one that costs $60 a head and sits in a cupboard."],
      },
    ],
  },

  /* 5 · Industry Trends — a lean post. Confirms the layout holds with no
   * blocks at all beyond prose, and no TOC (fewer than 4 H2s). */
  {
    _id: "post.lead-times-versus-your-calendar",
    title: "Lead Times Are Back to Normal. Your Calendar Isn't.",
    slug: "lead-times-versus-your-calendar",
    category: "category.industry-trends",
    author: "author.dev-okonkwo",
    tags: ["tag.lead-times", "tag.holiday"],
    publishedAt: "2026-08-05T09:00:00.000Z",
    updatedAt: "2026-08-20T09:00:00.000Z",
    readTime: 5,
    dek: "Production recovered eighteen months ago. Internal approval cycles did not, and that is now the binding constraint on almost every order we quote.",
    excerpt: "Production recovered eighteen months ago. Internal approval cycles did not.",
    hero: { image: "heroLeadTimes" },
    body: [
      p("Every delayed order we handled last quarter was delayed before it reached us. Production is running at pre-2020 speeds across almost every category we buy; the queue has simply moved upstream, into the approval chain."),

      h2("What recovered"),
      p("Blank availability, container timings and domestic decoration capacity are all back to where they were. A four-week turnaround on a standard item is a real commitment again rather than an optimistic one."),

      h2("What did not"),
      p("Artwork sign-off, legal review on anything co-branded, and the gap between choosing an item and someone actually raising the purchase order. Those three now account for more elapsed time than manufacturing does."),
      p("The fix is unglamorous: start the internal clock at the same moment you start the sourcing conversation, rather than after it concludes."),
    ],
  },
];

/** Manual related-post override on the flagship, to exercise the field (Flag 6). */
export const relatedOverrides = {
  "post.remote-team-gift-ideas": ["post.budget-a-repeatable-swag-program", "post.2026-drinkware-shortlist"],
};

/** Old paths that should redirect, to exercise redirectFrom (Flag 7). */
export const redirectOverrides = {
  "post.remote-team-gift-ideas": ["/blog/remote-team-gift-ideas", "/gift-ideas-remote"],
};

export { blk, h2, h3, img, keyed, ol, p, ref, ul };
