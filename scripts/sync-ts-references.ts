#!/usr/bin/env tsx

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'jsonc-parser';

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const rootDirectoryPath = path.resolve(currentDirectoryPath, '../index.js');

const packagesDirectoryPath = path.join(rootDirectoryPath, 'packages');
const appsDirectoryPath = path.join(rootDirectoryPath, 'apps');

const readJSON = (filePath: string): any => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return parse(content);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Error reading file ${filePath} from disk: ${error}`);
    process.exit(1);
  }
};

const writeJSON = (filePath: string, data: any): void => {
  const content = JSON.stringify(data, (key, value) => value, 2);
  fs.writeFileSync(filePath, content);
};

const getDirectories = (sourcePath: string): string[] => {
  return fs
    .readdirSync(sourcePath)
    .filter((directory) =>
      fs.statSync(path.join(sourcePath, directory)).isDirectory(),
    );
};

const getTsConfigFiles = (sourcePath: string): string[] => {
  return fs
    .readdirSync(sourcePath)
    .filter((file) => /^tsconfig\.([a-z]+\.)?json$/.test(file));
};

const getRelativePath = (
  sourceDirectoryPath: string,
  targetDirectoryPath: string,
): string => {
  let relativePath = path.relative(sourceDirectoryPath, targetDirectoryPath);
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  return relativePath;
};

const allDirectoryPaths = [
  ...getDirectories(packagesDirectoryPath).map((x) => `packages/${x}`),
  ...getDirectories(appsDirectoryPath).map((x) => `apps/${x}`),
];

for (const currentDirectoryPath of allDirectoryPaths) {
  const packagePath = path.join(currentDirectoryPath, 'package.json');
  const tsconfigLibPath = path.join(currentDirectoryPath, 'tsconfig.lib.json');
  const tsconfigAppPath = path.join(currentDirectoryPath, 'tsconfig.app.json');

  if (
    !fs.existsSync(packagePath) ||
    (!fs.existsSync(tsconfigLibPath) && !fs.existsSync(tsconfigAppPath))
  )
    continue;

  const packageData = readJSON(packagePath);

  const combinedDependencies = {
    ...packageData.dependencies,
    ...packageData.devDependencies,
  };

  for (const tsconfigFile of getTsConfigFiles(currentDirectoryPath)) {
    const tsconfigFilePath = path.join(currentDirectoryPath, tsconfigFile);
    console.log(`Syncing references for ${tsconfigFilePath}`);
    const tsconfigData = readJSON(tsconfigFilePath);

    const newReferences: Array<{ path: string }> = [];

    if (combinedDependencies) {
      for (const dependency of Object.keys(combinedDependencies)) {
        if (dependency.startsWith('@sovereign-university/')) {
          const referenceName = dependency.split('/').pop();
          if (!referenceName) continue;

          const targetDirectoryPath = path.join(
            packagesDirectoryPath,
            referenceName,
          );
          const relativePath = getRelativePath(
            currentDirectoryPath,
            targetDirectoryPath,
          );

          newReferences.push({ path: `${relativePath}/tsconfig.lib.json` });
        }
      }
    }

    tsconfigData.references = [...new Set(newReferences)];

    if (tsconfigData.references.length === 0) {
      delete tsconfigData.references;
    }

    writeJSON(tsconfigFilePath, tsconfigData);
  }
}
