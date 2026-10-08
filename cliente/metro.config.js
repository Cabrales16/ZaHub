// metro.config.js
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// El backend simulado vive en ../shared y lo comparten el panel admin y esta app.
config.watchFolders = [...(config.watchFolders || []), path.resolve(__dirname, "../shared")];

module.exports = withNativeWind(config, {
  input: "./global.css",
});
