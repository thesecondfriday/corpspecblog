# Corporate swag content hub

_Started 2026-08-24 21:44 UTC_

---

## User

CONTEXT
I'm designing a content hub for a corporate swag and promotional products
distributor. The blog educates B2B buyers — HR and people ops, marketing
managers, office managers, event planners — on gifting strategy, trending
products, branding ideas, and how to run swag programs well. It is an
education-first destination that drives quote requests, not a product catalog
with articles bolted on.

Reference image attached. Take from it: [type scale / content measure / card
grid density / whitespace rhythm — edit to match what you actually want].
Ignore its color palette and illustration style — use my design system.

AUDIENCE + TONE
Readers are practitioners on a budget and a deadline. The design should feel
credible and editorial — closer to a trade publication than an ecommerce site.
Confident, generous whitespace, strong typographic hierarchy. Products appear
often, so the layout needs to hold product photography without turning into a
product grid.

DESIGN THREE PAGES

1. HOME / BLOG INDEX
- Hero: one featured article, large image, category label, headline, dek, byline
- Secondary featured row: 2–3 articles
- Category navigation that's visible and scannable, not buried in a nav
  dropdown. Categories: Gifting Guides, Trending Products, Marketing Ideas,
  Swag Program Strategy, Industry Trends
- A "Guides" module for evergreen long-form pieces, visually distinct from
  the reverse-chron feed
- Main article feed with pagination
- One inline conversion module (newsletter or "get a quote") placed within the
  feed, designed to feel native rather than like an ad slot
- Footer

2. CATEGORY / ARCHIVE PAGE
- Category header with name, description paragraph, and post count
- The same card grid as the index, but no hero treatment
- A sub-filter or tag row for narrowing within a category
- Pagination as real numbered links
- Design the empty state and the page-2+ state

3. SINGLE POST PAGE
- Article header: category chip, headline, dek, author byline with photo,
  publish date, read time
- Full-bleed or wide hero image with caption
- Sticky table of contents for long guides — show desktop and mobile behavior
- Article body at a comfortable reading measure (target 65–75 characters)
- Author bio block at the end
- Related posts module (3 cards)
- End-of-article CTA block

COMPONENT VOCABULARY — design each of these as a distinct component
These will become CMS fields, so I need them defined now, not improvised later:
- Post card: three variants — large featured, standard with image, compact
  text-only
- Category chip and tag chip
- Article body elements: H2, H3, blockquote/pull quote, bulleted and numbered
  lists, inline image with caption, two-column image pair
- A "product spotlight" block — product image, name, one-line description,
  price range, CTA — for embedding inside articles
- A comparison table block (for "best X for Y" guides)
- A callout/tip box, in two tones: neutral tip and cautionary
- A downloadable-resource block (for gift guide PDFs) with a gated variant
- Newsletter signup, in both inline and footer forms

CONSTRAINTS
- Mobile-first. Show mobile and desktop for all three pages.
-Should be built for Astro as its a content blog that needs to be read by ai bots
- Article body typography is the priority — spend the effort on line height,
  heading spacing, and how images breathe within text.
- Product photography will be inconsistent in quality and background. Design
  cards and spotlight blocks that tolerate that: consistent aspect ratio
  cropping, and a graceful no-image fallback.
- Headlines will run long ("17 Corporate Gift Ideas Your Remote Team Will
  Actually Use"). Design cards to hold three lines without breaking.
- Every card needs a clear category label — readers arrive from search on a
  single post and need to understand where they've landed.

AVOID
- Generic SaaS-blog aesthetic: centered hero, three equal cards, gradient blobs
- Stock-photo-of-people-high-fiving energy
- Making it look like a product listing page

## Assistant



## Assistant

_[tool: list_files]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: list_files]_

_[tool: read_file]_

_[tool: view_image]_

Design system is minimal — Corporate Specialties logo (orange + forest green), Mulish/Playfair type. The reference image you mentioned didn't come through.

_[tool: ask_user]_

Waiting on your answers — especially the reference image and what "built for Astro" needs to include.

## User

Answered — reference: Screenshot 2026-08-24 at 5.29.22 PM.png; astro: HTML/CSS design only — my devs port it to Astro; imagery: Drop-in image slots I fill with real photos myself; deliverable_shape: Both; component_library: Both — in context, plus a spec sheet with all variants; conversion: Talk to a swag strategist; gating: Email only

## Assistant

_[tool: view_image]_

Reference is your own storefront — sage/white split hero, horizontal category bar. I'll carry that rhythm into an editorial system.

_[tool: copy_starter_component]_

_[tool: dc_write]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Now the missing values for the category states and TOC.

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Built as one clickable prototype — top bar switches Home / Category / Single Post / Component Spec, plus a Desktop ↔ Mobile 390 viewport toggle so all three pages can be checked at both widths. Every layout is fluid (container queries, `auto-fit` grids), so the mobile frame is the real reflow, not a mock.

Notes on the constraints you flagged:
- **Cards** hold three lines via a reserved `min-height`, so grids stay aligned no matter the headline length; each has a mono category label and a sage "CS" fallback tile for missing/bad photography (shown in the feed, category grid, related, and spec).
- **Category page** has a state switcher (Page 1 / Page 2+ / Empty) so you can see all three.
- **Post body** is 19px / 1.78 at a ~72ch measure, with all body elements plus product spotlight, comparison table, both callout tones, and gated download inline. TOC is a sticky sidebar on desktop, a collapsible sticky bar with progress on mobile.
- Image slots are drag-and-drop — drop real photos in and they persist.

Two things worth deciding next: per-category accent colors (currently all green labels), and whether the Guides module should get its own landing page.

## User

for the compnonent spec - do not forget specs for sticky table of content module with anchor links

and FAQ modules

all body copy, headings, faq, toc, tables should have schema mark up

## Assistant

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: ready_for_verification]_

Added to the spec sheet: **Table of contents** (desktop sticky sidebar with active-state rule, mobile collapsed bar + progress, mobile expanded — all with real anchor links) and **FAQ module** (open and accordion variants), plus a **Structured data map** table listing every type and property.

Schema is now live in the markup, not just documented: JSON-LD for `BlogPosting`, `FAQPage`, and `BreadcrumbList` in the head, and inline microdata on the article (`headline`, `description`, `datePublished`, `author`/Person, `articleBody`, `ImageObject`), the TOC (`SiteNavigationElement` with `name`/`url` per heading), comparison tables (`Table`), the product spotlight (`Product` + `AggregateOffer`), and a new FAQ section on the post page (`Question`/`acceptedAnswer`). Headings carry slug ids so TOC anchors resolve.

## User

Before I hand this off to Claude Code, I need the component spec tightened
into something a developer can build from without guessing. Please revise it
against the following — and where the current spec already covers something,
leave it alone rather than rewriting it.

1. DATA SHAPE FOR EVERY COMPONENT
For each component, add a "Data" section listing the fields it consumes and
whether each is required or optional. This will be backed by a Sanity CMS,
so use field names, not visual descriptions. Example for a post card:
  Data: title (req), slug (req), excerpt (opt), heroImage (opt, with alt),
  category (req), author (req), publishedAt (req), readTime (opt)
State what renders when an optional field is absent.

2. CONSOLIDATE THE POST CARDS
If the three post card treatments are currently specced as separate
components, merge them into one component with a variant prop
(featured | standard | compact). Document what changes per variant:
image aspect ratio, headline clamp, which fields show or hide.
Do the same for any other component that's really one thing in three outfits.

3. TOKENS, NOT LITERALS
Replace every raw hex value and pixel number in individual component entries
with a named token reference. Add a token table at the top of the spec
defining them once:
  - Color roles by function (surface, surface-raised, text-primary,
    text-muted, border, accent, accent-hover), not by hue
  - Type scale: each level with size, weight, line height, letter spacing
  - Spacing scale
  - Breakpoints, named
  - Border radius and shadow scale
If a component genuinely needs a one-off value, mark it as an exception and
say why.

4. ARTICLE BODY BLOCKS AS INSERTABLE COMPONENTS
The article body components — pull quote, inline image with caption,
two-column image pair, product spotlight, comparison table, callout (neutral
and cautionary), downloadable resource — need to be specced as discrete
blocks an editor inserts into a rich text field, not as styling rules for
article content. For each: its data shape, its behavior at mobile width, and
how it spaces against the text above and below it. This distinction matters
because each one becomes a schema definition in the CMS.

5. RESPONSIVE BEHAVIOR PER COMPONENT
Add a "Responsive" line to each component describing what changes at each
breakpoint — what stacks, what crops, what hides. Right now this is defined
at the page level, which leaves gaps for components that appear on more than
one page.

6. FILL THE MISSING STATES
Add specs for anything not already covered:
  - Hover and focus-visible on all cards, links, chips, and buttons
  - Post card with no image
  - Post card with a headline running to three lines
  - Empty category archive
  - Pagination on page 2+ (previous link present, numbered links, current
    page indicator)
  - Sticky table of contents on mobile — is it collapsed, a bottom sheet,
    or hidden?
  - Loading/skeleton state for the article feed

7. FLAG PLACEHOLDERS
Mark anything that is lorem ipsum, a stand-in image, or a section you
invented to fill the layout, so it doesn't get faithfully built as real
content.

Output the revised spec as a single document. Where something in the current
spec is ambiguous and you have to make a call, note the call you made rather
than silently resolving it.

## Assistant

_[tool: copy_starter_component]_

_[tool: dc_write]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

**Component Spec.dc.html** — one printable document, structured for a dev to build without guessing. Left the prototype's visual spec tab untouched; this is the written companion.

What's in it: token tables first (§1 — color by role, type scale with LH/tracking, spacing, named breakpoints, radius/shadow/ratios), then the Sanity content model (§2), page components (§3), article body blocks as insertable Portable Text schemas (§4), global interaction states (§5), placeholder inventory (§6), and my judgment calls (§7).

Consolidations I made: the three post cards are now one `PostCard` with a `variant` prop and a per-variant diff table; category and tag chips became one `Chip` (kind + style); the in-feed CTA and end-of-article CTA became one `CtaBlock` with a `placement` prop; related-post cards are just `standard` — no `RelatedCard`.

Answers to the gaps you flagged: mobile TOC is a **collapsed sticky bar** (not a bottom sheet, not hidden) with the reading-progress rule; every component has a Responsive line; empty state, page-2+ pagination, no-image card, three-line headline, and feed skeleton are all specced — the skeleton with a note that Astro's static output means you only need it if filtering goes client-side.

Four things in §7 are genuinely yours to decide, not mine: per-category accent colors, a `/guides` landing page, whether author pages exist, and the ESP behind the forms.

