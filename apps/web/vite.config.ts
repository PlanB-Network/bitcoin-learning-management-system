/// <reference types="vitest" />
/// <reference types="vite-plugin-svgr/client" />

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
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
  cacheDir: '../../node_modules/.vite/web',

  assetsInclude: ['../../libs/ui/src/assets'],

  server: {
    port: 4200,
    host: process.env.DOCKER ? '0.0.0.0' : 'localhost',
    fs: {
      allow: ['../../libs/ui/src/assets'],
    },
  },

  preview: {
    port: 4300,
    host: process.env.DOCKER ? '0.0.0.0' : 'localhost',
  },

  plugins: [react(), svgr(), nxViteTsPaths()],

  test: {
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/web',
      provider: 'v8',
    },
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
