/// <reference types="vite-plugin-svgr/client" />

import { builtinModules } from 'node:module';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const UI_PACKAGE_ASSETS = '../../packages/ui/src/assets';

const pearsModules: string[] = [
  'corestore',
  'debounceify',
  'hypercore',
  'hyperswarm',
  'hyperdrive',
  'b4a',
  'pear-bridge',
  'pear-electron',
  'pear-updates',
];

const nativeModules = [
  ...pearsModules,
  ...builtinModules.flatMap((m) => [m, `@${m}`, `@types/${m}`]),
];

export default defineConfig({
  assetsInclude: [UI_PACKAGE_ASSETS],
  base: '/',
  build: {
    chunkSizeWarningLimit: 600,
    minify: false,

    cssCodeSplit: true,
    outDir: 'dist',
    reportCompressedSize: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // Pear v2 requires this to work properly
      },
      // Externalize any Node.js built-in modules
      external: [...nativeModules],
    },
  },
  optimizeDeps: {
    exclude: [
      ...nativeModules, //
    ],
  },
  plugins: [
    svgr(),
    tsconfigPaths({
      root: './',
    }),
    tanstackRouter({
      autoCodeSplitting: false, // Disable for pear
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
        target: `http://${process.env.DOCKER ? 'cdn:80' : 'localhost:8080'}`,
      },
    },
  },
});
