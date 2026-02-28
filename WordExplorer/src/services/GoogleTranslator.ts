/**
 * GoogleTranslator
 *
 * Implements the Translator interface using Google Cloud Translation API v2
 * (the "Basic" tier — no authentication beyond an API key).
 *
 * Endpoint: https://translation.googleapis.com/language/translate/v2
 *
 * Language targets used:
 *   en    — English
 *   th    — Thai
 *   zh-TW — Traditional Chinese (used as the written Cantonese proxy;
 *            Google Translate v2 does not support the `yue` locale)
 *
 * Setup:
 *   1. Enable "Cloud Translation API" in Google Cloud Console.
 *   2. Create an API key restricted to that API.
 *   3. Paste the key into src/config/env.ts (gitignored).
 */
import {GOOGLE_TRANSLATE_API_KEY} from '../config/env';
import {Translator, TranslationResult} from './translator';

const TRANSLATE_URL =
  'https://translation.googleapis.com/language/translate/v2';

async function translateTo(text: string, target: string): Promise<string> {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    throw new Error(
      'GOOGLE_TRANSLATE_API_KEY is empty — add your key to src/config/env.ts.',
    );
  }

  const params = new URLSearchParams({
    q: text,
    target,
    key: GOOGLE_TRANSLATE_API_KEY,
    format: 'text', // plain text, not HTML-encoded
  });

  const response = await fetch(`${TRANSLATE_URL}?${params.toString()}`);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Translation API error ${response.status}: ${body}`);
  }

  const json = await response.json();
  const translated: string = json?.data?.translations?.[0]?.translatedText;

  if (!translated) {
    throw new Error('Translation API returned an unexpected response shape.');
  }

  return translated;
}

export class GoogleTranslator implements Translator {
  async translate(word: string): Promise<TranslationResult> {
    const [english, thai, cantonese] = await Promise.all([
      translateTo(word, 'en'),
      translateTo(word, 'th'),
      translateTo(word, 'zh-TW'),
    ]);
    return {english, thai, cantonese};
  }
}
