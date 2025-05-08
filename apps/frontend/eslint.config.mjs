import eslintPluginTs from "@typescript-eslint/eslint-plugin";
import parserTs from "@typescript-eslint/parser";
import lodash from "eslint-plugin-lodash";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unicorn from "eslint-plugin-unicorn";

const IGNORED_UNICORN_RULES = {
  "unicorn/filename-case": "off",
  "unicorn/no-await-expression-member": "off",
  "unicorn/no-useless-undefined": "off",
  "unicorn/no-null": "off",
  "unicorn/prefer-spread": "off",
  "unicorn/prevent-abbreviations": ["error", { allowList: { env: true, util: true } }],
};

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: ["src/vite-env.d.ts", "dist", "src/types/api-models.ts", "src/routeTree.gen.ts", "**/graphql_generated.ts"],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: parserTs,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": eslintPluginTs,
      prettier,
      lodash,
      react,
      unicorn,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      eqeqeq: ["error", "always"],
      // "no-console": "error",
      "lodash/import-scope": ["error", "method"],
      "react/jsx-key": "error",
      "react/jsx-sort-props": "error",
      "prettier/prettier": "error",
      "import/prefer-default-export": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@typescript-eslint/consistent-type-imports": ["warn"],
      "you-dont-need-lodash-underscore/capitalize": "off",
      ...IGNORED_UNICORN_RULES,
    },
  },
];
