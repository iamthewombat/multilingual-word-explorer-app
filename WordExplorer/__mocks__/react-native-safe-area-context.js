// Manual mock for react-native-safe-area-context.
// Exposes named exports (SafeAreaProvider, SafeAreaView, useSafeAreaInsets)
// so Jest tests don't need the native library linked.
//
// NOTE: The official jest/mock.tsx only has `export default { ... }` which
// means named imports resolve to undefined. This CJS mock avoids that.
const React = require('react');
const {View} = require('react-native');

const SafeAreaProvider = ({children}) => React.createElement(View, null, children);
const SafeAreaView = ({children, style}) =>
  React.createElement(View, {style}, children);

const useSafeAreaInsets = () => ({top: 0, right: 0, bottom: 0, left: 0});
const useSafeAreaFrame = () => ({x: 0, y: 0, width: 390, height: 844});

const initialWindowMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 0, right: 0, bottom: 0, left: 0},
};

module.exports = {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics,
};
