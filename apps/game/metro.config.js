/**
 * Metro config — resolves external file: dependencies across workspace boundaries.
 *
 * Metro does not follow npm symlinks reliably on Windows. @prime/* and @stage/*
 * are installed as file: deps (symlinks in node_modules) pointing outside the
 * idle-hero-rpg/ project root. Without explicit config, Metro returns a 500 on
 * Expo Web (entry.bundle served as application/json instead of JavaScript).
 *
 * Fix: watchFolders + resolveRequest together. watchFolders makes Metro watch
 * those dirs for HMR; resolveRequest bypasses the broken symlink lookup and
 * maps package names directly to their TypeScript source on disk.
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '../..');
const devRoot = path.resolve(repoRoot, '..');

const stageRoot  = path.resolve(devRoot, 'stage');
const primeRoot  = path.resolve(devRoot, 'prime');

const config = getDefaultConfig(projectRoot);

// Watch external workspaces so Metro picks up HMR changes there too
config.watchFolders = [
  repoRoot,
  stageRoot,
  primeRoot,
];

// Direct package → source mapping — bypasses Windows symlink resolution
const externalPackages = {
  '@prime/prime-random':  path.join(primeRoot, 'packages/prime-random/src/index.ts'),
  '@stage/stage-economy': path.join(stageRoot, 'packages/stage-economy/src/index.ts'),
  '@stage/stage-time':    path.join(stageRoot, 'packages/stage-time/src/index.ts'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (externalPackages[moduleName]) {
    return { filePath: externalPackages[moduleName], type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
