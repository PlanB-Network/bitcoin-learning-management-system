const { baseConfig } = require('./tailwind.config.base.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [...baseConfig.content, '.storybook/**/*.{ts,tsx}'],
  presets: [baseConfig],
};
