import type { Config } from 'tailwindcss';

import baseConfig from './tailwind.config-base.js';

export default {
  content: ['./src/**/*.{ts,tsx,mdx}', './storybook/**/*.{ts,tsx}'],
  presets: [baseConfig],
} satisfies Config;
