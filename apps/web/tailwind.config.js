const { join } = require('path');

const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');

const { baseConfig } = require('../../packages/ui/tailwind.config.base.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  presets: [baseConfig],
};
