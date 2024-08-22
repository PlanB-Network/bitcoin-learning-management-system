import type { Config } from 'tailwindcss';

const baseConfig: Config = {
  jit: true,
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
      dashboardsection: '#FFFFFF0D',
      headerGray: '#25262D',
      headerDark: '#010205',
      white: '#FFFFFF',
      black: '#000000',
      background: '#F2F2F2',
      primary: '#FF5C00',
      secondary: '#B2B2B2',
      newBlack: {
        1: '#000000',
        2: '#1A1A1A',
        3: '#333333',
        4: '#4D4D4D',
        5: '#666666',
      },
      blue: {
        100: '#9CB2E2',
        200: '#7593D7',
        300: '#4D74CB',
        400: '#345AB2',
        500: '#28468A',
        600: '#20376C',
        700: '#17284F',
        800: '#1B263E',
        900: '#182237',
        1000: '#070a14',
      },
      newBlue: {
        1: '#0A69DA',
      },
      // Does not work on firefox
      // blue: {
      //   100: 'hsl(from var(--base-blue) h s 90%)',
      //   200: 'hsl(from var(--base-blue) h s 80%)',
      //   300: 'hsl(from var(--base-blue) h s 70%)',
      //   400: 'hsl(from var(--base-blue) h s 60%)',
      //   500: 'hsl(from var(--base-blue) h s 50%)',
      //   600: 'hsl(from var(--base-blue) h s 40%)',
      //   700: 'hsl(from var(--base-blue) h s 30%)',
      //   800: 'hsl(from var(--base-blue) h s 20%)',
      //   900: 'hsl(from var(--base-blue) h s 10%)',
      //   1000: 'hsl(from var(--base-blue) h s l)',
      // },
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
      newOrange: {
        1: '#FF5C00',
        2: '#FF6C1A',
        3: '#FF7C33',
        4: '#FF8D4D',
        5: '#FF9D66',
      },
      darkOrange: {
        0: '#FFEEE5',
        1: '#FFD1B7',
        2: '#FFB48A',
        3: '#FF975C',
        4: '#FF792E',
        5: '#FF5C00',
        6: '#D64D00',
        7: '#AD3F00',
        8: '#853000',
        9: '#5C2100',
        10: '#411800',
        11: '#210C00',
      },
      gray: {
        100: '#F2F2F2',
        200: '#D9D9D9',
        300: '#BFBFBF',
        400: '#808080',
        500: '#737373',
        600: '#A6A6A6',
        700: '#595959',
        800: '#404040',
        900: '#262626',
      },
      newGray: {
        1: '#808080',
        2: '#999999',
        3: '#B2B2B2',
        4: '#CCCCCC',
        5: '#E5E5E5',
        6: '#F6F6F6',
      },
      yellow: {
        1: '#FF9401',
        6: '#FFF0D9',
      },
      red: {
        1: '#E00000',
        5: '#F7BFBF',
        6: '#FCE5E5',
      },
      beige: {
        300: '#FCFBF3',
        400: '#FAF7E7',
        500: '#F6F1D7',
        600: '#D6D2BB',
        700: '#B7B39F',
        800: '#989585',
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
      brightGreen: {
        1: '#E3F8E3',
        2: '#C5F0C4',
        3: '#8CE18A',
        4: '#53D250',
        5: '#19C315',
        7: '#10900C',
        10: '#044A03',
      },
      darkGreen: {
        1: '#42A86B',
        4: '#A0D4B5',
        5: '#C6E5D3',
        6: '#E3F2E9',
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
      fontFamily: {
        primary: ['Rubik'],
        body: ['SpaceMono'],
        mono: ['Manrope'],
        poppins: ['Poppins'],
      },
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
        'md-button': '0px 0px 40px 0px #FF5C00;',
        'md-button-white': '0px 0px 40px 0px #FFFFFF88;',
        'sm-section': '0px 0px 20px 0px #FF5C00',
        'md-section': '0px 0px 30px 0px #FF5C00A3',
        'l-section': '0px 0px 50px 0px #FF5C00A3',
        'course-card': '0px 2px 4px 0px #B2B2B2',
        'course-navigation': '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
        'course-navigation-sm': '0px 2px 2px 0px rgba(0, 0, 0, 0.25)',
        'sm-card': '0px 0px 10px 0px #FF5C00',
        'sm-card-white': '0px 0px 10px 0px #FFFFFF',
        'button-white': '0px 0px 10px 0px rgba(255, 255, 255, 0.57)',
        'primary-button-light': '0px 2px 3px 0px rgba(0, 0, 0, 0.25)',
        'card-items-dark': '0px 4px 4px 0px #210C00',
        'search-word-sm': '0px 0px 30px 8.515px rgba(255,92,0,0.25)',
        'search-word-md': '0px 0px 51.676px 8.515px rgba(255,92,0,0.25)',
        'filter-bar': '0px 0px 50px 8px rgba(255,92,0,0.50)',
        'tabs-sm': '0px 2px 2px 0px rgba(0, 0, 0, 0.25);',
      },
      letterSpacing: {
        '015px': '0.15px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default baseConfig;
