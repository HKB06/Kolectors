module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // Ajoutez le plugin react-native-reanimated en dernier
      'react-native-reanimated/plugin',
    ],
  };
};
