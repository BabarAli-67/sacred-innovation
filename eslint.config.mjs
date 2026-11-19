import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    /*
     * Vendored third-party components (21st.dev). Kept close to upstream so
     * they can be re-synced, so upstream's own patterns are tolerated here
     * rather than rewritten: WebGL feature detection sets state from an
     * effect, and the deck paints raw <img> elements it swaps by hand, which
     * next/image cannot do. Our own code is still held to the full rule set.
     */
    files: ["src/components/ui/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      // Glyph Portal accumulates a character offset inside a synchronous
      // Array.from callback during render. The accumulator never escapes that
      // call, so the rule's concern does not apply here.
      "react-hooks/immutability": "off",
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
