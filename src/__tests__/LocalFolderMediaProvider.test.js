jest.mock('../services/localMediaLibraryService', () => ({
  listLocalMediaAssets: jest.fn(),
}));

import { listLocalMediaAssets } from '../services/localMediaLibraryService';
import LocalFolderMediaProvider from '../services/mediaProviders/LocalFolderMediaProvider';

describe('LocalFolderMediaProvider', () => {
  test('lists assets from a persisted local folder using the requested asset type', async () => {
    listLocalMediaAssets.mockResolvedValue([
      {
        id: 'local-track',
        sourceId: 'local-source',
        assetType: 'audio',
        name: 'Focus Loop',
        relativePath: 'Albums/focus-loop.mp3',
        mimeType: 'audio/mpeg',
        bytes: 1024,
        isLocal: true,
      },
    ]);

    const provider = new LocalFolderMediaProvider();
    const assets = await provider.listAssets({
      id: 'local-source',
      provider: 'local-folder',
      directoryHandleKey: 'local-source',
      assetTypes: ['audio'],
    });

    expect(listLocalMediaAssets).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'local-source',
        provider: 'local-folder',
      }),
      'audio',
      expect.objectContaining({ recursive: true, maxItems: 200 })
    );
    expect(assets).toHaveLength(1);
    expect(assets[0]).toMatchObject({
      id: 'local-track',
      isLocal: true,
      relativePath: 'Albums/focus-loop.mp3',
    });
  });
});