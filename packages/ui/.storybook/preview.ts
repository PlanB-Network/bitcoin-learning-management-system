import type { Decorator, Preview } from '@storybook/react-vite';
import {
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import React from 'react';

import '../src/styles/global.css';

const RouterDecorator: Decorator = (Story) => {
  const rootRoute = createRootRoute({
    component: () => React.createElement(Story),
  });
  const routeTree = rootRoute;
  const router = createRouter({ routeTree });
  return React.createElement(RouterProvider, { router });
};

const preview: Preview = {
  decorators: [RouterDecorator],

  initialGlobals: {
    backgrounds: { value: 'light' },
  },
  parameters: {
    backgrounds: {
      options: {
        dark: { name: 'Dark', value: '#333' },
        light: { name: 'Light', value: '#ccc' },
      },
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
