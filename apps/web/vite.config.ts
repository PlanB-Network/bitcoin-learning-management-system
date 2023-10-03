/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/web',

  server: {
    port: 4200,
    host: process.env.DOCKER ? '0.0.0.0' : 'localhost',
  },

  preview: {
    port: 4300,
    host: process.env.DOCKER ? '0.0.0.0' : 'localhost',
  },

  plugins: [react(), svgr(), nxViteTsPaths()],

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
