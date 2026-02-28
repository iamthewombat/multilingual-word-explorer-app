/**
 * ImageProvider interface.
 *
 * Searches for a single image matching a word query.
 * Returns null when no image is available (graceful degradation).
 *
 * Swap the implementation by changing the import in HomeScreen.tsx.
 */

export interface ImageResult {
  url: string;
  alt: string;
  photographer: string;
}

export interface ImageProvider {
  search(query: string): Promise<ImageResult | null>;
}
