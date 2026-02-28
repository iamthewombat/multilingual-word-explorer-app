/**
 * SpeechRecognizer — push-to-talk interface.
 *
 * All provider-specific code lives in an implementation file so the rest of
 * the app only depends on this interface.  Swap the concrete class (e.g. from
 * NativeVoiceRecognizer → ExpoSpeechRecognizer) without touching callers.
 */
export interface SpeechRecognizerCallbacks {
  /** Called with the final transcription text once recognition completes. */
  onResult: (text: string) => void;
  /** Called when recognition ends without a usable transcript (e.g. no speech,
   *  permission denied, network error).  `message` is human-readable. */
  onError: (message: string) => void;
}

export interface SpeechRecognizer {
  /**
   * Begin recording + streaming recognition.
   * Resolves once the session has started; rejects on startup failure.
   */
  startListening(
    locale: string,
    callbacks: SpeechRecognizerCallbacks,
  ): Promise<void>;

  /** Stop the active recording session.  onResult or onError fires shortly
   *  after this call as the engine finalises the transcript. */
  stopListening(): Promise<void>;

  /** Release native resources.  Call on component unmount. */
  destroy(): void;
}

/** BCP-47 locale codes for the three supported languages. */
export const SPEECH_LOCALE: Record<string, string> = {
  English: 'en-US',
  ไทย: 'th-TH',
  粵語: 'zh-Hant-HK', // Cantonese (Yue)
};
