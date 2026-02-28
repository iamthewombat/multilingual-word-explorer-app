import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
  StyleSheet,
  Alert,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {Header} from '../components/Header';
import {LanguageChips, Language} from '../components/LanguageChips';
import {MicButton, MicState} from '../components/MicButton';
import {TextInputWithSubmit} from '../components/TextInputWithSubmit';
import {WordSummaryCard} from '../components/WordSummaryCard';
import {TranslationBlock} from '../components/TranslationBlock';
import {SettingsButton} from '../components/SettingsButton';
import {BG_COLOR, GRADIENT_COLORS} from '../theme/colors';
import {NativeVoiceRecognizer} from '../services/NativeVoiceRecognizer';
import {SpeechRecognizer, SPEECH_LOCALE} from '../services/speechRecognizer';
import {GoogleTranslator} from '../services/GoogleTranslator';
import {Translator, TranslationResult} from '../services/translator';
import {PexelsImageProvider} from '../services/PexelsImageProvider';
import {ImageProvider} from '../services/imageProvider';
import {NativeSpeechSynthesizer} from '../services/NativeSpeechSynthesizer';
import {SpeechSynthesizer, TTS_LOCALE} from '../services/speechSynthesizer';

// ─── App state ────────────────────────────────────────────────────────────────

type AppState =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'looking-up'
  | 'results';

// ─── Component ────────────────────────────────────────────────────────────────

export function HomeScreen(): React.JSX.Element {
  const [appState, setAppState] = useState<AppState>('idle');
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const [showSettings, setShowSettings] = useState(false);
  const [disambiguate, setDisambiguate] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [translationResult, setTranslationResult] =
    useState<TranslationResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [playingLanguage, setPlayingLanguage] = useState<string | null>(null);

  const recognizerRef = useRef<SpeechRecognizer>(new NativeVoiceRecognizer());
  const translatorRef = useRef<Translator>(new GoogleTranslator());
  const imageProviderRef = useRef<ImageProvider>(new PexelsImageProvider());
  const synthesizerRef = useRef<SpeechSynthesizer>(
    new NativeSpeechSynthesizer(),
  );
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasResults = appState === 'results';
  const isLookingUp = appState === 'looking-up';

  // ── Helpers ────────────────────────────────────────────────────────────────

  const showError = useCallback((msg: string) => {
    setErrorMessage(msg);
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    errorTimerRef.current = setTimeout(() => setErrorMessage(null), 4000);
  }, []);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      recognizerRef.current.destroy();
      synthesizerRef.current.destroy();
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  // ── Mic handlers ───────────────────────────────────────────────────────────

  const handleMicPressIn = useCallback(async () => {
    if (appState !== 'idle') {
      return;
    }
    Vibration.vibrate(30);
    setAppState('recording');
    const locale = SPEECH_LOCALE[selectedLanguage] ?? 'en-US';

    await recognizerRef.current.startListening(locale, {
      onResult: (text: string) => {
        setInputText(text);
        setAppState('idle');
      },
      onError: (message: string) => {
        if (message.toLowerCase().includes('permission')) {
          Alert.alert('Microphone Access Required', message, [{text: 'OK'}]);
        } else {
          showError(message);
        }
        setAppState('idle');
      },
    });
  }, [appState, selectedLanguage, showError]);

  const handleMicPressOut = useCallback(async () => {
    if (appState !== 'recording') {
      return;
    }
    setAppState('transcribing');
    await recognizerRef.current.stopListening();
  }, [appState]);

  // ── Lookup ─────────────────────────────────────────────────────────────────

  const handleLookup = useCallback(async () => {
    const word = inputText.trim();
    if (!word) {
      return;
    }
    setAppState('looking-up');
    setImageUrl(null);

    const [translationOutcome, imageOutcome] = await Promise.allSettled([
      translatorRef.current.translate(word),
      imageProviderRef.current.search(word),
    ]);

    // Translation is critical — fail on error
    if (translationOutcome.status === 'rejected') {
      const reason = translationOutcome.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : 'Translation failed. Please try again.';
      showError(message);
      setAppState('idle');
      return;
    }

    setTranslationResult(translationOutcome.value);

    // Image is non-critical — use result if available, ignore failures
    if (imageOutcome.status === 'fulfilled' && imageOutcome.value) {
      setImageUrl(imageOutcome.value.url);
    }

    setAppState('results');
  }, [inputText, showError]);

  const handleStartOver = useCallback(() => {
    synthesizerRef.current.stop();
    setPlayingLanguage(null);
    setAppState('idle');
    setInputText('');
    setTranslationResult(null);
    setImageUrl(null);
  }, []);

  const handlePlay = useCallback(
    async (language: string, text: string) => {
      // If already playing this language, stop it (toggle off)
      if (playingLanguage === language) {
        synthesizerRef.current.stop();
        setPlayingLanguage(null);
        return;
      }

      const locale = TTS_LOCALE[language] ?? 'en-US';
      setPlayingLanguage(language);

      try {
        await synthesizerRef.current.speak(text, locale);
      } catch {
        // TTS failure is non-critical — just clear the playing state
      }

      setPlayingLanguage(null);
    },
    [playingLanguage],
  );

  // ── Derived ────────────────────────────────────────────────────────────────

  const micState: MicState =
    appState === 'recording'
      ? 'recording'
      : appState === 'transcribing'
      ? 'transcribing'
      : 'idle';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        {hasResults || isLookingUp ? (
          /* ── Results / loading state ───────────────────────────────────── */
          <>
            <WordSummaryCard word={inputText} imageUrl={imageUrl} />

            {isLookingUp ? (
              /* Loading indicator while the API call is in flight */
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={GRADIENT_COLORS[0]} />
                <Text style={styles.loadingText}>Translating…</Text>
              </View>
            ) : (
              /* Real translations */
              <>
                <TranslationBlock
                  language="English"
                  word={translationResult?.english ?? ''}
                  isPlaying={playingLanguage === 'English'}
                  onPlay={() =>
                    handlePlay('English', translationResult?.english ?? '')
                  }
                />
                <TranslationBlock
                  language="Thai"
                  word={translationResult?.thai ?? ''}
                  isPlaying={playingLanguage === 'Thai'}
                  onPlay={() =>
                    handlePlay('Thai', translationResult?.thai ?? '')
                  }
                />
                <TranslationBlock
                  language="Cantonese"
                  word={translationResult?.cantonese ?? ''}
                  isPlaying={playingLanguage === 'Cantonese'}
                  onPlay={() =>
                    handlePlay('Cantonese', translationResult?.cantonese ?? '')
                  }
                />

                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={handleStartOver}
                  activeOpacity={0.85}>
                  <LinearGradient
                    colors={[...GRADIENT_COLORS]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.resetText}>Listen to Another Word</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          /* ── Input state ──────────────────────────────────────────────── */
          <>
            <LanguageChips
              selected={selectedLanguage}
              onSelect={setSelectedLanguage}
            />

            <MicButton
              micState={micState}
              onPressIn={handleMicPressIn}
              onPressOut={handleMicPressOut}
            />

            <TextInputWithSubmit
              value={inputText}
              onChangeText={setInputText}
              onSubmit={handleLookup}
            />

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </>
        )}
      </ScrollView>

      {/* Floating settings button — always visible */}
      <SettingsButton onPress={() => setShowSettings(true)} />

      {/* ── Settings modal ──────────────────────────────────────────────── */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Settings</Text>

            <Text style={styles.settingLabel}>
              For words with multiple meanings:
            </Text>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setDisambiguate(true)}>
              <Text style={styles.optionText}>
                {disambiguate ? '● ' : '○ '}
                Prompt for clarification (Default)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setDisambiguate(false)}>
              <Text style={styles.optionText}>
                {!disambiguate ? '● ' : '○ '}
                Show first result
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setShowSettings(false)}>
                <Text style={styles.modalBtnText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={() => setShowSettings(false)}>
                <LinearGradient
                  colors={[...GRADIENT_COLORS]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.modalBtnPrimaryText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  /* Loading */
  loadingContainer: {
    alignItems: 'center',
    marginTop: 48,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },

  /* Error message */
  errorText: {
    marginHorizontal: 24,
    marginTop: 8,
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
  },

  /* Reset button */
  resetBtn: {
    marginHorizontal: 24,
    marginTop: 28,
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* Settings modal */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '86%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  option: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalBtnText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalBtnPrimary: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPrimaryText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
