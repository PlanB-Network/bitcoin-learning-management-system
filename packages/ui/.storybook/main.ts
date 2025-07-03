import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
  ],

  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  stories: [
    '../src/stories/**/Fonts.mdx',
    '../src/stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],

  viteFinal: async (config) => {
    if (config.optimizeDeps) {
      config.optimizeDeps.exclude = [
        ...(config.optimizeDeps.exclude || []),
        '@storybook/addon-docs',
        '@storybook/addon-docs/blocks',
        'storybook/internal/components',
        'storybook/theming',
        '@storybook/global',
      ];
    }
    return config;
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
