import type { Config } from 'tailwindcss';

const baseConfig: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'selector',
  plugins: [require('tailwindcss-animate')],
  theme: {},
};

export default baseConfig;
