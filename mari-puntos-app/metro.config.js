const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../');

const config = getSentryExpoConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

config.resolver.blockList = [
  new RegExp(
    `^${path.resolve(monorepoRoot, 'mari-puntos-backend', 'node_modules')}\\/.*`
  ),
  new RegExp(
    `^${path.resolve(monorepoRoot, 'mari-puntos-website', 'node_modules')}\\/.*`
  ),
];

module.exports = config;
