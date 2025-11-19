import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*!(*.stories|*.spec).{ts,tsx,html}'],
  darkMode: 'selector',
  plugins: [require('tailwindcss-animate')],
  theme: {},
} satisfies Config;
