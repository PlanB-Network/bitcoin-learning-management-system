import type { CopySyncOptions } from 'node:fs';
import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process, { exit, platform } from 'node:process';
import type { Configuration } from 'electron-builder';
import { build, Platform } from 'electron-builder';

const version = process.env.VITE_APP_VERSION;
const isDev = process.env.NODE_ENV === 'development';
const appName = isDev ? 'ElectronAppDev' : 'ElectronApp';
const appId = isDev ? 'com.electron.app' : 'com.electron-dev.app';
const shortcutName = isDev ? 'Electron App Dev' : 'Electron App';

console.log('IsDev: ', isDev, appName);
console.log('APP version:', version);

const workDir = path.join(__dirname, '../');
console.log('WorkDir:', workDir);

const copySyncOptions: CopySyncOptions = {
  recursive: true,
  filter: (src) => !src.endsWith('.map') && !src.endsWith('.d.ts'),
};

cpSync(
  path.join(workDir, '../web/dist'),
  path.join(workDir, './dist/web'),
  copySyncOptions,
);
//
// cpSync(
//   path.join(workDir, '../web/dist/locales'),
//   path.join(workDir, './locales'),
//   copySyncOptions,
// );
cpSync(
  path.join(workDir, '../electron/layers/preload/dist'),
  path.join(workDir, './dist/preload'),
  copySyncOptions,
);
cpSync(
  path.join(workDir, '../electron/layers/main/dist'),
  path.join(workDir, './dist'),
  copySyncOptions,
);

// Update the index.html file for Electron
const indexPath = path.join(__dirname, '../dist/web/index.html');
const indexContent = readFileSync(indexPath, 'utf8');
// indexContent = indexContent.replace(/href="\/(.*?)"/g, 'href="./$1"');
// indexContent = indexContent.replace(/src="\/(.*?)"/g, 'src="./$1"');
writeFileSync(path.join(__dirname, '../dist/web/index.html'), indexContent);

const options: Configuration = {
  appId,
  productName: appName,
  copyright: appName,
  // biome-ignore lint/suspicious/noTemplateCurlyInString: .
  artifactName: '${productName}_${arch}_${version}.${ext}',
  asar: true,
  extraMetadata: {
    version,
    name: appName,
    main: 'dist/index.cjs',
  },
  directories: {
    output: '../../out',
    buildResources: 'buildResources',
  },
  files: ['locales', 'dist', 'resources'],
  protocols: {
    name: 'ElectronApp Example',
    schemes: ['electronapp'],
  },
  // "store” | “normal” | "maximum". - For testing builds, use 'store' to reduce build time significantly.
  compression: 'normal',
  removePackageScripts: true,
  nodeGypRebuild: false,
  buildDependenciesFromSource: false,
  win: {
    icon: 'icon.ico',
    target: [
      {
        target: 'nsis',
        arch: ['ia32', 'x64'],
      },
    ],
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName,
  },
  dmg: {
    sign: true,
  },
  linux: {
    target: ['AppImage'],
    // target: ['AppImage', 'rpm', 'deb'],
  },
};

const targetPlatform: Platform = {
  darwin: Platform.MAC,
  win32: Platform.WINDOWS,
  linux: Platform.LINUX,
}[platform];

build({
  targets: targetPlatform.createTarget(),
  config: options,
  publish: 'never', // process.env.CI ? 'always' : 'never',
})
  .then((result) => {
    console.log(JSON.stringify(result));
    const outDir = path.join(workDir, options.directories!.output!);
    console.log(
      '\x1B[32m',
      `Packaging completed🎉🎉🎉 => Directory: ${outDir}`,
    );
  })
  .catch((error) => {
    console.log('\x1B[31m', 'Packaging failed', error);
    exit(1);
  });
