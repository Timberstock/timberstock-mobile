// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

// https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/#step-3-wrap-metro-config-with-reanimated-wrapper-recommended
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for .mjs files and handle ES modules properly (to make for bwip-js work)
config.resolver.sourceExts.push('mjs');
config.resolver.assetExts = ['ps', 'ttf', 'otf', ...config.resolver.assetExts];

// https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/#step-3-wrap-metro-config-with-reanimated-wrapper-recommended
module.exports = wrapWithReanimatedMetroConfig(config);
