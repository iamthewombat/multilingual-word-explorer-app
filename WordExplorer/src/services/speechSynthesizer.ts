/**
 * SpeechSynthesizer interface.
 *
 * Speaks text aloud in a given locale. Only one utterance plays at a time —
 * calling speak() while audio is playing stops the current utterance first.
 *
 * Swap the implementation by changing the import in HomeScreen.tsx.
 */

export const TTS_LOCALE: Record<string, string> = {
  English: 'en-US',
  Thai: 'th-TH',
  Cantonese: 'zh-HK',
};

export interface SpeechSynthesizer {
  /** Speak the given text. Stops any in-progress speech first. */
  speak(text: string, locale: string): Promise<void>;

  /** Stop any in-progress speech immediately. */
  stop(): void;

  /** Clean up resources. */
  destroy(): void;
}
