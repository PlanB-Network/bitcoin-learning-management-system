import type { Config } from 'tailwindcss';

const baseConfig: Config = {
  darkMode: 'selector',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {},
  plugins: [require('tailwindcss-animate')],
};

export default baseConfig;
