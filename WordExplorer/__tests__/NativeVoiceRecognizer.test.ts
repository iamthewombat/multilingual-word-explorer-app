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
  onSpeechEnd: (() => void) | null;
  onSpeechStart: (() => void) | null;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockVoice.onSpeechResults = null;
  mockVoice.onSpeechError = null;
  mockVoice.onSpeechEnd = null;
  mockVoice.onSpeechStart = null;
});

afterEach(() => {
  jest.useRealTimers();
});

/**
 * Helper: startListening calls Voice.destroy() (async) internally.
 * advanceTimersByTimeAsync flushes both microtasks and timers.
 */
async function startWithTimers(
  recognizer: NativeVoiceRecognizer,
  locale: string,
  callbacks: {onResult: jest.Mock; onError: jest.Mock},
): Promise<void> {
  const p = recognizer.startListening(locale, callbacks);
  await jest.advanceTimersByTimeAsync(0);
  await p;
}

describe('NativeVoiceRecognizer', () => {
  it('calls Voice.start with the given locale', async () => {
    const recognizer = new NativeVoiceRecognizer();
    await startWithTimers(recognizer, 'en-US', {
      onResult: jest.fn(),
      onError: jest.fn(),
    });
    expect(Voice.start).toHaveBeenCalledWith('en-US');
  });

  it('forwards the top hypothesis to onResult', async () => {
    const onResult = jest.fn();
    const recognizer = new NativeVoiceRecognizer();
    await startWithTimers(recognizer, 'en-US', {onResult, onError: jest.fn()});

    mockVoice.onSpeechStart!();
    mockVoice.onSpeechResults!({value: ['hello world', 'hello']});

    expect(onResult).toHaveBeenCalledWith('hello world');
  });

  it('calls onError with a friendly message on speech error', async () => {
    const onError = jest.fn();
    const recognizer = new NativeVoiceRecognizer();
    await startWithTimers(recognizer, 'en-US', {onResult: jest.fn(), onError});

    mockVoice.onSpeechStart!();
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
    await startWithTimers(recognizer, 'en-US', {onResult: jest.fn(), onError});

    mockVoice.onSpeechStart!();
    mockVoice.onSpeechError!({error: {code: '5', message: 'No speech'}});

    expect(onError).toHaveBeenCalledWith(
      expect.stringMatching(/no speech detected/i),
    );
  });

  it('calls Voice.stop when stopListening is called', async () => {
    const recognizer = new NativeVoiceRecognizer();
    await startWithTimers(recognizer, 'en-US', {
      onResult: jest.fn(),
      onError: jest.fn(),
    });
    mockVoice.onSpeechStart!();
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
    await startWithTimers(recognizer, 'en-US', {onResult, onError: jest.fn()});
    recognizer.destroy();

    // Even if the native layer fires an event after destroy, we ignore it.
    mockVoice.onSpeechResults!({value: ['late result']});

    expect(onResult).not.toHaveBeenCalled();
  });

  it('uses the Thai locale when passed', async () => {
    const recognizer = new NativeVoiceRecognizer();
    await startWithTimers(recognizer, 'th-TH', {
      onResult: jest.fn(),
      onError: jest.fn(),
    });
    expect(Voice.start).toHaveBeenCalledWith('th-TH');
  });

  it('destroys previous session before starting', async () => {
    const recognizer = new NativeVoiceRecognizer();
    await startWithTimers(recognizer, 'en-US', {
      onResult: jest.fn(),
      onError: jest.fn(),
    });
    expect(Voice.destroy).toHaveBeenCalled();
  });

  it('fires onError when onSpeechEnd fires without results', async () => {
    const onError = jest.fn();
    const recognizer = new NativeVoiceRecognizer();
    await startWithTimers(recognizer, 'en-US', {
      onResult: jest.fn(),
      onError,
    });

    mockVoice.onSpeechStart!();
    mockVoice.onSpeechEnd!();

    expect(onError).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(onError).toHaveBeenCalledWith(
      expect.stringMatching(/no speech detected/i),
    );
  });

  it('does not fire onError from onSpeechEnd if results arrived', async () => {
    const onError = jest.fn();
    const onResult = jest.fn();
    const recognizer = new NativeVoiceRecognizer();
    await startWithTimers(recognizer, 'en-US', {onResult, onError});

    mockVoice.onSpeechStart!();
    mockVoice.onSpeechResults!({value: ['hello']});
    mockVoice.onSpeechEnd!();

    jest.advanceTimersByTime(500);
    expect(onError).not.toHaveBeenCalled();
  });

  it('fires onError on stopListening when session never started', async () => {
    const onError = jest.fn();
    const recognizer = new NativeVoiceRecognizer();
    await startWithTimers(recognizer, 'en-US', {
      onResult: jest.fn(),
      onError,
    });

    // Session never started (no onSpeechStart) — simulates iOS audio
    // session conflict after TTS playback.
    await recognizer.stopListening();

    // Should fire fallback error if native callbacks never arrive.
    expect(onError).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1500);
    expect(onError).toHaveBeenCalledWith(
      expect.stringMatching(/microphone unavailable/i),
    );
  });

  it('fires no-speech fallback when session started but no callbacks arrive', async () => {
    const onError = jest.fn();
    const recognizer = new NativeVoiceRecognizer();
    await startWithTimers(recognizer, 'en-US', {
      onResult: jest.fn(),
      onError,
    });

    // Session started, but no onSpeechEnd/onSpeechError/onSpeechResults arrive.
    mockVoice.onSpeechStart!();
    await recognizer.stopListening();

    expect(onError).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1500);
    expect(onError).toHaveBeenCalledWith(
      expect.stringMatching(/no speech detected/i),
    );
  });

  it('does not fire dead-session error if results arrived before stop', async () => {
    const onError = jest.fn();
    const onResult = jest.fn();
    const recognizer = new NativeVoiceRecognizer();
    await startWithTimers(recognizer, 'en-US', {onResult, onError});

    // Session started and produced results before stop
    mockVoice.onSpeechStart!();
    mockVoice.onSpeechResults!({value: ['hello']});
    await recognizer.stopListening();

    jest.advanceTimersByTime(300);
    expect(onError).not.toHaveBeenCalled();
  });
});
