/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@blms'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['tsconfig.eslint.json'],
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
};
