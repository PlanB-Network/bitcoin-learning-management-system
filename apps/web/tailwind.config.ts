import { join } from 'node:path';

import type { Config } from 'tailwindcss';

import baseConfig from '../../packages/ui/tailwind.config-base.js';

export default {
  content: [
    join(
      '{src,pages,components,app,atoms}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    '../../packages/ui/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [baseConfig],
} satisfies Config;
