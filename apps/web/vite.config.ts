/// <reference types="vite-plugin-svgr/client" />
/// <reference types="@types/node" />

import path from 'node:path';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
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
  'pear-updates',

  // Node built-in modules
  'path',
];

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
        target: `http://${process.env.DOCKER ? 'cdn:80' : 'localhost:8080'}`,
      },
    },
  },
});
