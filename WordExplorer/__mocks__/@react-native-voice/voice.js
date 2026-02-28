// Manual mock for @react-native-voice/voice.
// Exposes jest.fn() stubs for every method used by NativeVoiceRecognizer,
// plus settable callback properties so tests can trigger speech events.
const Voice = {
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),
  removeAllListeners: jest.fn(),
  // Callback slots — tests can assign these directly.
  onSpeechResults: null,
  onSpeechError: null,
  onSpeechEnd: null,
};

module.exports = Voice;
module.exports.default = Voice;
