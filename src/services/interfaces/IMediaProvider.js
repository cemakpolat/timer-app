/**
 * Interface for remote media provider implementations.
 *
 * Providers are responsible for listing normalized remote media assets from a
 * read-only source such as a GitHub manifest or public CDN manifest.
 */
export class IMediaProvider {
  /**
   * Check whether this provider can handle the given source.
   * @param {Object} source
   * @returns {boolean}
   */
  supports(source) {
    throw new Error('Method not implemented');
  }

  /**
   * List normalized assets for a remote source.
   * @param {Object} source
   * @returns {Promise<Array>}
   */
  async listAssets(source) {
    throw new Error('Method not implemented');
  }
}

export default IMediaProvider;