/**
 * Translator interface.
 *
 * Takes a single word (in any language) and returns translations in
 * English, Thai, and Cantonese (written as Traditional Chinese).
 *
 * Swap the implementation by changing the import in HomeScreen.tsx.
 */

export interface TranslationResult {
  english: string;
  thai: string;
  cantonese: string;
}

export interface Translator {
  translate(word: string): Promise<TranslationResult>;
}
