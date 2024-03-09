/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const UI_PACKAGE_ASSETS = '../../packages/ui/src/assets';

export default defineConfig({
  plugins: [react(), svgr(), tsconfigPaths()],

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
      }
    : {
        host: '0.0.0.0',
        port: 8181,
      },

  test: {
    reporters: ['default'],
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
