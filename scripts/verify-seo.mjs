/**
 * SEO copy guard.
 *
 * copy/seo-source.txt is the text extracted straight from the client's SEO
 * content PDF. src/content/seo.json is what the page renders. This asserts
 * every rendered string still appears in the source, so a reworded sentence,
 * a dropped clause or a smart quote fails loudly.
 *
 * Whitespace is normalised on both sides, because the PDF wraps mid-sentence
 * and carries zero-width spaces and bullet glyphs from its list markup.
 *
 *   node scripts/verify-seo.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const normalise = (s) =>
  s
    .replace(/^PAGES: \d+$/gm, "")
    // Sentences run across page breaks, so the extractor's page markers have
    // to go before whitespace is collapsed or they split a paragraph in two.
    .replace(/^===== PAGE \d+ =====$/gm, "")
    .replace(/​/g, "") // zero-width spaces inside PDF list markers
    .replace(/●/g, "") // bullet glyphs
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();

const source = normalise(readFileSync(join(root, "copy/seo-source.txt"), "utf8"));
const content = JSON.parse(readFileSync(join(root, "src/content/seo.json"), "utf8"));

/** Every leaf string in the JSON, except keys starting with "_". */
function* leaves(node, path = "") {
  if (typeof node === "string") {
    yield [path, node];
    return;
  }
  if (Array.isArray(node)) {
    for (const [i, v] of node.entries()) yield* leaves(v, `${path}[${i}]`);
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("_")) continue;
      yield* leaves(v, path ? `${path}.${k}` : k);
    }
  }
}

let checked = 0;
const missing = [];
for (const [path, value] of leaves(content)) {
  const needle = normalise(value);
  if (!needle) continue;
  checked += 1;
  if (!source.includes(needle)) missing.push([path, value]);
}

for (const [path, value] of missing) {
  console.log(`FAIL  ${path}`);
  console.log(`      not found in the PDF source: ${JSON.stringify(value.slice(0, 110))}`);
}

if (missing.length) {
  console.error(
    `\n${missing.length} of ${checked} strings are not in copy/seo-source.txt verbatim.`,
  );
  process.exit(1);
}
console.log(`All ${checked} strings in src/content/seo.json appear verbatim in the PDF source.`);
