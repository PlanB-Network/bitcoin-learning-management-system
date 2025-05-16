import type { Config } from 'tailwindcss';

import baseConfig from '../../packages/ui/tailwind.config-base.js';

export default {
  content: [
    './src/**/*!(*.stories|*.spec).{ts,tsx,html}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/ui/storybook/**/*.{ts,tsx}',
  ],
  presets: [baseConfig],
} satisfies Config;
