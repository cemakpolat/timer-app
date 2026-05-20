import mediaPolicyService from '../services/mediaPolicyService';

describe('mediaPolicyService', () => {
  const githubSource = {
    id: 'github-scenes',
    provider: 'github',
    manifestUrl: 'https://raw.githubusercontent.com/acme/media/main/manifest.json',
  };

  test('approves a valid remote image asset', () => {
    const result = mediaPolicyService.validateAsset({
      assetType: 'image',
      url: 'https://raw.githubusercontent.com/acme/media/main/images/desk.jpg',
      mimeType: 'image/jpeg',
      bytes: 1024,
      width: 1920,
      height: 1080,
    }, githubSource);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('rejects blocked image MIME types', () => {
    const result = mediaPolicyService.validateAsset({
      assetType: 'image',
      url: 'https://raw.githubusercontent.com/acme/media/main/images/unsafe.svg',
      mimeType: 'image/svg+xml',
      bytes: 1024,
    }, githubSource);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Remote image MIME type is blocked.');
  });

  test('rejects non-HTTPS video URLs', () => {
    const result = mediaPolicyService.validateAsset({
      assetType: 'video',
      url: 'http://cdn.example.com/video.mp4',
      mimeType: 'video/mp4',
      bytes: 1024,
    }, {
      id: 'cdn-videos',
      provider: 'generic-manifest',
      manifestUrl: 'https://cdn.example.com/manifest.json',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Remote media asset URLs must use HTTPS.');
  });

  test('rejects disallowed asset hostnames', () => {
    const result = mediaPolicyService.validateAsset({
      assetType: 'image',
      url: 'https://evil.example.com/desk.jpg',
      mimeType: 'image/jpeg',
      bytes: 1024,
    }, {
      id: 'cdn-images',
      provider: 'generic-manifest',
      manifestUrl: 'https://cdn.example.com/catalog/manifest.json',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Remote media asset hostname is not allowlisted.');
  });

  test('rejects oversized remote videos', () => {
    const result = mediaPolicyService.validateAsset({
      assetType: 'video',
      url: 'https://raw.githubusercontent.com/acme/media/main/videos/focus.mp4',
      mimeType: 'video/mp4',
      bytes: 130 * 1024 * 1024,
      width: 1920,
      height: 1080,
      duration: 45,
    }, githubSource);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Remote video exceeds the maximum allowed size.');
  });
});