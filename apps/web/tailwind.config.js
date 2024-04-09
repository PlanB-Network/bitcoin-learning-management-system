const { join } = require('node:path');

const { baseConfig } = require('../../packages/ui/tailwind.config.base.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      '{src,pages,components,app,atoms}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    '../../packages/ui/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [baseConfig],
};
