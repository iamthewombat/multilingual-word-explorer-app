/**
 * NativeSpeechSynthesizer unit tests.
 *
 * Uses the manual mock at __mocks__/react-native-tts.js.
 */
import Tts from 'react-native-tts';
import {NativeSpeechSynthesizer} from '../src/services/NativeSpeechSynthesizer';

// Access test helpers on the mock
const TtsMock = Tts as any;

let synth: NativeSpeechSynthesizer;

beforeEach(() => {
  jest.clearAllMocks();
  TtsMock.__resetListeners();
  synth = new NativeSpeechSynthesizer();
});

describe('NativeSpeechSynthesizer', () => {
  it('initialises TTS engine on first speak', async () => {
    // Simulate tts-finish immediately after speak
    (Tts.speak as jest.Mock).mockImplementation(() => {
      setTimeout(() => TtsMock.__emit('tts-finish'), 0);
    });

    await synth.speak('hello', 'en-US');

    expect(Tts.setDefaultRate).toHaveBeenCalledWith(0.45);
    expect(Tts.setIgnoreSilentSwitch).toHaveBeenCalledWith('ignore');
  });

  it('sets language and calls Tts.speak with text', async () => {
    (Tts.speak as jest.Mock).mockImplementation(() => {
      setTimeout(() => TtsMock.__emit('tts-finish'), 0);
    });

    await synth.speak('สวัสดี', 'th-TH');

    expect(Tts.setDefaultLanguage).toHaveBeenCalledWith('th-TH');
    expect(Tts.speak).toHaveBeenCalledWith('สวัสดี');
  });

  it('stops current speech before starting new utterance', async () => {
    (Tts.speak as jest.Mock).mockImplementation(() => {
      setTimeout(() => TtsMock.__emit('tts-finish'), 0);
    });

    await synth.speak('hello', 'en-US');

    // stop is called once during speak (before the new utterance)
    expect(Tts.stop).toHaveBeenCalled();
  });

  it('resolves when tts-cancel fires', async () => {
    (Tts.speak as jest.Mock).mockImplementation(() => {
      setTimeout(() => TtsMock.__emit('tts-cancel'), 0);
    });

    // Should resolve without throwing
    await synth.speak('hello', 'en-US');
  });

  it('stop() calls Tts.stop', () => {
    synth.stop();
    expect(Tts.stop).toHaveBeenCalled();
  });

  it('destroy() stops and removes listeners', () => {
    synth.destroy();
    expect(Tts.stop).toHaveBeenCalled();
    expect(Tts.removeAllListeners).toHaveBeenCalledWith('tts-finish');
    expect(Tts.removeAllListeners).toHaveBeenCalledWith('tts-cancel');
  });

  it('only initialises once across multiple speak calls', async () => {
    (Tts.speak as jest.Mock).mockImplementation(() => {
      setTimeout(() => TtsMock.__emit('tts-finish'), 0);
    });

    await synth.speak('a', 'en-US');
    TtsMock.__resetListeners();
    await synth.speak('b', 'en-US');

    // init is called only once — setDefaultRate should be called just once
    expect(Tts.setDefaultRate).toHaveBeenCalledTimes(1);
  });
});
