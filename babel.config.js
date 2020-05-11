/**
 * Babel is used only to run jest:
 * https://jestjs.io/docs/en/next/getting-started#using-typescript
 *
 * (permalink: https://github.com/facebook/jest/blob/3681cca5f53f901715ab0064c5bf78f463914498/docs/GettingStarted.md#using-typescript)
 *
 */
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
  // env: {
  //   test: {
  //     presets: [
  //       ["@babel/preset-env", { targets: { node: "current" } }],
  //       "@babel/preset-typescript",
  //     ],
  //   },
  // },
};
