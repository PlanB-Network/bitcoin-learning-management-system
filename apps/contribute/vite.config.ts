/// <reference types="vite-plugin-svgr/client" />

import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const UI_PACKAGE_ASSETS = '../../packages/ui/src/assets';

export default defineConfig({
  plugins: [
    svgr(),
    tsconfigPaths({
      root: './',
    }),
    TanStackRouterVite({
      // TODO: Enable when https://github.com/TanStack/router/issues/2317 is fixed
      autoCodeSplitting: false,
    }),
    viteReact(),
  ],

  root: process.cwd(),
  base: '/',
  build: {
    target: 'esnext',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    outDir: 'dist',
  },

  optimizeDeps: {
    include: ['pptxgenjs'],
  },

  define: {
    global: 'globalThis',
  },

  assetsInclude: [UI_PACKAGE_ASSETS],

  server: {
    host: '0.0.0.0',
    port: 8280,
    proxy: {
      '/api': `http://${process.env.DOCKER ? 'api' : 'localhost'}:3000`,
      '/cdn': {
        target: `http://${process.env.DOCKER ? 'cdn:80' : 'localhost:8080'}`,
        rewrite: (path) => path.replace(/^\/cdn/, ''),
      },

      // ONLYOFFICE Document Server static assets
      '/web-apps': {
        target: `http://${process.env.DOCKER ? 'onlyoffice' : 'localhost'}`,
        changeOrigin: true,
      },
      // Versioned resource folder (e.g. /9.0.2-abcdef123/)
      '^/\\d+\\.\\d+\\.\\d+.*': {
        target: `http://${process.env.DOCKER ? 'onlyoffice' : 'localhost'}`,
        changeOrigin: true,
      },
    },
  },
});
