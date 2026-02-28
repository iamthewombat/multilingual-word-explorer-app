/**
 * NativeSpeechSynthesizer
 *
 * Implements the SpeechSynthesizer interface using react-native-tts
 * (which wraps iOS AVSpeechSynthesizer / Android TextToSpeech).
 *
 * Enforces single-playback: calling speak() stops any in-progress utterance.
 *
 * NOTE: react-native-tts has BOOL conversion bugs under New Architecture.
 * We call NativeModules.TextToSpeech directly for methods with BOOL params
 * (setDefaultRate, stop) and fall back to the Tts wrapper in test/non-native
 * environments.
 *
 * Setup:
 *   npm install react-native-tts
 *   cd ios && pod install
 */
import {NativeModules} from 'react-native';
import Tts from 'react-native-tts';
import {SpeechSynthesizer} from './speechSynthesizer';

// Access native module directly for methods with BOOL params that break
// under New Architecture's bridge. Falls back to undefined in Jest.
const TTSNative = NativeModules.TextToSpeech;

/** Safely call stop — native module direct or wrapper fallback. */
function ttsStop(): void {
  try {
    if (TTSNative) {
      TTSNative.stop(false);
    } else {
      Tts.stop();
    }
  } catch {
    // Best-effort
  }
}

export class NativeSpeechSynthesizer implements SpeechSynthesizer {
  private initialized = false;

  private init(): void {
    if (this.initialized) {
      return;
    }
    try {
      if (TTSNative) {
        // Call native module directly — the Tts JS wrapper passes a BOOL
        // that fails conversion under New Architecture.
        TTSNative.setDefaultRate(0.45, true);
        TTSNative.setIgnoreSilentSwitch('ignore');
      } else {
        // Jest / non-native environment — use wrapper
        Tts.setDefaultRate(0.45);
        Tts.setIgnoreSilentSwitch('ignore');
      }
    } catch {
      // Non-critical — defaults are acceptable
    }
    this.initialized = true;
  }

  async speak(text: string, locale: string): Promise<void> {
    this.init();

    // Stop any in-progress utterance (single-playback constraint)
    ttsStop();

    // Set language
    Tts.setDefaultLanguage(locale);

    return new Promise<void>((resolve) => {
      const onFinish = () => {
        cleanup();
        resolve();
      };
      const onCancel = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        Tts.removeAllListeners('tts-finish');
        Tts.removeAllListeners('tts-cancel');
      };

      Tts.addEventListener('tts-finish', onFinish);
      Tts.addEventListener('tts-cancel', onCancel);

      Tts.speak(text);
    });
  }

  stop(): void {
    ttsStop();
  }

  destroy(): void {
    ttsStop();
    Tts.removeAllListeners('tts-finish');
    Tts.removeAllListeners('tts-cancel');
  }
}
