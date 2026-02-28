/**
 * Manual mock for react-native-tts.
 */
const listeners = {};

const Tts = {
  getInitStatus: jest.fn().mockResolvedValue('success'),
  setDefaultRate: jest.fn(),
  setDefaultLanguage: jest.fn(),
  setIgnoreSilentSwitch: jest.fn(),
  speak: jest.fn().mockResolvedValue(null),
  stop: jest.fn(),
  addEventListener: jest.fn((event, handler) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(handler);
  }),
  removeAllListeners: jest.fn((event) => {
    if (event) {
      delete listeners[event];
    }
  }),

  // Test helper: emit an event to all registered listeners
  __emit: (event, ...args) => {
    if (listeners[event]) {
      listeners[event].forEach((fn) => fn(...args));
    }
  },
  __resetListeners: () => {
    Object.keys(listeners).forEach((k) => delete listeners[k]);
  },
};

module.exports = {
  __esModule: true,
  default: Tts,
};
