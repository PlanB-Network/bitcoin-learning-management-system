const { join } = require('node:path');

const { baseConfig } = require('../../packages/ui/tailwind.config.base.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
  ],
  presets: [baseConfig],
};
