module.exports = {
  preset: 'react-native',
  // The react-native preset ignores all of node_modules by default.
  // We extend the exception list so Babel transforms packages that ship
  // ESM or JSX source.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native)/)',
  ],
  moduleNameMapper: {
    // Third-party native modules swapped for lightweight manual mocks.
    'react-native-linear-gradient':
      '<rootDir>/__mocks__/react-native-linear-gradient.js',
    '@react-native-voice/voice':
      '<rootDir>/__mocks__/@react-native-voice/voice.js',
    // Our own CJS mock — the official jest/mock.tsx only uses `export default`
    // which means named imports (SafeAreaProvider, SafeAreaView) resolve to
    // undefined in test environments.
    'react-native-safe-area-context':
      '<rootDir>/__mocks__/react-native-safe-area-context.js',
  },
};
