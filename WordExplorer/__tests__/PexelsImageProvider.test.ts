/**
 * PexelsImageProvider unit tests.
 *
 * Mocks global.fetch and the PEXELS_API_KEY env var.
 */

// Mock env before importing provider
jest.mock('../src/config/env', () => ({
  PEXELS_API_KEY: 'test-pexels-key',
  GOOGLE_TRANSLATE_API_KEY: '',
}));

import {PexelsImageProvider} from '../src/services/PexelsImageProvider';

const provider = new PexelsImageProvider();

const mockFetch = jest.fn() as jest.Mock;
(global as any).fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('PexelsImageProvider', () => {
  it('constructs the correct Pexels API URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({photos: []}),
    });

    await provider.search('dog');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain('https://api.pexels.com/v1/search');
    expect(url).toContain('query=dog');
    expect(url).toContain('per_page=1');
    expect(url).toContain('orientation=landscape');

    const opts = mockFetch.mock.calls[0][1];
    expect(opts.headers.Authorization).toBe('test-pexels-key');
  });

  it('returns ImageResult when photos are found', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        photos: [
          {
            src: {medium: 'https://img.pexels.com/dog-medium.jpg', original: 'https://img.pexels.com/dog.jpg'},
            alt: 'A cute dog',
            photographer: 'Jane Doe',
          },
        ],
      }),
    });

    const result = await provider.search('dog');

    expect(result).toEqual({
      url: 'https://img.pexels.com/dog-medium.jpg',
      alt: 'A cute dog',
      photographer: 'Jane Doe',
    });
  });

  it('returns null when no photos are found', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({photos: []}),
    });

    const result = await provider.search('xyznonexistent');
    expect(result).toBeNull();
  });

  it('returns null on non-OK HTTP response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
    });

    const result = await provider.search('dog');
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network request failed'));

    const result = await provider.search('dog');
    expect(result).toBeNull();
  });

  it('uses alt text from query when photo.alt is missing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        photos: [
          {
            src: {medium: 'https://img.pexels.com/cat.jpg'},
            photographer: 'John',
          },
        ],
      }),
    });

    const result = await provider.search('cat');
    expect(result).toEqual({
      url: 'https://img.pexels.com/cat.jpg',
      alt: 'cat',
      photographer: 'John',
    });
  });
});

describe('PexelsImageProvider — missing API key', () => {
  it('throws when PEXELS_API_KEY is empty', async () => {
    // Re-mock with empty key
    jest.resetModules();
    jest.doMock('../src/config/env', () => ({
      PEXELS_API_KEY: '',
      GOOGLE_TRANSLATE_API_KEY: '',
    }));

    const {PexelsImageProvider: FreshProvider} = require('../src/services/PexelsImageProvider');
    const noKeyProvider = new FreshProvider();

    await expect(noKeyProvider.search('dog')).rejects.toThrow(
      'PEXELS_API_KEY is empty',
    );
  });
});
