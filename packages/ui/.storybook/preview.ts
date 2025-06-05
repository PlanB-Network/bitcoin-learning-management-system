import type { Decorator, Preview } from '@storybook/react-vite';
import {
  RouterProvider,
  createRootRoute,
  createRouter,
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
  decorators: [RouterDecorator],

  tags: ['autodocs'],
};

export default preview;
