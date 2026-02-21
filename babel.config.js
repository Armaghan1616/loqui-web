module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // IMPORTANT: no 'expo-router/babel' plugin here
  };
};
