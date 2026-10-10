const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ['tsx', 'ts', 'js', 'jsx', 'json', 'css'];
config.resolver.assetExts = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'css'];
config.watchFolders = [root];
config.resolver.nodeModulesPaths = [path.join(root, 'node_modules')];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'lucide-react') {
    return path.join(root, 'node_modules/lucide-react/dist/cjs/lucide-react.js');
  }
  if (typeof context.resolveRequest === 'function') {
    return context.resolveRequest(moduleName, platform);
  }
  return moduleName;
};

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

config.resolver.alias = {
  'lucide-react': path.join(root, 'node_modules/lucide-react/dist/cjs/lucide-react.js'),
};

module.exports = config;