import IMediaProvider from '../interfaces/IMediaProvider';
import { listLocalMediaAssets } from '../localMediaLibraryService';

class LocalFolderMediaProvider extends IMediaProvider {
  constructor(listAssetsImpl = listLocalMediaAssets) {
    super();
    this.listAssetsImpl = listAssetsImpl;
  }

  supports(source) {
    return source?.provider === 'local-folder';
  }

  async listAssets(source = {}) {
    const requestedAssetType = source.requestedAssetType
      || source.assetTypes?.[0]
      || 'audio';

    return this.listAssetsImpl(source, requestedAssetType, {
      recursive: source.recursive !== false,
      maxItems: source.maxItems || 200,
    });
  }
}

export default LocalFolderMediaProvider;