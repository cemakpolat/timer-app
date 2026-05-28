import GenericManifestMediaProvider from './GenericManifestMediaProvider';
import GitHubMediaProvider from './GitHubMediaProvider';
import LocalFolderMediaProvider from './LocalFolderMediaProvider';

export const MediaProviderType = {
  GENERIC_MANIFEST: 'generic-manifest',
  GITHUB: 'github',
  LOCAL_FOLDER: 'local-folder',
};

function createDefaultProviders() {
  return new Map([
    [MediaProviderType.GENERIC_MANIFEST, new GenericManifestMediaProvider()],
    [MediaProviderType.GITHUB, new GitHubMediaProvider()],
    [MediaProviderType.LOCAL_FOLDER, new LocalFolderMediaProvider()],
  ]);
}

class MediaProviderFactory {
  static providers = createDefaultProviders();

  static registerProvider(type, provider) {
    if (!type) {
      throw new Error('Media provider type is required.');
    }

    if (!provider || typeof provider.listAssets !== 'function') {
      throw new Error('Media provider must implement listAssets().');
    }

    this.providers.set(type, provider);
  }

  static getProvider(type) {
    const provider = this.providers.get(type);

    if (!provider) {
      throw new Error(`Unknown media provider type: ${type}`);
    }

    return provider;
  }

  static async listAssets(source) {
    if (!source?.provider) {
      throw new Error('Remote media source provider is required.');
    }

    return this.getProvider(source.provider).listAssets(source);
  }

  static resetProviders() {
    this.providers = createDefaultProviders();
  }
}

export default MediaProviderFactory;