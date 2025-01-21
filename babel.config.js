// https://dev.to/ianfelix/absolute-imports-in-react-native-57fc
// https://stackoverflow.com/questions/43681091/how-to-use-import-with-absolute-paths-with-expo-and-react-native

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@assets": "./assets",
            "@": "./src",
          },
        },
      ],
    ],
  };
};
