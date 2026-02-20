import { defineConfig } from 'eslint/config';
import { ESLint } from 'eslint';
import ESLintJs from '@eslint/js';
import ESLintPluginN from 'eslint-plugin-n';
import ESLintPluginTSDoc from 'eslint-plugin-tsdoc';
import ESLintPluginTypescript from 'typescript-eslint';
import ESLintPluginVitest from '@vitest/eslint-plugin';
import ESLintPluginPrettier from 'eslint-plugin-prettier';
import ESLintPluginUnicorn from 'eslint-plugin-unicorn';
import ESLintConfigPrettier from 'eslint-config-prettier';
import ESLintPluginSonarJs from 'eslint-plugin-sonarjs';

export default defineConfig([
  {
    extends: [
      ESLintPluginSonarJs.configs.recommended,
      ESLintJs.configs.recommended,
      // ESLintPluginTypescript.configs.recommendedTypeChecked,
      ...ESLintPluginTypescript.configs.strictTypeChecked,
      ...ESLintPluginTypescript.configs.stylisticTypeChecked,
      ESLintPluginUnicorn.configs.recommended,
      ESLintConfigPrettier
    ],
    plugins: {
      'n': ESLintPluginN,
      'prettier': ESLintPluginPrettier,
      'unicorn': ESLintPluginUnicorn
    },
    rules: {
      'array-bracket-spacing': ['error', 'never'],
      'block-scoped-var': 'error',
      'brace-style': ['error', '1tbs'],
      'camelcase': 'warn',
      'computed-property-spacing': ['error', 'never'],
      'curly': 'error',
      'eol-last': 'error',
      'eqeqeq': ['error', 'smart'],
      'max-depth': ['warn', 3],
      'max-len': ['warn', 80],
      'max-statements': ['warn', 15],
      'new-cap': 'warn',
      'no-extend-native': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'no-trailing-spaces': 'error',
      'no-unused-vars': 'warn',
      'no-use-before-define': ['error', 'nofunc'],
      'object-curly-spacing': ['error', 'always'],
      'quotes': ['error', 'single', 'avoid-escape'],
      'semi': ['error', 'always'],
      'keyword-spacing': ['error', { 'before': true, 'after': true }],
      'space-unary-ops': 'error',
      'unicorn/no-typeof-undefined': 'off',
      'unicorn/no-this-assignment': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'sonarjs/no-alphabetical-sort': 'off'
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      }
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
      'src/**/*.ts'
    ],
    plugins: {
      n: ESLintPluginN,
      tsdoc: (ESLintPluginTSDoc as ESLint.Plugin),
      prettier: ESLintPluginPrettier,
      unicorn: ESLintPluginUnicorn

    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_|^(resolve|reject|err)$'
      }],
      'n/no-missing-import': ['error', {
        'ignoreTypeImport': true
      }]
    },
  },
  {
    files: ['test/**/*.test.ts'],
    plugins: {
      n: ESLintPluginN,
      prettier: ESLintPluginPrettier,
      vitest: ESLintPluginVitest
    },
    rules: {
      // ...ESLintPluginVitest.configs.all.rules,
      ...ESLintPluginVitest.configs.recommended.rules,
      'max-statements': 'off'
    },
    settings: {
      vitest: {
        typecheck: true
      }
    },
    languageOptions: {
      globals: {
        ...ESLintPluginVitest.environments.env.globals,
      },
    }
  },
]);
