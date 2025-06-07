const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add additional asset extensions to the default ones
config.resolver.assetExts.push('tflite');
config.resolver.assetExts.push('bin');
config.resolver.assetExts.push('json');

module.exports = config;
