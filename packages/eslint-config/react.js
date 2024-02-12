module.exports = {
  files: ['*.tsx'],
  env: { browser: true },
  parser: '@typescript-eslint/parser',
  plugins: ['react', 'react-hooks', 'react-refresh', 'jsx-a11y'],
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime',
    'plugin:storybook/recommended',
    'plugin:tailwindcss/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    '@typescript-eslint/no-floating-promises': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'tailwindcss/no-custom-classname': ['warn'],
    // https://github.com/shadcn-ui/ui/issues/1013
    'react/prop-types': ['error', { ignore: ['className'] }],
    // Prettier is used to change order
    'tailwindcss/classnames-order': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
    tailwindcss: {
      callees: ['clsx', 'cva', 'cn'],
    },
  },
};
