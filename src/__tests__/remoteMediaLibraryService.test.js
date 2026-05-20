import MediaProviderFactory from '../services/mediaProviders/MediaProviderFactory';
import { loadRemoteMediaAssets, previewRemoteMediaSource } from '../services/remoteMediaLibraryService';

describe('remoteMediaLibraryService', () => {
  afterEach(() => {
    MediaProviderFactory.resetProviders();
  });

  test('loads only approved assets for the requested asset type', async () => {
    const listAssets = jest.fn().mockResolvedValue([
      {
        id: 'img-ok',
        assetType: 'image',
        url: 'https://cdn.example.com/images/focus.jpg',
        mimeType: 'image/jpeg',
        bytes: 1024,
      },
      {
        id: 'img-blocked',
        assetType: 'image',
        url: 'https://cdn.example.com/images/focus.svg',
        mimeType: 'image/svg+xml',
        bytes: 1024,
      },
      {
        id: 'video-ignored',
        assetType: 'video',
        url: 'https://cdn.example.com/videos/focus.mp4',
        mimeType: 'video/mp4',
        bytes: 1024,
      },
    ]);

    MediaProviderFactory.registerProvider('test-provider', { listAssets });

    const { remoteAssets, sourceStatuses } = await loadRemoteMediaAssets([
      {
        id: 'test-source',
        name: 'Test Source',
        provider: 'test-provider',
        manifestUrl: 'https://cdn.example.com/catalog/manifest.json',
        assetTypes: ['image'],
      },
    ], 'image');

    expect(listAssets).toHaveBeenCalledTimes(1);
    expect(remoteAssets).toHaveLength(1);
    expect(remoteAssets[0]).toMatchObject({
      id: 'img-ok',
      isRemote: true,
      sourceId: 'test-source',
      sourceName: 'Test Source',
    });
    expect(sourceStatuses[0]).toMatchObject({
      sourceId: 'test-source',
      status: 'ready',
      approvedCount: 1,
      rejectedCount: 1,
    });
  });

  test('previews approved and blocked assets before saving a source', async () => {
    const listAssets = jest.fn().mockResolvedValue([
      {
        id: 'img-ok',
        assetType: 'image',
        url: 'https://cdn.example.com/images/focus.jpg',
        mimeType: 'image/jpeg',
        bytes: 1024,
      },
      {
        id: 'img-blocked',
        assetType: 'image',
        url: 'https://cdn.example.com/images/focus.svg',
        mimeType: 'image/svg+xml',
        bytes: 1024,
      },
    ]);

    MediaProviderFactory.registerProvider('preview-provider', { listAssets });

    const result = await previewRemoteMediaSource({
      provider: 'preview-provider',
      name: 'Preview Source',
      manifestUrl: 'https://cdn.example.com/catalog/manifest.json',
    }, 'image');

    expect(result.status).toBe('ready');
    expect(result.approvedAssets).toHaveLength(1);
    expect(result.rejectedAssets).toHaveLength(1);
    expect(result.approvedAssets[0]).toMatchObject({
      id: 'img-ok',
      sourceName: 'Preview Source',
      isRemote: true,
    });
    expect(result.rejectedAssets[0].policyErrors).toContain('Remote image MIME type is blocked.');
  });
});