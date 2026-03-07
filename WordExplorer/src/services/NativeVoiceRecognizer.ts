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
 *
 * iOS audio-session note:
 *   After TTS playback (react-native-tts), iOS may still hold the audio
 *   session in Playback mode.  Voice.start() can silently fail — no events
 *   fire at all.  We detect this via onSpeechStart: if it never fires by
 *   the time stopListening() finalization fallback runs, we know the session
 *   was dead and fire a user-friendly error so the app doesn't hang.
 */
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';
import {SpeechRecognizer, SpeechRecognizerCallbacks} from './speechRecognizer';

export class NativeVoiceRecognizer implements SpeechRecognizer {
  private callbacks: SpeechRecognizerCallbacks | null = null;
  private gotResults = false;
  private sessionAlive = false;
  private speechEndTimer: ReturnType<typeof setTimeout> | null = null;
  private stopFinalizeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    Voice.onSpeechResults = this.handleResults;
    Voice.onSpeechError = this.handleError;
    Voice.onSpeechEnd = this.handleSpeechEnd;
    Voice.onSpeechStart = this.handleSpeechStart;
  }

  private handleSpeechStart = (): void => {
    this.sessionAlive = true;
  };

  private handleResults = (e: SpeechResultsEvent): void => {
    this.gotResults = true;
    this.clearSpeechEndTimer();
    this.clearStopFinalizeTimer();
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
    this.gotResults = true; // Prevent speechEnd fallback from double-firing
    this.clearSpeechEndTimer();
    this.clearStopFinalizeTimer();
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

  private handleSpeechEnd = (): void => {
    // If onSpeechResults or onSpeechError already fired, nothing to do.
    if (this.gotResults) {
      return;
    }
    // Wait briefly for a delayed onSpeechResults before firing fallback error.
    this.speechEndTimer = setTimeout(() => {
      if (!this.gotResults && this.callbacks) {
        this.callbacks.onError('No speech detected — please try again.');
        this.callbacks = null;
      }
    }, 500);
  };

  private clearSpeechEndTimer(): void {
    if (this.speechEndTimer) {
      clearTimeout(this.speechEndTimer);
      this.speechEndTimer = null;
    }
  }

  private clearStopFinalizeTimer(): void {
    if (this.stopFinalizeTimer) {
      clearTimeout(this.stopFinalizeTimer);
      this.stopFinalizeTimer = null;
    }
  }

  async startListening(
    locale: string,
    callbacks: SpeechRecognizerCallbacks,
  ): Promise<void> {
    this.callbacks = callbacks;
    this.gotResults = false;
    this.sessionAlive = false;
    this.clearSpeechEndTimer();
    this.clearStopFinalizeTimer();
    try {
      // Destroy any previous session first. This forces iOS to tear down the
      // AVAudioSession and re-establish it for recording, which is critical
      // after TTS playback has taken over the audio session.
      await Voice.destroy();
      this.registerHandlers();
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
    this.clearStopFinalizeTimer();

    // Some iOS runs never deliver onSpeechEnd/onSpeechError after stop()
    // (especially on the very first permission/session startup). Always
    // finalize with a fallback so the UI doesn't remain "transcribing".
    this.stopFinalizeTimer = setTimeout(() => {
      if (!this.gotResults && this.callbacks) {
        this.callbacks.onError(
          this.sessionAlive
            ? 'No speech detected — please try again.'
            : 'Microphone unavailable — please try again.',
        );
        this.callbacks = null;
      }
    }, 1500);
  }

  destroy(): void {
    this.callbacks = null;
    this.clearSpeechEndTimer();
    this.clearStopFinalizeTimer();
    Voice.destroy().catch(() => {});
    Voice.removeAllListeners();
  }
}
