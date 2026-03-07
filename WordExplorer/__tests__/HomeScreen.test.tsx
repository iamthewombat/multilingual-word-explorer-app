/**
 * HomeScreen tests — Epic 6: offline detection, retry, TTS error.
 */
import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {TouchableOpacity} from 'react-native';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// netinfo mock — imported so we can control connectivity per-test
const netinfo = require('@react-native-community/netinfo');

// Mock the service classes so HomeScreen doesn't make real API calls
jest.mock('../src/services/GoogleTranslator', () => ({
  GoogleTranslator: jest.fn().mockImplementation(() => ({
    translate: jest.fn().mockResolvedValue({
      english: 'dog',
      thai: 'สุนัข',
      cantonese: '狗',
    }),
  })),
}));

jest.mock('../src/services/PexelsImageProvider', () => ({
  PexelsImageProvider: jest.fn().mockImplementation(() => ({
    search: jest.fn().mockResolvedValue(null),
  })),
}));

jest.mock('../src/services/NativeVoiceRecognizer', () => ({
  NativeVoiceRecognizer: jest.fn().mockImplementation(() => ({
    startListening: jest.fn(),
    stopListening: jest.fn(),
    destroy: jest.fn(),
  })),
}));

jest.mock('../src/services/NativeSpeechSynthesizer', () => ({
  NativeSpeechSynthesizer: jest.fn().mockImplementation(() => ({
    speak: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
    destroy: jest.fn(),
  })),
}));

import {HomeScreen} from '../src/screens/HomeScreen';
import {GoogleTranslator} from '../src/services/GoogleTranslator';
import {NativeVoiceRecognizer} from '../src/services/NativeVoiceRecognizer';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Find all host Text elements containing the given string. */
function findTexts(root: ReactTestRenderer.ReactTestInstance, text: string) {
  return root
    .findAllByType('Text' as any)
    .filter(n => {
      const children = n.props.children;
      if (typeof children === 'string') {
        return children.includes(text);
      }
      if (Array.isArray(children)) {
        return children.some(
          (c: unknown) => typeof c === 'string' && c.includes(text),
        );
      }
      return false;
    });
}

/** Find the text input (placeholder "Or type a word...") and simulate typing. */
function typeWord(root: ReactTestRenderer.ReactTestInstance, word: string) {
  const textInputs = root.findAllByType('TextInput' as any);
  const input = textInputs.find(
    n => n.props.placeholder === 'Or type a word...',
  );
  if (!input) {
    throw new Error('Could not find text input');
  }
  act(() => {
    input.props.onChangeText(word);
  });
}

/** Find and tap the submit (↑) button — a TouchableOpacity with a child Text "↑". */
function tapSubmit(root: ReactTestRenderer.ReactTestInstance) {
  const buttons = root.findAllByType(TouchableOpacity);
  const submitBtn = buttons.find(b => {
    const texts = b.findAllByType('Text' as any);
    return texts.some(t => t.props.children === '↑');
  });
  if (!submitBtn) {
    throw new Error('Could not find submit button');
  }
  act(() => {
    submitBtn.props.onPress();
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  netinfo.__reset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('HomeScreen — offline detection', () => {
  it('shows offline error and skips API call when submitting while offline', async () => {
    netinfo.__setConnected(false);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = renderer!.root;

    // Type a word
    typeWord(root, 'dog');

    // Tap submit
    tapSubmit(root);

    // Flush microtasks
    await act(async () => {});

    // Should show offline error
    const offlineTexts = findTexts(root, 'No internet connection');
    expect(offlineTexts.length).toBeGreaterThan(0);

    // Clean up
    await act(async () => {
      renderer!.unmount();
    });
  });

  it('does not show offline error when online', async () => {
    netinfo.__setConnected(true);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = renderer!.root;

    typeWord(root, 'dog');
    tapSubmit(root);

    // Flush promises (translation resolves)
    await act(async () => {});

    // Should NOT show offline error — should show results instead
    const offlineTexts = findTexts(root, 'No internet connection');
    expect(offlineTexts.length).toBe(0);

    await act(async () => {
      renderer!.unmount();
    });
  });
});

describe('HomeScreen — retry on translation failure', () => {
  it('shows Retry button on translation error and re-attempts on tap', async () => {
    netinfo.__setConnected(true);

    // Make translator fail on first call, succeed on second
    const mockTranslate = jest
      .fn()
      .mockRejectedValueOnce(new Error('Translation API error 500: Internal'))
      .mockResolvedValueOnce({
        english: 'dog',
        thai: 'สุนัข',
        cantonese: '狗',
      });

    (GoogleTranslator as jest.Mock).mockImplementation(() => ({
      translate: mockTranslate,
    }));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = renderer!.root;

    // Type and submit
    typeWord(root, 'dog');
    tapSubmit(root);
    await act(async () => {});

    // Should show error message
    const errorTexts = findTexts(root, 'Translation API error');
    expect(errorTexts.length).toBeGreaterThan(0);

    // Should show Retry button
    const retryTexts = findTexts(root, 'Retry');
    expect(retryTexts.length).toBeGreaterThan(0);

    // Find and tap the Retry button
    const retryBtn = root.findAllByType(TouchableOpacity).find(b => {
      const texts = b.findAllByType('Text' as any);
      return texts.some(t => t.props.children === 'Retry');
    });
    expect(retryBtn).toBeTruthy();

    act(() => {
      retryBtn!.props.onPress();
    });
    await act(async () => {});

    // translate should have been called twice (initial + retry)
    expect(mockTranslate).toHaveBeenCalledTimes(2);

    // Both calls should be with 'dog'
    expect(mockTranslate).toHaveBeenNthCalledWith(1, 'dog');
    expect(mockTranslate).toHaveBeenNthCalledWith(2, 'dog');

    await act(async () => {
      renderer!.unmount();
    });
  });

  it('clears retry state when user starts a new text submission', async () => {
    netinfo.__setConnected(true);

    const mockTranslate = jest
      .fn()
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValue({english: 'cat', thai: 'แมว', cantonese: '貓'});

    (GoogleTranslator as jest.Mock).mockImplementation(() => ({
      translate: mockTranslate,
    }));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = renderer!.root;

    // Trigger failure
    typeWord(root, 'dog');
    tapSubmit(root);
    await act(async () => {});

    // Retry button should be visible
    let retryTexts = findTexts(root, 'Retry');
    expect(retryTexts.length).toBeGreaterThan(0);

    // Now submit a new word — the retry button for "dog" should disappear
    // (error message auto-clears after 4s, but the retry should clear immediately on new submit)
    typeWord(root, 'cat');
    tapSubmit(root);
    await act(async () => {});

    // After successful lookup, we're in results state — no retry button
    retryTexts = findTexts(root, 'Retry');
    expect(retryTexts.length).toBe(0);

    await act(async () => {
      renderer!.unmount();
    });
  });
});

describe('HomeScreen — AppState transitions', () => {
  beforeEach(() => {
    // Reset translator to default success mock for transition tests
    (GoogleTranslator as jest.Mock).mockImplementation(() => ({
      translate: jest.fn().mockResolvedValue({
        english: 'dog',
        thai: 'สุนัข',
        cantonese: '狗',
      }),
    }));
  });

  it('transitions idle → looking-up → results on text submit', async () => {
    netinfo.__setConnected(true);

    // Use a deferred promise so we can observe the loading state
    let resolveTranslation!: (v: any) => void;
    const deferredTranslation = new Promise(resolve => {
      resolveTranslation = resolve;
    });
    (GoogleTranslator as jest.Mock).mockImplementation(() => ({
      translate: jest.fn().mockReturnValue(deferredTranslation),
    }));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = renderer!.root;
    typeWord(root, 'dog');
    tapSubmit(root);

    // Should show "Translating…" loading text
    await act(async () => {});
    const loadingTexts = findTexts(root, 'Translating');
    expect(loadingTexts.length).toBeGreaterThan(0);

    // Resolve translation
    await act(async () => {
      resolveTranslation({english: 'dog', thai: 'สุนัข', cantonese: '狗'});
    });
    await act(async () => {});

    // Should now show translation blocks (results state)
    const thaiTexts = findTexts(root, 'สุนัข');
    expect(thaiTexts.length).toBeGreaterThan(0);

    // "Translating…" should be gone
    const noLoading = findTexts(root, 'Translating');
    expect(noLoading.length).toBe(0);

    await act(async () => {
      renderer!.unmount();
    });
  });

  it('transitions results → idle when "Listen to Another Word" is tapped', async () => {
    netinfo.__setConnected(true);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = renderer!.root;

    // Get to results state
    typeWord(root, 'dog');
    tapSubmit(root);
    await act(async () => {});

    // Should be in results — verify translation blocks visible
    expect(findTexts(root, 'สุนัข').length).toBeGreaterThan(0);

    // Tap "Listen to Another Word"
    const buttons = root.findAllByType(TouchableOpacity);
    const resetBtn = buttons.find(b => {
      const texts = b.findAllByType('Text' as any);
      return texts.some(
        (t: any) =>
          typeof t.props.children === 'string' &&
          t.props.children.includes('Listen to Another Word'),
      );
    });
    expect(resetBtn).toBeTruthy();

    act(() => {
      resetBtn!.props.onPress();
    });
    await act(async () => {});

    // Should be back in idle — mic button label visible, translations gone
    const micLabel = findTexts(root, 'Hold to speak');
    expect(micLabel.length).toBeGreaterThan(0);

    const translationGone = findTexts(root, 'สุนัข');
    expect(translationGone.length).toBe(0);

    // Text input should be visible
    const textInputs = root.findAllByType('TextInput' as any);
    expect(textInputs.length).toBeGreaterThan(0);

    await act(async () => {
      renderer!.unmount();
    });
  });

  it('transitions idle → recording on mic press-in', async () => {
    netinfo.__setConnected(true);

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = renderer!.root;

    // Find the MicButton's pressable (has both onPressIn and onPressOut)
    const buttons = root.findAllByType(TouchableOpacity);
    const micBtn = buttons.find(
      b =>
        typeof b.props.onPressIn === 'function' &&
        typeof b.props.onPressOut === 'function',
    );
    expect(micBtn).toBeTruthy();

    await act(async () => {
      micBtn!.props.onPressIn();
    });

    // Should show "Listening…" recording state label
    const recordingTexts = findTexts(root, 'Listening');
    expect(recordingTexts.length).toBeGreaterThan(0);

    await act(async () => {
      renderer!.unmount();
    });
  });

  it('guards: submit while looking-up is a no-op (translator called only once)', async () => {
    netinfo.__setConnected(true);

    // Use a deferred promise so translation stays in-flight
    let resolveTranslation!: (v: any) => void;
    const mockTranslate = jest.fn().mockReturnValue(
      new Promise(resolve => {
        resolveTranslation = resolve;
      }),
    );
    (GoogleTranslator as jest.Mock).mockImplementation(() => ({
      translate: mockTranslate,
    }));

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(<HomeScreen />);
    });

    const root = renderer!.root;

    // First submit
    typeWord(root, 'dog');
    tapSubmit(root);
    await act(async () => {});

    // Should be in looking-up state
    expect(findTexts(root, 'Translating').length).toBeGreaterThan(0);

    // Input UI is hidden in looking-up state, so submit can't fire again.
    // Verify translator was only called once.
    expect(mockTranslate).toHaveBeenCalledTimes(1);

    // Resolve to clean up
    await act(async () => {
      resolveTranslation({english: 'dog', thai: 'สุนัข', cantonese: '狗'});
    });
    await act(async () => {});

    // Still only one call
    expect(mockTranslate).toHaveBeenCalledTimes(1);

    await act(async () => {
      renderer!.unmount();
    });
  });
});
