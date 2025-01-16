// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for .mjs files and handle ES modules properly (to make for bwip-js work)
config.resolver.sourceExts.push("mjs");
config.resolver.assetExts = ["ps", "ttf", "otf", ...config.resolver.assetExts];

module.exports = config;
