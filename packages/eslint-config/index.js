/* eslint-disable unicorn/prefer-module */
const jsonc = require('./jsonc.js');
const react = require('./react.js');
const typescript = require('./typescript.js');
const vitest = require('./vitest.js');

module.exports = {
  env: { es2022: true, node: true },
  overrides: [
    jsonc,
    typescript,
    react,
    vitest,
    { files: ['*.js'], env: { node: true } },
  ],
  ignorePatterns: ['**/node_modules', '**/dist/**', '**/build/**'],
  plugins: [
    'eslint-plugin-ignore-generated',
    'import',
    'promise',
    'sonarjs',
    'unicorn',
  ],
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:sonarjs/recommended',
    'plugin:unicorn/recommended',
    'prettier',
    'turbo',
  ],
  rules: {
    'unicorn/filename-case': 'off',
    'unicorn/no-abusive-eslint-disable': 'off',
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'require-await': 'error',
    'no-return-await': 'error',
    'no-return-assign': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '@sovereign-university/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: [],
      },
    ],
    'sort-imports': [
      'warn',
      {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
        allowSeparatedGroups: false,
      },
    ],
    eqeqeq: 'error',
    'sonarjs/cognitive-complexity': 'off',
    'sonarjs/no-use-of-empty-return-value': 'off',
    'sonarjs/no-duplicate-string': 'off', // Todo re-enable?
    'unicorn/prefer-logical-operator-over-ternary': 'off',
    'unicorn/prefer-event-target': 'off',
    'unicorn/no-nested-ternary': 'off',
    'unicorn/no-null': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-array-method-this-argument': 'off',
  },
  settings: {
    'import/resolver': {
      'eslint-import-resolver-custom-alias': {
        alias: {
          '#src': './src',
          '#test': './test',
          '@sovereign-university/database':
            'packages/database/drizzle/schema.ts',
        },
        extensions: ['.js', '.ts', '.tsx'],
        packages: ['packages/*'],
      },
    },
    'import/internal-regex': '^@sovereign-university/',
  },
};
