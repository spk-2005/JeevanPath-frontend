module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/navigation': './src/navigation',
            '@/hooks': './src/hooks',
            '@/utils': './src/utils',
            '@/store': './src/store',
            '@/theme': './src/theme',
            '@/i18n': './src/i18n'
          }
        }
      ]
    ]
  };
};


