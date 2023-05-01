import { join } from 'path';

const theme = {
  primary: '#1B263E',
  secondary: '#ADB4BC',
  accent: '#F2870D',
  neutral: '#191D24',
  'base-100': '#2A303C',
  info: '#91A5D4',
  success: '#A4DBBC',
  warning: '#FFCF99',
  error: '#DE6E75',
};

export default {
  important: true,
  content: [join(__dirname, './src/**/*.{js,ts,jsx,tsx}')],
  theme: {
    fontFamily: { primary: ['Poppins'], body: ['SpaceMono'] },
    fontWeight: {
      thin: '300',
      normal: '400',
      semibold: '600',
      bold: '700',
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
      white: '#fff',
      gray: {
        100: '#F1F2F4',
        200: '#E2E4E7',
        300: '#ADB4BC',
        400: '#737F8C',
        500: '#4D555E',
        600: '#2E3338',
      },
    },
    extend: theme,
  },
  plugins: [require('@tailwindcss/forms')],
};
