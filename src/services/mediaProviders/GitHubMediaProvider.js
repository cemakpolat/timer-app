import IMediaProvider from '../interfaces/IMediaProvider';
import GenericManifestMediaProvider from './GenericManifestMediaProvider';

class GitHubMediaProvider extends IMediaProvider {
  constructor(fetchImpl = fetch) {
    super();
    this.genericManifestProvider = new GenericManifestMediaProvider(fetchImpl);
  }

  supports(source) {
    return source?.provider === 'github';
  }

  buildManifestUrl(source = {}) {
    if (source.manifestUrl) {
      return source.manifestUrl;
    }

    const { owner, repo } = source;
    const ref = source.ref || 'main';
    const path = source.path || source.manifestPath;

    if (!owner || !repo || !path) {
      throw new Error('GitHub media source requires owner, repo, and path.');
    }

    const normalizedPath = String(path).replace(/^\/+/, '');
    return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${normalizedPath}`;
  }

  async listAssets(source) {
    const manifestUrl = this.buildManifestUrl(source);
    return this.genericManifestProvider.listAssets({
      ...source,
      provider: 'github',
      manifestUrl,
    });
  }
}

export default GitHubMediaProvider;