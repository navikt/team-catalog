import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";

const IGNORED_UNICORN_RULES = {
  "unicorn/filename-case": "off",
};

export default [
  { files: ["src/**/*.ts", "./eslint.config.mjs"], ignores: ["dist/*"] },
  ...tseslint.configs.recommended,
  prettierRecommended,
  unicorn.configs.recommended,
  {
    plugins: {
      eslintPluginSimpleImportSort,
    },
  },
  { rules: { ...IGNORED_UNICORN_RULES } },
];
