/*
 * Migrates the legacy corporatespecialties.com/blog posts into Sanity as DRAFTS.
 *
 *   npm run migrate:blog:dry      write the report, touch nothing
 *   npm run migrate:blog          the real import
 *
 * Both read .env.local automatically (see .env.local.example). Add
 * --dataset=<name> to rehearse against a scratch dataset before production.
 *
 * Source: migration/source/corporate_specialties_blogs.xlsx — three columns,
 * URL / H1 / Body Copy. Nothing else. Fields the sheet does not contain (dek,
 * category, author, publishedAt) are deliberately left unset; they are
 * required by the `post` schema, so every imported draft will show validation
 * errors in the Studio until an editor fills them in. That is intended.
 *
 * Rerunnable: document ids are derived from the slug and written with
 * createOrReplace, and _key values come from a per-document counter rather
 * than randomness, so running twice updates in place and produces byte-
 * identical documents.
 *
 * Deliberately does NOT create redirects or a redirect map — separate job.
 */

import { createClient } from "@sanity/client";
import { htmlToBlocks } from "@portabletext/block-tools";
import { Schema as SanitySchema } from "@sanity/schema";
import ExcelJS from "exceljs";
import { JSDOM } from "jsdom";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "migration/source/corporate_specialties_blogs.xlsx");
const OUT_DIR = path.join(ROOT, "migration/output");

const DRY_RUN = process.argv.includes("--dry-run");

/** --dataset=staging / --project=abc123 override the env, for a rehearsal run. */
const flag = (name) => {
  const hit = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
};

/* A numbered chunk longer than this is prose that happens to start with a
 * digit, not a listicle heading. Every real heading in the source is <= 91. */
const HEADING_MAX_CHARS = 120;
const BATCH_SIZE = 50;

/* ------------------------------------------------------------------ schema */

/*
 * A JS mirror of the `block` member of src/sanity/schemaTypes/objects/portableText.ts.
 * block-tools needs a compiled schema and that file is TypeScript importing the
 * `sanity` package, which will not load in a plain node script. assertSchemaInSync()
 * below re-reads the real file and fails loudly if the two ever drift apart.
 */
const PT_SOURCE = path.join(ROOT, "src/sanity/schemaTypes/objects/portableText.ts");
const STYLES = ["normal", "h2", "h3", "h4", "h5", "blockquote"];
const LISTS = ["bullet", "number"];
const DECORATORS = ["strong", "em", "code"];

async function assertSchemaInSync() {
  const src = await readFile(PT_SOURCE, "utf8");
  const missing = [];
  for (const v of [...STYLES, ...LISTS, ...DECORATORS]) {
    if (!src.includes(`value: "${v}"`)) missing.push(v);
  }
  if (!src.includes('name: "link"')) missing.push("link annotation");
  if (missing.length) {
    throw new Error(
      `portableText.ts no longer defines: ${missing.join(", ")}.\n` +
        `The mirror in ${path.relative(ROOT, fileURLToPath(import.meta.url))} is out of date — update STYLES/LISTS/DECORATORS to match.`,
    );
  }
}

const compiled = SanitySchema.compile({
  name: "migration",
  types: [
    {
      name: "portableText",
      type: "array",
      of: [
        {
          type: "block",
          styles: STYLES.map((value) => ({ title: value, value })),
          lists: LISTS.map((value) => ({ title: value, value })),
          marks: {
            decorators: DECORATORS.map((value) => ({ title: value, value })),
            annotations: [
              { name: "link", type: "object", title: "Link", fields: [{ name: "href", type: "url" }] },
            ],
          },
        },
      ],
    },
  ],
});
const blockContentType = compiled.get("portableText");

/* -------------------------------------------------------------- slug rules */

/*
 * SEO-critical: the slug comes from the path of the old URL, never from the
 * heading, and is preserved exactly. No re-slugifying, no case changes, no
 * tidying of hyphens — the whole point is that the new URL matches the old.
 */
function deriveSlug(rawUrl) {
  const warnings = [];
  let value = String(rawUrl ?? "").trim();

  // Strip hash fragment, then query string.
  value = value.split("#")[0].split("?")[0];
  // Strip scheme + domain if present.
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, "");
  // Strip trailing then leading slashes.
  value = value.replace(/\/+$/, "").replace(/^\/+/, "");

  const segments = value.split("/").filter(Boolean);
  let slug = segments.length ? segments[segments.length - 1] : "";
  // Strip a file extension.
  slug = slug.replace(/\.(html?|php|aspx?|jsp|cfm)$/i, "");

  if (!slug) warnings.push("REVIEW:empty-final-segment");
  else if (/^\d+$/.test(slug)) warnings.push("REVIEW:numeric-only-slug");
  else if (/^\d{4}([-/]\d{1,2}){0,2}$/.test(slug) || /^\d{4}[-/]\d{2}/.test(slug)) {
    warnings.push("REVIEW:date-based-path");
  }

  // Not a rewrite — just a heads-up that the Studio's own slug validation
  // (lowercase, digits and hyphens only) would reject it.
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) warnings.push("REVIEW:fails-studio-slug-validation");
  if (slug === "page") warnings.push("REVIEW:slug-reserved-for-pagination");

  return { slug, warnings };
}

/* ------------------------------------------------- plain text -> HTML */

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => esc(s).replace(/"/g, "&quot;");

/*
 * Contact details are stripped from every imported body, so the articles carry
 * the booking link as their only call to action.
 *
 * Two shapes appear in the source. Most posts end with
 *
 *   "Contact us at <address> or book an appointment at <url> today."
 *
 * where <address> is either a real hello@ address or, in 69 cases, the debris
 * Cloudflare's email obfuscation left behind when the old site was scraped —
 * a literal "[email protected]" placeholder, 22 times wrapped in a broken
 * markdown link whose href is the single character "x". For those the dead
 * clause is cut and the booking half kept, recapitalised where the cut leaves
 * it starting a sentence:
 *
 *   "Book an appointment at <url> today."
 *
 * One post instead ends on a contact sentence with no booking clause at all
 * ("...drop us a note at <address>."). There is nothing to keep, so the whole
 * sentence goes.
 *
 * verifyNoContactDebris() is the backstop: if either rule misses a shape, the
 * run aborts rather than importing an address or a mangled sentence.
 */
const ADDRESS = String.raw`(?:\[\[email protected\]\]\(x\)|\[email protected\]|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})`;
const CONTACT_VERB = String.raw`(?:contact us|reach out|drop us a line|drop a line|drop us a note|drop a note|shoot us a note|email us|e-mail us|write us|get in touch)`;

/* "<lead-in> at <address> or book ..." -> "book ..." */
const EMAIL_CTA = new RegExp(String.raw`\b${CONTACT_VERB}\s+(?:at|to)\s+${ADDRESS}\s+or\s+(book\b)`, "gi");

/* A whole sentence whose only purpose is the address, with no booking clause. */
const ORPHAN_CONTACT_SENTENCE = new RegExp(
  String.raw`(^|[.!?]["'”’)]?\s+)[^.!?]*?\b${CONTACT_VERB}\s+(?:at|to)\s+${ADDRESS}\s*[.!?]\s*`,
  "gi",
);

const ANY_ADDRESS = new RegExp(ADDRESS, "gi");

function stripContactDetails(text, stats) {
  let out = text.replace(EMAIL_CTA, (match, book, offset, full) => {
    stats.emailCtasCleaned += 1;
    // Cutting the lead-in can leave "book" starting the sentence.
    const before = full.slice(0, offset).replace(/[ \t]+$/, "");
    const startsSentence = before === "" || /[.!?:]["'”’)]?$/.test(before) || before.endsWith("\n");
    return startsSentence ? "Book" : book;
  });

  out = out.replace(ORPHAN_CONTACT_SENTENCE, (match, lead) => {
    stats.contactSentencesRemoved += 1;
    return lead;
  });

  return out.replace(/[ \t]+\n/g, "\n").replace(/[ \t]{2,}/g, " ").trimEnd();
}

/* Hard stop: never import an address or debris just because a shape was missed. */
function verifyNoContactDebris(text, row) {
  ANY_ADDRESS.lastIndex = 0;
  const left = text.match(ANY_ADDRESS);
  if (!left) return;
  const at = text.indexOf(left[0]);
  throw new Error(
    `Row ${row.rowNumber} (${row.url}) still has ${left.length} contact address(es) after cleanup.\n` +
      `Context: ...${text.slice(Math.max(0, at - 90), at + 90).replace(/\n/g, " ")}...\n` +
      `Add the surrounding phrasing to CONTACT_VERB / EMAIL_CTA in this script, then re-run. Nothing was written.`,
  );
}

const BULLET_RE = /^[-*•]\s+(.+)$/;
const NUMBER_RE = /^\d+[.)]\s+(.+)$/;
const URL_RE = /https?:\/\/[^\s<>"'\)\]]+/g;

/* Escapes text and turns bare URLs into real anchors, so block-tools can build
 * proper link annotations instead of leaving them as dead plain text. */
function inline(text, stats) {
  const out = [];
  let last = 0;
  let m;
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(text)) !== null) {
    out.push(esc(text.slice(last, m.index)));

    let url = m[0];
    let tail = "";
    const trailing = url.match(/[.,;:!?'"]+$/);
    if (trailing) {
      tail = trailing[0];
      url = url.slice(0, -tail.length);
    }

    stats.links += 1;
    if (/^https?:\/\/(www\.)?corporatespecialties\.com/i.test(url)) stats.oldDomainLinks += 1;

    out.push(`<a href="${escAttr(url)}">${esc(url)}</a>${esc(tail)}`);
    last = m.index + m[0].length;
  }
  out.push(esc(text.slice(last)));
  return out.join("");
}

/*
 * The source is plain text with blank-line paragraph breaks and no markup at
 * all. These are the only inferences made, agreed up front:
 *   - a lone short "N. Title" line is a listicle heading -> h2
 *   - consecutive "- " lines are a bullet list
 *   - consecutive "N. " lines are a numbered list
 *   - bare URLs become links
 * Everything else becomes a normal paragraph. Single newlines inside a
 * paragraph are kept as <br> rather than guessed at.
 */
function textToHtml(body, stats) {
  const html = [];

  for (const chunk of String(body).split(/\n[ \t]*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const allBullets = lines.every((l) => BULLET_RE.test(l));
    const allNumbered = lines.every((l) => NUMBER_RE.test(l));

    if (allBullets) {
      stats.bulletLists += 1;
      const items = lines.map((l) => `<li>${inline(l.match(BULLET_RE)[1], stats)}</li>`);
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (allNumbered && lines.length > 1) {
      stats.numberLists += 1;
      const items = lines.map((l) => `<li>${inline(l.match(NUMBER_RE)[1], stats)}</li>`);
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    if (allNumbered && lines.length === 1 && lines[0].length <= HEADING_MAX_CHARS) {
      stats.headings += 1;
      // Keep the number — "1. Company Swag That Travels" is how it reads on the page.
      html.push(`<h2>${inline(lines[0], stats)}</h2>`);
      continue;
    }

    stats.paragraphs += 1;
    html.push(`<p>${lines.map((l) => inline(l, stats)).join("<br />")}</p>`);
  }

  return html.join("\n");
}

/* ----------------------------------------------------------------- helpers */

/* Counter-based keys so a re-run produces identical documents and empty diffs. */
function makeKeyGenerator() {
  let n = 0;
  return () => `m${(n++).toString(36)}`;
}

const parseHtml = (html) => new JSDOM(html).window.document;

function cellText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (Array.isArray(value.richText)) return value.richText.map((r) => r.text ?? "").join("");
    if (typeof value.text === "string") return value.text;
    if (typeof value.hyperlink === "string") return value.hyperlink;
    if (value instanceof Date) return value.toISOString();
    if (typeof value.result === "string") return value.result;
  }
  return String(value);
}

const csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvRow = (cells) => cells.map(csvCell).join(",");

/* --------------------------------------------------------------------- run */

async function main() {
  await assertSchemaInSync();
  await mkdir(OUT_DIR, { recursive: true });

  const projectId = flag("project") ?? process.env.PUBLIC_SANITY_PROJECT_ID ?? "8og1x4eu";
  const dataset = flag("dataset") ?? process.env.PUBLIC_SANITY_DATASET ?? "production";
  const token = process.env.SANITY_WRITE_TOKEN;

  if (!token && !DRY_RUN) {
    console.error("Missing SANITY_WRITE_TOKEN (needs the Editor role).\n");
    console.error("Set it up once and every script here picks it up automatically:");
    console.error("  1. cp .env.local.example .env.local");
    console.error(`  2. Create an Editor token at https://www.sanity.io/manage/project/${projectId}/api#tokens`);
    console.error("  3. Paste it after SANITY_WRITE_TOKEN= in .env.local");
    console.error("  4. npm run migrate:blog\n");
    console.error(".env.local is gitignored, so the token never reaches GitHub.");
    console.error("Preview without writing anything:  npm run migrate:blog:dry");
    process.exit(1);
  }

  /* ---- read the sheet ---- */
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(SOURCE);
  const sheet = workbook.worksheets[0];

  const raw = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // header: URL | H1 | Body Copy
    const url = cellText(row.getCell(1).value).trim();
    const heading = cellText(row.getCell(2).value).trim();
    const body = cellText(row.getCell(3).value);
    if (!url && !heading && !body.trim()) return; // trailing blank padding
    raw.push({ rowNumber, url, heading, body });
  });

  console.log(`Read ${raw.length} data rows from ${path.relative(ROOT, SOURCE)} (sheet "${sheet.name}").`);

  /* ---- derive slugs and detect collisions BEFORE doing any work ---- */
  const bySlug = new Map();
  for (const row of raw) {
    const { slug, warnings } = deriveSlug(row.url);
    row.slug = slug;
    row.warnings = warnings;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(row);
  }

  const collisions = [...bySlug.entries()].filter(([slug, rows]) => slug && rows.length > 1);
  if (collisions.length) {
    console.error(`\nSTOPPED — ${collisions.length} slug collision(s). Nothing was written.`);
    console.error("Not auto-appending -1/-2; decide which URL wins for each:\n");
    for (const [slug, rows] of collisions) {
      console.error(`  ${slug}`);
      for (const r of rows) console.error(`      row ${r.rowNumber}: ${r.url}`);
    }
    const file = path.join(OUT_DIR, "slug-collisions.txt");
    await writeFile(
      file,
      collisions
        .map(([slug, rows]) => `${slug}\n${rows.map((r) => `  row ${r.rowNumber}: ${r.url}`).join("\n")}`)
        .join("\n\n") + "\n",
      "utf8",
    );
    console.error(`\nWritten to ${path.relative(ROOT, file)}`);
    process.exit(1);
  }

  /* ---- build documents ---- */
  const docs = [];
  const skipped = [];
  const reportRows = [];
  const imageAudit = [];

  for (const row of raw) {
    const warnings = [...row.warnings];

    if (!row.slug) {
      skipped.push({ row, reason: "no slug could be derived from the URL" });
      reportRows.push([row.rowNumber, row.url, "", row.heading, row.body.length, 0, 0, 0, 0, 0, "SKIPPED:no-slug"]);
      continue;
    }
    if (!row.heading) {
      skipped.push({ row, reason: "empty H1" });
      reportRows.push([row.rowNumber, row.url, row.slug, "", row.body.length, 0, 0, 0, 0, 0, "SKIPPED:empty-heading"]);
      continue;
    }
    if (!row.body.trim()) {
      skipped.push({ row, reason: "empty Body Copy" });
      reportRows.push([row.rowNumber, row.url, row.slug, row.heading, 0, 0, 0, 0, 0, 0, "SKIPPED:empty-body"]);
      continue;
    }

    const stats = {
      headings: 0, paragraphs: 0, bulletLists: 0, numberLists: 0, links: 0, oldDomainLinks: 0,
      emailCtasCleaned: 0, contactSentencesRemoved: 0,
    };
    const cleanedBody = stripContactDetails(row.body, stats);
    verifyNoContactDebris(cleanedBody, row);
    const html = textToHtml(cleanedBody, stats);
    const blocks = htmlToBlocks(html, blockContentType, {
      parseHtml,
      keyGenerator: makeKeyGenerator(),
    });

    // Images: log, never upload. The source has none, but a later sheet might.
    const found = [...cleanedBody.matchAll(/https?:\/\/[^\s<>"'\)\]]+\.(?:jpe?g|png|gif|webp|svg|avif)/gi)].map((m) => m[0]);
    if (found.length) imageAudit.push({ url: row.url, slug: row.slug, images: found });

    if (!blocks.length) {
      skipped.push({ row, reason: "body produced no Portable Text blocks" });
      reportRows.push([row.rowNumber, row.url, row.slug, row.heading, row.body.length, 0, 0, 0, 0, 0, "SKIPPED:no-blocks"]);
      continue;
    }

    if (stats.emailCtasCleaned) warnings.push(`cleaned-email-cta:${stats.emailCtasCleaned}`);
    if (stats.contactSentencesRemoved) warnings.push(`removed-contact-sentence:${stats.contactSentencesRemoved}`);
    if (stats.headings === 0) warnings.push("no-h2-detected");
    if (cleanedBody.length > 25000) warnings.push("very-long-body");
    if (!cleanedBody.includes("\n\n")) warnings.push("single-paragraph-body");
    if (stats.oldDomainLinks > 0) warnings.push(`old-domain-links:${stats.oldDomainLinks}`);
    if (found.length) warnings.push(`images-found:${found.length}`);

    const publishedId = `post-${row.slug}`;
    if (publishedId.length > 120) warnings.push("REVIEW:id-too-long");

    docs.push({
      row,
      doc: {
        // Imported as a DRAFT — nothing goes live until an editor publishes it.
        _id: `drafts.${publishedId}`,
        _type: "post",
        title: row.heading,
        slug: { _type: "slug", current: row.slug },
        body: blocks,
      },
    });

    reportRows.push([
      row.rowNumber, row.url, row.slug, row.heading, cleanedBody.length, blocks.length,
      stats.headings, stats.bulletLists + stats.numberLists, stats.links, found.length,
      warnings.join(" | "),
    ]);
  }

  /* ---- reports ---- */
  const reportPath = path.join(OUT_DIR, "dry-run-report.csv");
  await writeFile(
    reportPath,
    [
      csvRow(["row", "old_url", "derived_slug", "heading", "body_chars", "blocks", "h2_count", "list_count", "link_count", "image_count", "warnings"]),
      ...reportRows.map(csvRow),
    ].join("\n") + "\n",
    "utf8",
  );

  const auditPath = path.join(OUT_DIR, "image-audit.txt");
  await writeFile(
    auditPath,
    imageAudit.length
      ? imageAudit.map((e) => `${e.url}\n  (${e.slug})\n${e.images.map((i) => `    ${i}`).join("\n")}`).join("\n\n") + "\n"
      : "No image URLs found in any Body Copy cell. Nothing to upload.\n",
    "utf8",
  );

  console.log(`\nReport:      ${path.relative(ROOT, reportPath)}`);
  console.log(`Image audit: ${path.relative(ROOT, auditPath)} (${imageAudit.length} post(s) with images)`);

  const flagged = reportRows.filter((r) => String(r[10]).includes("REVIEW:"));
  if (flagged.length) {
    console.log(`\n${flagged.length} row(s) flagged REVIEW:`);
    for (const r of flagged) console.log(`  row ${r[0]}  ${r[2] || "(no slug)"}  — ${r[10]}`);
  }

  if (DRY_RUN) {
    // The built documents, exactly as they would be written. Lets you eyeball
    // the Portable Text before anything touches the dataset.
    const previewPath = path.join(OUT_DIR, "preview.ndjson");
    await writeFile(previewPath, docs.map(({ doc }) => JSON.stringify(doc)).join("\n") + "\n", "utf8");
    console.log(`Preview:     ${path.relative(ROOT, previewPath)}`);

    console.log(`\n--- DRY RUN — nothing written to Sanity ---`);
    console.log(`Would write ${docs.length} draft(s) to ${projectId}/${dataset}. Skipped ${skipped.length}.`);
    for (const s of skipped) console.log(`  skipped row ${s.row.rowNumber} (${s.row.url}): ${s.reason}`);
    return;
  }

  /* ---- import ---- */
  const client = createClient({ projectId, dataset, token, apiVersion: "2026-08-24", useCdn: false });

  console.log(`\nWriting ${docs.length} draft(s) to ${projectId}/${dataset} in batches of ${BATCH_SIZE}...`);
  let written = 0;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    let tx = client.transaction();
    for (const { doc } of batch) tx = tx.createOrReplace(doc);
    await tx.commit({ visibility: "async" });
    written += batch.length;
    console.log(`  batch ${Math.floor(i / BATCH_SIZE) + 1}: ${written}/${docs.length}`);
  }

  const mappingPath = path.join(OUT_DIR, "url-mapping.csv");
  await writeFile(
    mappingPath,
    [csvRow(["old_url", "new_slug"]), ...docs.map(({ row }) => csvRow([row.url, row.slug]))].join("\n") + "\n",
    "utf8",
  );

  console.log(`\n--- SUMMARY ---`);
  console.log(`  rows read:          ${raw.length}`);
  console.log(`  documents written:  ${written} (as drafts)`);
  console.log(`  rows skipped:       ${skipped.length}`);
  for (const s of skipped) console.log(`      row ${s.row.rowNumber} (${s.row.url}): ${s.reason}`);
  console.log(`  mapping file:       ${path.relative(ROOT, mappingPath)}`);
  console.log(`\nEvery draft is missing the required dek / category / author / publishedAt.`);
  console.log(`They will show validation errors in the Studio until those are filled in.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
