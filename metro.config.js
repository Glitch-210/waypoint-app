const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable CSS imports (needed for mapbox-gl/dist/mapbox-gl.css)
  isCSSEnabled: true,
});

// Allow .wasm files to be loaded as assets (needed for expo-sqlite on mobile)
config.resolver.assetExts.push('wasm');

// @liveblocks/client has a non-standard "module" condition inside its "require"
// exports block that points to ESM (dist/index.js). Metro's default condition
// list includes "module", so it picks the ESM entry — which RN can't execute,
// making createClient undefined → TypeError on load.
//
// Fix: keep package exports enabled (required for @clerk/react subpath exports
// like "./internal") but remove "module" from the condition list so Liveblocks
// falls back to "default" → dist/index.cjs (CJS).
config.resolver.unstable_conditionNames = ['require', 'react-native', 'default'];

// Redirect Metro cache to D: drive to avoid ENOSPC on a full C: drive
config.cacheStores = [];
process.env.METRO_CACHE_DIR = 'D:\\WayPoint\\.metro-cache';

module.exports = config;

