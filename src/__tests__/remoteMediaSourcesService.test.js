import {
  addRemoteMediaSource,
  deleteRemoteMediaSource,
  getRemoteMediaSources,
} from '../services/remoteMediaSourcesService';

describe('remoteMediaSourcesService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('adds and loads a normalized manifest source', () => {
    const source = addRemoteMediaSource({
      provider: 'generic-manifest',
      name: 'Focus CDN',
      manifestUrl: 'https://cdn.example.com/catalog/manifest.json',
      assetTypes: ['image'],
    });

    const storedSources = getRemoteMediaSources();
    expect(storedSources).toHaveLength(1);
    expect(storedSources[0]).toMatchObject({
      id: source.id,
      provider: 'generic-manifest',
      assetTypes: ['image'],
    });
    expect(storedSources[0].allowedHostnames).toContain('cdn.example.com');
  });

  test('removes a stored source', () => {
    const source = addRemoteMediaSource({
      provider: 'github',
      name: 'GitHub Library',
      owner: 'acme',
      repo: 'media-library',
      path: 'catalog/manifest.json',
      assetTypes: ['video'],
    });

    deleteRemoteMediaSource(source.id);

    expect(getRemoteMediaSources()).toEqual([]);
  });
});