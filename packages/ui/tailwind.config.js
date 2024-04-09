const { baseConfig } = require('./tailwind.config.base.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './storybook/**/*.{ts,tsx}'],
  presets: [baseConfig],
};
