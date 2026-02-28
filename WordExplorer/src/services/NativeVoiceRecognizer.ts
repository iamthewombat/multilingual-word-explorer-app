/**
 * NativeVoiceRecognizer
 *
 * Implements SpeechRecognizer using @react-native-voice/voice, which bridges
 * to the iOS Speech framework (SFSpeechRecognizer + AVAudioEngine).
 *
 * To swap this implementation out (e.g. for expo-speech-recognition), create
 * a new class that satisfies the SpeechRecognizer interface and update the
 * import in HomeScreen.tsx.
 *
 * Requires (one-time native setup):
 *   cd ios && pod install
 *   Add to Info.plist:
 *     NSMicrophoneUsageDescription
 *     NSSpeechRecognitionUsageDescription
 */
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
import {SpeechRecognizer, SpeechRecognizerCallbacks} from './speechRecognizer';

export class NativeVoiceRecognizer implements SpeechRecognizer {
  private callbacks: SpeechRecognizerCallbacks | null = null;

  constructor() {
    Voice.onSpeechResults = this.handleResults;
    Voice.onSpeechError = this.handleError;
  }

  private handleResults = (e: SpeechResultsEvent): void => {
    // Take the top hypothesis.
    const text = (e.value ?? [])[0]?.trim() ?? '';
    if (text) {
      this.callbacks?.onResult(text);
    } else {
      this.callbacks?.onError('No speech detected — please try again.');
    }
    this.callbacks = null;
  };

  private handleError = (e: SpeechErrorEvent): void => {
    const code = e.error?.code ?? '';
    // Code '5' = no speech detected; '203' = recognition request cancelled.
    // All other codes surface a generic message — raw engine messages are not
    // meaningful to end users.
    const message =
      code === '5' || code === '203'
        ? 'No speech detected — please try again.'
        : 'Speech recognition error — please try again.';
    this.callbacks?.onError(message);
    this.callbacks = null;
  };

  async startListening(
    locale: string,
    callbacks: SpeechRecognizerCallbacks,
  ): Promise<void> {
    this.callbacks = callbacks;
    try {
      await Voice.start(locale);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to start microphone.';
      callbacks.onError(
        message.toLowerCase().includes('permission')
          ? 'Microphone permission denied. Enable it in Settings → Privacy → Microphone.'
          : message,
      );
      this.callbacks = null;
    }
  }

  async stopListening(): Promise<void> {
    try {
      await Voice.stop();
    } catch {
      // stop() can throw if the session already ended; safe to ignore.
    }
  }

  destroy(): void {
    this.callbacks = null;
    Voice.destroy().catch(() => {});
    Voice.removeAllListeners();
  }
}
