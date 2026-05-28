import {
  addRemoteMediaSource,
  createLocalFolderSource,
  deleteRemoteMediaSource,
  getRemoteMediaSources,
  normalizeRemoteMediaSource,
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

  test('normalizes local-folder sources for browser-picked music libraries', () => {
    const source = normalizeRemoteMediaSource({
      provider: 'local-folder',
      name: 'Desk Music',
      directoryHandleKey: 'music-folder-1',
      directoryName: 'Music',
      assetTypes: ['audio'],
    });

    expect(source).toMatchObject({
      provider: 'local-folder',
      name: 'Desk Music',
      directoryHandleKey: 'music-folder-1',
      directoryName: 'Music',
      assetTypes: ['audio'],
    });
    expect(source.allowedHostnames).toEqual([]);
  });

  test('creates a local-folder source from a picked directory handle', () => {
    const source = createLocalFolderSource({ name: 'Desk Audio' }, ['audio'], {
      name: 'Desk Audio',
    });

    expect(source).toMatchObject({
      provider: 'local-folder',
      directoryName: 'Desk Audio',
      name: 'Desk Audio',
      assetTypes: ['audio'],
    });
    expect(source.directoryHandleKey).toBe(source.id);
  });
});