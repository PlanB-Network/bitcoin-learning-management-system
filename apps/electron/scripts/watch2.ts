#!/usr/bin/env node

import type {
  ChildProcess,
  // ChildProcessWithoutNullStreams,
} from 'node:child_process';
// import { spawn } from 'node:child_process';
import path from 'node:path';
// import { fileURLToPath } from 'node:url';
// import electronPath from 'electron';
import type { LogLevel, ViteDevServer } from 'vite';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { build, createServer } from 'vite';

// biome-ignore lint/suspicious/noAssignInExpressions: todo
const mode = (process.env.MODE = process.env.MODE || 'development');

const logLevel: LogLevel = 'warn';

const argv = process.argv.slice(2);

// Parsing command line arguments
const args = argv.reduce(
  (acc, arg) => {
    const [key, value] = arg.split('=');
    acc[key] = value;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Setting up a listener for the `main` package
 * Completely restart the electron application when the file changes.
 * @param {import('vite').ViteDevServer} watchServer The renderer listens to the server instance.
 */
function setupMainPackageWatcher({ resolvedUrls }: ViteDevServer) {
  process.env.VITE_DEV_SERVER_URL = resolvedUrls?.local[0];

  /** @type {ChildProcess | null} */
  let electronApp: ChildProcess | null = null;

  return build({
    mode,
    logLevel,
    configFile: 'layers/main/vite.config.ts',
    build: {
      /**
       * @see https://vitejs.dev/config/build-options.html#build-watch
       */
      watch: Reflect.has(args, '--watch') ? {} : null,
    },

    plugins: [
      {
        name: 'reload-app-on-main-package-change',
        writeBundle() {
          console.log('Restarting Electron app...');
          /** Kill electron if process already exist */
          if (electronApp !== null) {
            electronApp.removeListener('exit', process.exit);
            electronApp.kill('SIGINT');
            electronApp = null;
          }

          // /** Spawn new electron process */
          // console.log(String(electronPath));
          // electronApp = spawn(String(electronPath), ['--inspect', '.'], {
          //   stdio: 'inherit',
          // });

          // /** Stops the watch script when the application has been quit */
          // electronApp.addListener('exit', process.exit);

          //   if (spawnProcess !== null) {
          //     console.log('Killing previous Electron process...');
          //     spawnProcess.off('exit', process.exit);
          //     spawnProcess.kill('SIGINT');
          //     spawnProcess = null;
          //   }

          //spawnProcess = spawn(String(electronPath), ['.']);

          //   spawnProcess.stdout.on(
          //     'data',
          //     (d) =>
          //       d.toString().trim() &&
          //       logger.warn(d.toString(), { timestamp: true }),
          //   );
          //   spawnProcess.stderr.on('data', (d) => {
          //     console.log('*****xxx');
          //     const data = d.toString().trim();
          //     console.log('*****aaa');
          //     if (!data) return;
          //     const mayIgnore = stderrFilterPatterns.some((r) => r.test(data));
          //     console.log('*****yyy');
          //     if (mayIgnore) return;
          //     logger.error(data, { timestamp: true });
          //     console.log('*****zzz');
          //   });

          // Stops the watch script when the application has been quit
          //   spawnProcess.on('exit', process.exit);
        },
        // writeBundle() {
        //   if (electronApp !== null) {
        //     electronApp.removeListener('exit', process.exit);
        //     electronApp.kill('SIGINT');
        //     electronApp = null;
        //   }

        //   console.log('Reloading electron app...', String(electronPath));
        //   console.log('ZZZ');
        //   console.log('DIRNAME =', __dirname);
        //   console.log('YYY');

        //   electronApp = spawn(String(electronPath), ['--inspect', '.'], {
        //     cwd: path.resolve(__dirname, '../apps/electron-main'),
        //   });
        //   console.log('OOOOOOOOOO');

        //   electronApp.stdout?.on('data', (data) => {
        //     console.log(data.toString());
        //   });

        //   electronApp.stderr?.on('data', (data) => {
        //     console.log('ERROR??!!');
        //     const str = data.toString();
        //     const ignoreErrors = [
        //       'Secure coding is not enabled for restorable state',
        //       'CoreText note: Client requested name',
        //     ];
        //     if (ignoreErrors.some((err) => str.includes(err))) {
        //       return;
        //     }
        //     console.log('\x1B[31m%s\x1B[0m', str);
        //   });

        //   electronApp.addListener('exit', process.exit);
        // },
      },
    ],
  });
}

/**
 * Setting up a listener for `preload` packages
 * Reload the page when the file changes.
 * @param {import('vite').ViteDevServer} watchServer The renderer listens to the server instance.
 * The web socket that needs access to the page. reload the page by sending the `full-reload` command to the socket.
 */
function setupPreloadPackageWatcher({ ws }: ViteDevServer) {
  return build({
    mode,
    logLevel,
    configFile: 'layers/preload/vite.config.ts',
    build: {
      /**
       * @see https://vitejs.dev/config/build-options.html#build-watch
       */
      watch: {},
    },
    plugins: [
      {
        name: 'reload-page-on-preload-package-change',
        writeBundle() {
          ws.send({
            type: 'full-reload',
          });
        },
      },
    ],
  });
}

/**
 * The development server for the renderer package must be the first to start.
 */
(async () => {
  console.log(
    'Starting renderer dev server...',
    path.resolve(__dirname, '../../../apps/web'),
  );
  const rendererWatchServer = await createServer({
    mode,
    logLevel,
    configFile: '../../apps/web/vite.config.ts',
    root: path.resolve(__dirname, '../../../apps/web'),
  }).then((s) => s.listen());

  await setupPreloadPackageWatcher(rendererWatchServer);
  await setupMainPackageWatcher(rendererWatchServer);
})();
