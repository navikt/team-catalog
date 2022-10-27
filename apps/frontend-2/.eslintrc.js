const IGNORED_UNICORN_RULES = {
  "unicorn/filename-case": "off",
  "unicorn/no-await-expression-member": "off",
  "unicorn/no-useless-undefined": "off",
  "unicorn/prevent-abbreviations": [
    "error", {allowList: {"env": true}}
  ]
};

// eslint-disable-next-line unicorn/prefer-module,no-undef
module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:you-dont-need-lodash-underscore/all",
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [
    "lodash",
    "react",
    "@typescript-eslint",
    "simple-import-sort",
  ],
  rules: {
    "lodash/import-scope": ["error", "method"],
    "react/jsx-key": "error",
    "react/jsx-sort-props": "error",
    "import/prefer-default-export": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "@typescript-eslint/consistent-type-imports": ["warn"],
    ...IGNORED_UNICORN_RULES,
  },
  ignorePatterns: ["**/graphql_generated.ts"],
};
