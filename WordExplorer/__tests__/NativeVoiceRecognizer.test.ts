/**
 * Unit tests for NativeVoiceRecognizer.
 *
 * The @react-native-voice/voice module is replaced by the manual mock in
 * __mocks__/@react-native-voice/voice.js, so no native binary is needed.
 */

import Voice from '@react-native-voice/voice';
import {NativeVoiceRecognizer} from '../src/services/NativeVoiceRecognizer';

// Cast mock fns so TypeScript is happy.
const mockVoice = Voice as jest.Mocked<typeof Voice> & {
  onSpeechResults: ((e: any) => void) | null;
  onSpeechError: ((e: any) => void) | null;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockVoice.onSpeechResults = null;
  mockVoice.onSpeechError = null;
});

describe('NativeVoiceRecognizer', () => {
  it('calls Voice.start with the given locale', async () => {
    const recognizer = new NativeVoiceRecognizer();
    await recognizer.startListening('en-US', {
      onResult: jest.fn(),
      onError: jest.fn(),
    });
    expect(Voice.start).toHaveBeenCalledWith('en-US');
  });

  it('forwards the top hypothesis to onResult', async () => {
    const onResult = jest.fn();
    const recognizer = new NativeVoiceRecognizer();
    await recognizer.startListening('en-US', {onResult, onError: jest.fn()});

    // Simulate the native bridge firing onSpeechResults.
    mockVoice.onSpeechResults!({value: ['hello world', 'hello']});

    expect(onResult).toHaveBeenCalledWith('hello world');
  });

  it('calls onError with a friendly message on speech error', async () => {
    const onError = jest.fn();
    const recognizer = new NativeVoiceRecognizer();
    await recognizer.startListening('en-US', {onResult: jest.fn(), onError});

    mockVoice.onSpeechError!({
      error: {code: '7', message: 'No match found'},
    });

    expect(onError).toHaveBeenCalledWith(
      'Speech recognition error — please try again.',
    );
  });

  it('reports "no speech detected" for error code 5', async () => {
    const onError = jest.fn();
    const recognizer = new NativeVoiceRecognizer();
    await recognizer.startListening('en-US', {onResult: jest.fn(), onError});

    mockVoice.onSpeechError!({error: {code: '5', message: 'No speech'}});

    expect(onError).toHaveBeenCalledWith(
      expect.stringMatching(/no speech detected/i),
    );
  });

  it('calls Voice.stop when stopListening is called', async () => {
    const recognizer = new NativeVoiceRecognizer();
    await recognizer.stopListening();
    expect(Voice.stop).toHaveBeenCalled();
  });

  it('calls Voice.destroy and removeAllListeners on destroy()', () => {
    const recognizer = new NativeVoiceRecognizer();
    recognizer.destroy();
    expect(Voice.destroy).toHaveBeenCalled();
    expect(Voice.removeAllListeners).toHaveBeenCalled();
  });

  it('does not fire callbacks after destroy()', async () => {
    const onResult = jest.fn();
    const recognizer = new NativeVoiceRecognizer();
    await recognizer.startListening('en-US', {onResult, onError: jest.fn()});
    recognizer.destroy();

    // Even if the native layer fires an event after destroy, we ignore it.
    mockVoice.onSpeechResults!({value: ['late result']});

    expect(onResult).not.toHaveBeenCalled();
  });

  it('uses the Thai locale when passed', async () => {
    const recognizer = new NativeVoiceRecognizer();
    await recognizer.startListening('th-TH', {
      onResult: jest.fn(),
      onError: jest.fn(),
    });
    expect(Voice.start).toHaveBeenCalledWith('th-TH');
  });
});
