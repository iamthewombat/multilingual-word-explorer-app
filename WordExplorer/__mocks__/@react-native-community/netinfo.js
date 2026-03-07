/**
 * Manual mock for @react-native-community/netinfo.
 *
 * Exports a useNetInfo hook that returns a controllable connectivity state.
 * Tests can call `__setConnected(false)` to simulate offline.
 */

let _isConnected = true;

const useNetInfo = () => ({
  isConnected: _isConnected,
  isInternetReachable: _isConnected,
  type: _isConnected ? 'wifi' : 'none',
});

const fetch = () =>
  Promise.resolve({
    isConnected: _isConnected,
    isInternetReachable: _isConnected,
    type: _isConnected ? 'wifi' : 'none',
  });

const addEventListener = () => () => {};

const __setConnected = (connected) => {
  _isConnected = connected;
};

const __reset = () => {
  _isConnected = true;
};

module.exports = {
  useNetInfo,
  fetch,
  addEventListener,
  __setConnected,
  __reset,
  default: {
    useNetInfo,
    fetch,
    addEventListener,
    configure: () => {},
  },
};
