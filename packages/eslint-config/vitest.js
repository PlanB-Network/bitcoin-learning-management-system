module.exports = {
  files: ['*.test.ts', '*.test.tsx'],
  plugins: ['vitest'],
  extends: ['plugin:vitest/recommended'],
  rules: {
    'import/no-extraneous-dependencies': 'off',
    // We need to disable these rules because we often use `any` in tests
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
  },
};
