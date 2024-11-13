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
    TanStackRouterVite(),
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

  assetsInclude: [UI_PACKAGE_ASSETS],

  server: process.env.DOCKER
    ? {
        host: '0.0.0.0',
        port: 8181,
        strictPort: true,
        // TODO: check if hmr configuration is needed
        // hmr: {},
        proxy: {
          '/api': 'http://api:3000',
          '/cdn': {
            target: 'http://cdn:80',
            rewrite: (path) => path.replace(/^\/cdn/, ''),
          },
        },
      }
    : {
        host: '0.0.0.0',
        port: 8181,
        proxy: {
          '/api': 'http://localhost:3000',
          '/cdn': {
            target: 'http://localhost:8080',
            rewrite: (path) => path.replace(/^\/cdn/, ''),
          },
        },
      },
});
