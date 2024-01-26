/** @type {import('tailwindcss').Config} */
const baseConfig = {
  content: ['./src/**/*.{ts,tsx}'],
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
      white: '#FFFFFF',
      blue: {
        100: 'hsl(from var(--base-blue) h s 90%)',
        200: 'hsl(from var(--base-blue) h s 80%)',
        300: 'hsl(from var(--base-blue) h s 70%)',
        400: 'hsl(from var(--base-blue) h s 60%)',
        500: 'hsl(from var(--base-blue) h s 50%)',
        600: 'hsl(from var(--base-blue) h s 40%)',
        700: 'hsl(from var(--base-blue) h s 30%)',
        800: 'hsl(from var(--base-blue) h s 20%)',
        900: 'hsl(from var(--base-blue) h s 10%)',
        1000: 'hsl(from var(--base-blue) h s l)',
      },
      orange: {
        100: '#FFBD99',
        200: '#FF9D66',
        300: '#FF7C32',
        400: '#FF6C19',
        500: '#FF5C00',
        600: '#E55200',
        700: '#CC4900',
        800: '#B24000',
      },
      gray: {
        100: '#F2F2F2',
        200: '#D9D9D9',
        300: '#BFBFBF',
        400: '#8C8C8C',
        500: '#737373',
        600: '#A6A6A6',
        700: '#595959',
        800: '#404040',
        900: '#262626',
      },
      beige: {
        300: '#FCFBF3',
        400: '#FAF7E7',
        500: '#F6F1D7',
        600: '#D6D2BB',
        700: '#B7B39F',
        800: '#989585',
      },
      red: {
        100: '#FBE9EA',
        200: '#F4BDC1',
        300: '#ED9197',
        400: '#E6656D',
        500: '#DF3944',
        600: '#C6202A',
        700: '#9A1921',
        800: '#6E1218',
        900: '#420B0E',
      },
      green: {
        100: '#EDF7F2',
        200: '#C9E8D8',
        300: '#A6D9BF',
        400: '#82CAA5',
        500: '#5EBA8B',
        600: '#45A172',
        700: '#2C6E49',
        800: '#26593F',
        900: '#172A1E',
      },
      turquoise: {
        100: '#D7EBE9',
        200: '#C3E1DE',
        300: '#AFD7D3',
        400: '#85C4BE',
        500: '#57B0A9',
        600: '#079C94',
        700: '#058780',
        800: '#04736D',
        900: '#025F5A',
      },
      chocolate: {
        100: '#F7D2C1',
        200: '#EFB498',
        300: '#EBA583',
        400: '#E18659',
        500: '#DB7642',
        600: '#D56626',
        700: '#B95820',
        800: '#9E4A19',
        900: '#833C13',
      },
      yellow: {
        100: '#FAF0CB',
        200: '#F8E5A6',
        300: '#F5DA7E',
        400: '#F3D468',
        500: '#F2CE4D',
        600: '#F0C827',
        700: '#D1AE20',
        800: '#B2941A',
        900: '#957B14',
      },
      grayblue: {
        300: '#B6BFD3',
      },
    },
    extend: {
      colors: {
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: { primary: ['Poppins'], body: ['SpaceMono'] },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        'gradient-diagonal':
          'linear-gradient(175deg, #20376C 83%, rgba(255,255,255,1) 85%);',
      },
      boxShadow: {
        'md-dark':
          '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3);',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

module.exports = { baseConfig };
