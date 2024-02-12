/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />

import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/apps/web',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  assetsInclude: ['../../packages/ui/src/assets'],

  server: {
    port: 4200,
    host: process.env.DOCKER ? '0.0.0.0' : 'localhost',
    fs: {
      allow: ['../../packages/ui/src/assets'],
    },
  },

  preview: {
    port: 4300,
    host: process.env.DOCKER ? '0.0.0.0' : 'localhost',
  },

  plugins: [react(), svgr(), tsconfigPaths()],

  test: {
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/web',
      provider: 'v8',
    },
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
