import GenericManifestMediaProvider from '../services/mediaProviders/GenericManifestMediaProvider';

function createResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

describe('GenericManifestMediaProvider', () => {
  test('parses images and videos from a manifest with relative URLs', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(createResponse({
      images: [
        {
          name: 'Desk',
          url: 'images/desk.jpg',
          mimeType: 'image/jpeg',
          bytes: 2048,
          width: 1280,
          height: 720,
        },
      ],
      videos: [
        {
          name: 'Loop',
          url: 'videos/focus.mp4',
          posterUrl: 'posters/focus.jpg',
          mimeType: 'video/mp4',
          bytes: 4096,
          duration: 30,
        },
      ],
    }));

    const provider = new GenericManifestMediaProvider(fetchImpl);
    const assets = await provider.listAssets({
      id: 'focus-library',
      provider: 'generic-manifest',
      manifestUrl: 'https://cdn.example.com/catalog/manifest.json',
    });

    expect(fetchImpl).toHaveBeenCalledWith('https://cdn.example.com/catalog/manifest.json', {
      headers: { Accept: 'application/json' },
    });
    expect(assets).toHaveLength(2);
    expect(assets[0]).toMatchObject({
      sourceId: 'focus-library',
      provider: 'generic-manifest',
      assetType: 'image',
      name: 'Desk',
      url: 'https://cdn.example.com/catalog/images/desk.jpg',
      mimeType: 'image/jpeg',
      bytes: 2048,
      cachePolicy: 'stream-on-demand',
    });
    expect(assets[1]).toMatchObject({
      assetType: 'video',
      url: 'https://cdn.example.com/catalog/videos/focus.mp4',
      posterUrl: 'https://cdn.example.com/catalog/posters/focus.jpg',
      mimeType: 'video/mp4',
    });
  });

  test('accepts a flat assets manifest', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(createResponse({
      assets: [
        {
          id: 'forest-loop',
          type: 'video',
          url: 'https://cdn.example.com/videos/forest.webm',
          mimeType: 'video/webm',
          bytes: 8192,
        },
      ],
    }));

    const provider = new GenericManifestMediaProvider(fetchImpl);
    const assets = await provider.listAssets({
      id: 'forest-library',
      provider: 'generic-manifest',
      manifestUrl: 'https://cdn.example.com/catalog/manifest.json',
    });

    expect(assets).toHaveLength(1);
    expect(assets[0].id).toBe('forest-loop');
    expect(assets[0].assetType).toBe('video');
  });

  test('throws when the manifest has no asset collections', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(createResponse({ version: 1 }));
    const provider = new GenericManifestMediaProvider(fetchImpl);

    await expect(provider.listAssets({
      id: 'empty-library',
      provider: 'generic-manifest',
      manifestUrl: 'https://cdn.example.com/catalog/manifest.json',
    })).rejects.toThrow('Remote media manifest must define assets, images, or videos.');
  });

  test('parses audio collections from a manifest', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(createResponse({
      audios: [
        {
          name: 'Focus Loop',
          url: 'audio/focus.mp3',
          bytes: 1024,
          duration: 180,
        },
      ],
    }));

    const provider = new GenericManifestMediaProvider(fetchImpl);
    const assets = await provider.listAssets({
      id: 'audio-library',
      provider: 'generic-manifest',
      manifestUrl: 'https://cdn.example.com/catalog/manifest.json',
    });

    expect(assets).toHaveLength(1);
    expect(assets[0]).toMatchObject({
      sourceId: 'audio-library',
      assetType: 'audio',
      url: 'https://cdn.example.com/catalog/audio/focus.mp3',
      mimeType: 'audio/mpeg',
      duration: 180,
    });
  });
});