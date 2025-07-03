/// <reference types="vite-plugin-svgr/client" />

import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const UI_PACKAGE_ASSETS = '../../packages/ui/src/assets';

export default defineConfig({
  assetsInclude: [UI_PACKAGE_ASSETS],
  base: '/',
  build: {
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    outDir: 'dist',
    reportCompressedSize: true,
    target: 'esnext',
  },
  plugins: [
    svgr(),
    tsconfigPaths({
      root: './',
    }),
    tanstackRouter({
      // TODO: Enable when https://github.com/TanStack/router/issues/2317 is fixed
      autoCodeSplitting: false,
      target: 'react',
    }),
    react(),
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
