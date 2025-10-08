/// <reference types="vite-plugin-svgr/client" />
/// <reference types="@types/node" />

import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const UI_PACKAGE_ASSETS = '../../packages/ui/src/assets';

// Modules to be treated as external during the build
const externalModules: string[] = [
  // Pears modules
  'corestore',
  'debounceify',
  'hypercore',
  'hyperswarm',
  'hyperdrive',

  // Node built-in modules
  'path',
];

/**
 * Custom plugin to mock backend-specific modules during the build.
 */
function emptyModulesPlugin(): Plugin {
  const mockModulePath = path.resolve(__dirname, './src/mocks/empty-module.js');

  return {
    name: 'empty-module',
    resolveId(source) {
      if (externalModules.includes(source)) {
        return mockModulePath;
      }

      return null;
    },
  };
}

export default defineConfig({
  assetsInclude: [UI_PACKAGE_ASSETS],
  base: '/',
  build: {
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    outDir: 'dist',
    reportCompressedSize: true,
    target: 'esnext',
    rollupOptions: {
      external: [...externalModules],
    },
  },
  resolve: {
    // Resolve empty modules for built-in modules
    alias: externalModules.reduce(
      (acc, mod) => {
        acc[mod] = path.resolve(__dirname, './vite.empty-module.js');
        return acc;
      },
      {} as Record<string, string>,
    ),
  },
  plugins: [
    emptyModulesPlugin(),
    svgr(),
    tsconfigPaths({
      root: './',
    }),
    tanstackRouter({
      // If set to true, creates several issues with the router / i18n
      autoCodeSplitting: false,
      target: 'react',
    }),
    react(),

    // Useful for analyzing bundle size
    // visualizer({
    //   filename: 'dist/stats.html',
    //   open: true,
    //   gzipSize: true,
    // }),
  ],

  root: process.cwd(),

  server: {
    host: '0.0.0.0',
    port: 8181,
    proxy: {
      '/api': `http://${process.env.DOCKER ? 'api' : 'localhost'}:3000`,
      '/cdn': {
        rewrite: (path) => path.replace(/^\/cdn/, ''),
        target: `http://${process.env.DOCKER ? 'cdn:80' : 'localhost:8080'}`,
      },
    },
  },
});
