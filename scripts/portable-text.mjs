/*
 * Portable Text helpers for the seed script.
 *
 * Hand-writing Portable Text is unreadable — every paragraph is a block with a
 * children array of spans, each needing a _key. These helpers let the seed
 * content read as prose while emitting the real shape the CMS stores.
 *
 * Inline markup supported inside any text string:
 *   **bold**            → strong
 *   _italic_            → em
 *   [label](/href)      → link annotation
 *
 * _key values are derived from a counter rather than randomness so re-running
 * the seed produces identical documents and diffs stay empty.
 */

let counter = 0;
const key = (prefix = "k") => `${prefix}${(counter++).toString(36)}`;

/** Resets keys so a re-run yields byte-identical documents. */
export function resetKeys() {
  counter = 0;
}

const PATTERN = /(\*\*[^*]+\*\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;

/** Parses inline markup into spans + the markDefs they reference. */
function parseInline(text) {
  const children = [];
  const markDefs = [];

  for (const piece of text.split(PATTERN)) {
    if (!piece) continue;

    let marks = [];
    let value = piece;

    const link = piece.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const linkKey = key("l");
      markDefs.push({ _key: linkKey, _type: "link", href: link[2] });
      marks = [linkKey];
      value = link[1];
    } else if (piece.startsWith("**") && piece.endsWith("**")) {
      marks = ["strong"];
      value = piece.slice(2, -2);
    } else if (piece.startsWith("_") && piece.endsWith("_") && piece.length > 2) {
      marks = ["em"];
      value = piece.slice(1, -1);
    }

    children.push({ _type: "span", _key: key("s"), text: value, marks });
  }

  return { children, markDefs };
}

function block(style, text, extra = {}) {
  const { children, markDefs } = parseInline(text);
  return { _type: "block", _key: key(), style, markDefs, children, ...extra };
}

export const p = (text) => block("normal", text);
export const h2 = (text) => block("h2", text);
export const h3 = (text) => block("h3", text);

/** Each list item is its own block carrying `listItem` — there is no list wrapper. */
export const ul = (items) => items.map((t) => block("normal", t, { listItem: "bullet", level: 1 }));
export const ol = (items) => items.map((t) => block("normal", t, { listItem: "number", level: 1 }));

/** Wraps a §4 block object with a _key. */
export const blk = (obj) => ({ _key: key("b"), ...obj });

/** An image reference to an asset uploaded by the seed runner. */
export const img = (assetId, alt, extra = {}) => ({
  _type: "image",
  asset: { _type: "reference", _ref: assetId },
  alt,
  ...extra,
});

export const ref = (id) => ({ _type: "reference", _ref: id });

/** Array members that are objects (not blocks) still need their own _key. */
export const keyed = (items) => items.map((item) => ({ _key: key("i"), ...item }));
