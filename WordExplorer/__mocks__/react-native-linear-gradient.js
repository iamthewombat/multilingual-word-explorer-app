// Manual mock for react-native-linear-gradient.
// Renders a plain View so component tests don't need the native library linked.
const React = require('react');
const {View} = require('react-native');

const LinearGradient = ({children, style, testID}) =>
  React.createElement(View, {style, testID}, children);

// Support both `import LinearGradient from '...'` and `require('...')`.
LinearGradient.default = LinearGradient;
module.exports = LinearGradient;
