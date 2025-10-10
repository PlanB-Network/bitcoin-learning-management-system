import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,mdx}', './storybook/**/*.{ts,tsx}'],
  darkMode: 'selector',
  plugins: [require('tailwindcss-animate')],
  theme: {
    extend: {
      fontSize: {
        '8xl': '84px',
      },
    },
  },
} satisfies Config;
