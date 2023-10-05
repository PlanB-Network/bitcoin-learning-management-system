const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    colors: {
      transparent: 'transparent',
      primary: {
        100: '#DAE1F1',
        200: '#C8D2EA',
        300: '#91A5D4',
        400: '#6C87C6',
        500: '#4769B8',
        600: '#2D4C95',
        700: '#20376C',
        800: '#17284F',
        900: '#1B263E',
      },
      secondary: {
        100: '#FFCF99',
        200: '#FFAC4C',
        300: '#F39324',
        400: '#F2870D',
        500: '#CB720B',
      },
      info: {
        100: '#B3E0E5',
        200: '#077986',
        300: '#03555E',
      },
      danger: {
        100: '#DE6E75',
        200: '#D2222D',
        300: '#A92B27',
      },
      success: {
        100: '#A4DBBC',
        200: '#2C6E49',
        300: '#204B35',
        400: '#172A1E',
      },
      blue: {
        100: '#EBF0F9',
        200: '#C4D1EE',
        300: '#9CB2E2',
        400: '#7593D7',
        500: '#4D74CB',
        600: '#345AB2',
        700: '#28468A',
        800: '#20376C',
        900: '#17284F',
        950: '#1B263E',
      },
      orange: {
        200: '#FFCF99',
        400: '#FFAC4C',
        600: '#F39324',
        800: '#F2870D',
        900: '#CB720B',
      },
      white: '#fff',
      gray: {
        100: '#F1F2F4',
        200: '#E2E4E7',
        300: '#ADB4BC',
        400: '#737F8C',
        500: '#4D555E',
        600: '#2E3338',
      },
      green: {
        300: '#2C6E49',
        500: '#5EBA8B',
        600: '#204B35',
        800: '#172A1E',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
