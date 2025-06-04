/** @type { import('@storybook/react-vite').Preview } */

import '../src/styles/global.css';

const preview = {
  parameters: {
    backgrounds: {
      default: 'lightgray',
      values: [
        {
          name: 'lightgray',
          value: '#F2F2F2',
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  tags: ['autodocs'],
};

export default preview;
