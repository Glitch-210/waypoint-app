const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable CSS imports (needed for mapbox-gl/dist/mapbox-gl.css)
  isCSSEnabled: true,
});

// Allow .wasm files to be loaded as assets (needed for expo-sqlite on mobile)
config.resolver.assetExts.push('wasm');

// Redirect Metro cache to D: drive to avoid ENOSPC on a full C: drive
config.cacheStores = [];
process.env.METRO_CACHE_DIR = 'D:\\WayPoint\\.metro-cache';

module.exports = config;

