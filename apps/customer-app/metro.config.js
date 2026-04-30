const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the shared package directory so Metro sees changes
config.watchFolders = [path.resolve(workspaceRoot, 'shared')];

// 2. Make sure Metro can find node_modules in both the app and workspace root
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Resolve shared-types from the monorepo shared/ directory
config.resolver.extraNodeModules = {
    'shared-types': path.resolve(workspaceRoot, 'shared'),
};

module.exports = config;
