/**
 * Verbatim copy guard.
 *
 * copy/hero.json holds the client-supplied hero strings exactly as given.
 * This asserts each one appears character-for-character in src/lib/brand.ts,
 * so a stray reflow, smart quote or "small wording improvement" fails loudly
 * instead of shipping.
 *
 *   node scripts/verify-copy.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ref = JSON.parse(readFileSync(join(root, "copy/hero.json"), "utf8"));
const source = readFileSync(join(root, "src/lib/brand.ts"), "utf8");

const expected = [
  ["headline", ref.headline],
  ...ref.paragraphs.map((p, i) => [`paragraphs[${i}]`, p]),
  ["primaryCta", ref.primaryCta],
  ["phoneCta", ref.phoneCta],
  ["phoneHref", ref.phoneHref],
];

// A JS string literal in the source escapes nothing we use here, but be exact.
const encode = (s) => JSON.stringify(s).slice(1, -1);

let failed = 0;
for (const [label, value] of expected) {
  const present = source.includes(encode(value));
  if (!present) failed += 1;
  console.log(`${present ? "ok  " : "FAIL"}  ${label}  (${value.length} chars)`);
  if (!present) console.log(`      expected verbatim: ${JSON.stringify(value)}`);
}

if (failed) {
  console.error(`\n${failed} string(s) do not match copy/hero.json verbatim.`);
  process.exit(1);
}
console.log(`\nAll ${expected.length} strings match copy/hero.json verbatim.`);
