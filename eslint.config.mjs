import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import { configs as regexp } from "eslint-plugin-regexp";
import { configs as unicorn } from "eslint-plugin-unicorn";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config, configs as ts } from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default config(
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("plugin:@eslint-community/eslint-plugin-eslint-comments/recommended"),
  ...compat.extends("plugin:@tanstack/eslint-plugin-query/recommended"),
  ...compat.extends("plugin:import/typescript"),
  js.configs.recommended,
  unicorn["flat/recommended"],
  ts.strictTypeChecked,
  ts.stylisticTypeChecked,
  regexp["flat/all"],
  prettier,
  {
    languageOptions: { parserOptions: { project: ["tsconfig.json", "tsconfig.node.json"] } },
    settings: { "import/resolver": "typescript" },
    rules: {
      "@eslint-community/eslint-comments/no-unused-disable": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "import/prefer-default-export": "error",
      "no-console": "warn",
      "no-shadow": "off", // @typescript-eslint/no-shadow
      "unicorn/filename-case": "off", // use default export name
      "unicorn/no-array-reduce": "off",
      "unicorn/no-null": "off", // part of multiple apis
      "unicorn/no-useless-undefined": ["error", { checkArrowFunctionBody: false }], // @typescript-eslint/no-empty-function
      "unicorn/number-literal-case": "off", // incompatible with prettier
      "unicorn/switch-case-braces": ["error", "avoid"], // consistently avoid braces
    },
  },
  { ignores: [".next/", "next-env.d.ts"] },
);
