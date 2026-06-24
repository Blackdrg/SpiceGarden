const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ['tsx', 'ts', 'js', 'jsx', 'json'];
config.resolver.assetExts = ['png', 'jpg', 'jpeg', 'svg', 'webp'];

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

config.resolver.alias = {
  'lucide-react': require.resolve('lucide-react/dist/cjs/lucide-react.js'),
};

module.exports = config;