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
  fontSize: {
    xxs: ['10px', '14px'],
  },
  spacing: {
    23: '5.75rem',
  },
};

export default {
  important: true,
  content: [join(__dirname, './src/**/*.{js,ts,jsx,tsx}')],
  theme: {
    fontFamily: { primary: ['Poppins'], body: ['SpaceMono'] },
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
        500: '#2C6E49',
        600: '#204B35',
        800: '#172A1E',
      },
    },
    extend: theme,
  },
  plugins: [require('@tailwindcss/forms')],
};
