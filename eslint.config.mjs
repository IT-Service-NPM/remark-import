// @ts-check

import eslint from '@eslint/js';
import n from 'eslint-plugin-n';
import tsEslint from 'typescript-eslint';
import tsdoc from "eslint-plugin-tsdoc";
import vitest from "@vitest/eslint-plugin";

export default [
  eslint.configs.recommended,
  // tsEslint.configs.recommendedTypeChecked,
  ...tsEslint.configs.strictTypeChecked,
  ...tsEslint.configs.stylisticTypeChecked,
  {
    rules: {
      "array-bracket-spacing": [2, "never"],
      "block-scoped-var": 2,
      "brace-style": [2, "1tbs"],
      "camelcase": 1,
      "computed-property-spacing": [2, "never"],
      "curly": 2,
      "eol-last": 2,
      "eqeqeq": [2, "smart"],
      "max-depth": [1, 3],
      "max-len": [1, 80],
      "max-statements": [1, 15],
      "new-cap": 1,
      "no-extend-native": 2,
      "no-mixed-spaces-and-tabs": 2,
      "no-trailing-spaces": 2,
      "no-unused-vars": 1,
      "no-use-before-define": [2, "nofunc"],
      "object-curly-spacing": [2, "always"],
      "quotes": [2, "single", "avoid-escape"],
      "semi": [2, "always"],
      "keyword-spacing": [2, { "before": true, "after": true }],
      "space-unary-ops": 2
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: [
      '**/*.js',
      '**/*.mjs',
      'node_modules',
      'dist',
      'coverage'
    ]
  },
  {
    files: [
      "src/**/*.ts"
    ],
    plugins: {
      tsdoc,
      n
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": ['error', {
        'argsIgnorePattern': '^_|^(resolve|reject|err)$'
      }],
      "n/no-missing-import": ["error", {
        "ignoreTypeImport": true
      }]
    },
  },
  {
    files: ["test/**/*.test.ts"],
    plugins: {
      vitest
    },
    rules: {
      // ...vitest.configs.all.rules,
      ...vitest.configs.recommended.rules,
      "max-statements": "off"
    },
    settings: {
      vitest: {
        typecheck: true
      }
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    }
  },
];
