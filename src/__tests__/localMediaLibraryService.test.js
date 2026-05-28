jest.mock('../services/indexeddb', () => {
  const store = new Map();

  return {
    saveFileBlob: jest.fn(async (id, value) => {
      store.set(id, value);
      return value;
    }),
    getFileBlob: jest.fn(async (id) => store.get(id) || null),
    deleteFileBlob: jest.fn(async (id) => {
      store.delete(id);
      return undefined;
    }),
  };
});

import {
  deleteLocalMediaSourceHandle,
  getLocalMediaSourceHandle,
  listLocalMediaAssets,
  resolveLocalMediaFile,
  saveLocalMediaSourceHandle,
} from '../services/localMediaLibraryService';

function createFileHandle(file) {
  return {
    kind: 'file',
    name: file.name,
    getFile: jest.fn().mockResolvedValue(file),
  };
}

function createDirectoryHandle(name, childEntries = {}) {
  const entries = { ...childEntries };

  return {
    kind: 'directory',
    name,
    queryPermission: jest.fn().mockResolvedValue('granted'),
    requestPermission: jest.fn().mockResolvedValue('granted'),
    async *entries() {
      for (const [entryName, entry] of Object.entries(entries)) {
        yield [entryName, entry];
      }
    },
    getDirectoryHandle: jest.fn(async (entryName) => entries[entryName]),
    getFileHandle: jest.fn(async (entryName) => entries[entryName]),
  };
}

describe('localMediaLibraryService', () => {
  beforeEach(async () => {
    await deleteLocalMediaSourceHandle('music-folder');
  });

  test('persists and reloads a local folder handle by key', async () => {
    const handle = createDirectoryHandle('Music');

    await saveLocalMediaSourceHandle('music-folder', handle);
    const restoredHandle = await getLocalMediaSourceHandle('music-folder');

    expect(restoredHandle).toBe(handle);
  });

  test('lists local audio assets recursively without creating playback urls', async () => {
    const nestedFolder = createDirectoryHandle('Albums', {
      'focus.mp3': createFileHandle(new File(['audio'], 'focus.mp3', { type: 'audio/mpeg' })),
      'ignore.txt': createFileHandle(new File(['text'], 'ignore.txt', { type: 'text/plain' })),
    });
    const rootHandle = createDirectoryHandle('Music', {
      Albums: nestedFolder,
      'breathe.wav': createFileHandle(new File(['audio'], 'breathe.wav', { type: 'audio/wav' })),
      'loop.mp4': createFileHandle(new File(['video'], 'loop.mp4', { type: 'video/mp4' })),
    });

    const assets = await listLocalMediaAssets({
      id: 'local-music',
      directoryHandle: rootHandle,
    }, 'audio', { recursive: true, maxItems: 10 });

    expect(assets.map((asset) => asset.relativePath)).toEqual(['Albums/focus.mp3', 'breathe.wav']);
    expect(assets[0]).toMatchObject({
      provider: 'local-folder',
      assetType: 'audio',
      isLocal: true,
    });
    expect(assets[0].url).toBeUndefined();
  });

  test('resolves a local file on demand from a relative path', async () => {
    const trackFile = new File(['audio'], 'focus.mp3', { type: 'audio/mpeg' });
    const nestedFolder = createDirectoryHandle('Albums', {
      'focus.mp3': createFileHandle(trackFile),
    });
    const rootHandle = createDirectoryHandle('Music', {
      Albums: nestedFolder,
    });

    const resolvedFile = await resolveLocalMediaFile({
      id: 'local-music',
      directoryHandle: rootHandle,
    }, 'Albums/focus.mp3');

    expect(resolvedFile).toBe(trackFile);
    expect(rootHandle.getDirectoryHandle).toHaveBeenCalledWith('Albums');
  });
});