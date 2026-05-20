import GitHubMediaProvider from '../services/mediaProviders/GitHubMediaProvider';

function createResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

describe('GitHubMediaProvider', () => {
  test('builds a raw.githubusercontent manifest URL from repo coordinates', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(createResponse({
      images: [
        {
          name: 'Sea',
          url: 'images/sea.webp',
          mimeType: 'image/webp',
          bytes: 1024,
        },
      ],
    }));

    const provider = new GitHubMediaProvider(fetchImpl);
    const assets = await provider.listAssets({
      id: 'github-library',
      provider: 'github',
      owner: 'acme',
      repo: 'media-library',
      ref: 'main',
      path: 'catalog/manifest.json',
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/acme/media-library/main/catalog/manifest.json',
      { headers: { Accept: 'application/json' } }
    );
    expect(assets[0]).toMatchObject({
      provider: 'github',
      sourceId: 'github-library',
      url: 'https://raw.githubusercontent.com/acme/media-library/main/catalog/images/sea.webp',
    });
  });
});