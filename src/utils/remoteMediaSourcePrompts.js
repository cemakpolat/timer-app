function parseCommaSeparatedInput(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getManifestFallbackName(manifestUrl, assetType) {
  try {
    return `${new URL(manifestUrl).hostname} ${assetType}s`;
  } catch {
    return `Remote ${assetType}s`;
  }
}

export function promptForRemoteMediaSource(assetType = 'image') {
  const providerInput = window.prompt(
    `Add remote ${assetType} source. Type "github" for a GitHub manifest or "manifest" for a public HTTPS JSON manifest.`,
    'manifest'
  );

  if (!providerInput) {
    return null;
  }

  const provider = providerInput.trim().toLowerCase();

  if (provider === 'github' || provider === 'gh') {
    const owner = window.prompt('GitHub owner or organization');
    if (!owner) {
      return null;
    }

    const repo = window.prompt('GitHub repository name');
    if (!repo) {
      return null;
    }

    const path = window.prompt('Path to the manifest JSON inside the repository', 'catalog/manifest.json');
    if (!path) {
      return null;
    }

    const ref = window.prompt('Git ref or branch', 'main') || 'main';
    const name = window.prompt('Source label', `${repo} ${assetType}s`) || `${repo} ${assetType}s`;

    return {
      provider: 'github',
      name,
      owner,
      repo,
      ref,
      path,
      assetTypes: [assetType],
    };
  }

  if (provider === 'manifest' || provider === 'cdn') {
    const manifestUrl = window.prompt('Public manifest URL (HTTPS JSON)');
    if (!manifestUrl) {
      return null;
    }

    const name = window.prompt('Source label', getManifestFallbackName(manifestUrl, assetType))
      || getManifestFallbackName(manifestUrl, assetType);
    const allowedHostnames = parseCommaSeparatedInput(window.prompt(
      'Optional asset hostnames if assets are served from a different domain. Leave blank to allow the manifest host only.',
      ''
    ));

    return {
      provider: 'generic-manifest',
      name,
      manifestUrl,
      allowedHostnames,
      assetTypes: [assetType],
    };
  }

  throw new Error('Unsupported remote source type. Use github or manifest.');
}

const remoteMediaSourcePrompts = {
  promptForRemoteMediaSource,
};

// eslint-disable-next-line import/no-anonymous-default-export
export default remoteMediaSourcePrompts;