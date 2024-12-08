/**
 * This is intended to be a basic starting point for linting in your app.
 * It relies on recommended configs out of the box for simplicity, but you can
 * and should modify this configuration to best suit your team's needs.
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  ignorePatterns: ["!**/.server", "!**/.client"],

  // Base config
  extends: ["eslint:recommended", "prettier"],

  overrides: [
    // React
    {
      files: ["app/**/*.{js,jsx,ts,tsx}"],
      plugins: ["react", "jsx-a11y"],
      extends: [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
      ],
      settings: {
        react: {
          version: "detect",
        },
        formComponents: ["Form"],
        linkComponents: [
          { name: "Link", linkAttribute: "to" },
          { name: "NavLink", linkAttribute: "to" },
        ],
        "import-x/resolver": {
          typescript: {},
        },
      },
      rules: {
        // Safari removes list semantics if the list style is removed
        "jsx-a11y/no-redundant-roles": [
          "error",
          {
            ol: ["list"],
            ul: ["list"],
          },
        ],
      },
    },

    // Typescript
    {
      files: ["**/*.{ts,tsx}"],
      plugins: ["@typescript-eslint", "import-x"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
      settings: {
        "import-x/internal-regex": "^~/",
        "import-x/resolver": {
          node: {
            extensions: [".ts", ".tsx"],
          },
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },
      extends: [
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:import-x/recommended",
        "plugin:import-x/typescript",
      ],
      rules: {
        eqeqeq: ["error", "smart"],
        "no-lonely-if": "error",
        "no-useless-concat": "error",
        "no-useless-rename": "error",
        "object-shorthand": "error",
        "prefer-object-spread": "error",
        "prefer-template": "error",
        "import-x/consistent-type-specifier-style": "error",
        // Broken for conditional imports
        // https://github.com/getsentry/sentry-javascript/issues/12706
        "import-x/namespace": "off",
        "import-x/no-useless-path-segments": [
          "error",
          { noUselessIndex: true },
        ],
        "import-x/order": ["error", { alphabetize: { order: "asc" } }],
        "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/no-explicit-any": [
          "error",
          { ignoreRestArgs: true },
        ],
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            args: "all",
            argsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
          },
        ],
        // Remix throws responses
        "@typescript-eslint/only-throw-error": "off",
        "@typescript-eslint/parameter-properties": [
          "error",
          { prefer: "parameter-property" },
        ],
        "@typescript-eslint/prefer-promise-reject-errors": [
          "error",
          { allowThrowingUnknown: true },
        ],
        "@typescript-eslint/prefer-readonly": "error",
        "@typescript-eslint/restrict-template-expressions": [
          "error",
          { allowNumber: true },
        ],
      },
    },

    // End-to-end tests
    {
      files: ["playwright/**", "tests/**"],
      extends: ["plugin:playwright/recommended"],
      rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        // Unable to handle aliased test method
        "playwright/no-standalone-expect": "off",
      },
    },

    // Node
    {
      files: [".eslintrc.cjs"],
      env: {
        node: true,
      },
    },
  ],
};
