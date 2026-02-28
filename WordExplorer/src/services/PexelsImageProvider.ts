/**
 * PexelsImageProvider
 *
 * Implements the ImageProvider interface using the Pexels API.
 *
 * Endpoint: https://api.pexels.com/v1/search
 *
 * Setup:
 *   1. Create a free account at https://www.pexels.com/api/
 *   2. Copy your API key.
 *   3. Paste it into src/config/env.ts (gitignored).
 */
import {PEXELS_API_KEY} from '../config/env';
import {ImageProvider, ImageResult} from './imageProvider';

const PEXELS_URL = 'https://api.pexels.com/v1/search';

export class PexelsImageProvider implements ImageProvider {
  async search(query: string): Promise<ImageResult | null> {
    if (!PEXELS_API_KEY) {
      throw new Error(
        'PEXELS_API_KEY is empty — add your key to src/config/env.ts.',
      );
    }

    try {
      const params = new URLSearchParams({
        query,
        per_page: '1',
        orientation: 'landscape',
      });

      const response = await fetch(`${PEXELS_URL}?${params.toString()}`, {
        headers: {Authorization: PEXELS_API_KEY},
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      const photo = json?.photos?.[0];

      if (!photo) {
        return null;
      }

      return {
        url: photo.src?.medium ?? photo.src?.original,
        alt: photo.alt ?? query,
        photographer: photo.photographer ?? '',
      };
    } catch {
      // Image is non-critical — return null on any network error
      return null;
    }
  }
}
