import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/sw.js",
      "playwright-report/**",
      "test-results/**",
      "index.html",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    rules: {
      // SECURITY_MODEL §3: env læses kun ét sted, så server-hemmeligheder
      // aldrig kan sive ind i klientkode ad hoc.
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Læs miljøvariabler via src/config/env.ts – aldrig direkte fra process.env.",
        },
      ],
    },
  },
  {
    files: [
      "src/config/env.ts",
      "next.config.ts",
      "src/sw.ts",
      "playwright.config.ts",
      "vitest.config.ts",
    ],
    rules: {
      "no-restricted-properties": "off",
    },
  },
];

export default config;
