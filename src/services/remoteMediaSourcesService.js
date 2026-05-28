const REMOTE_MEDIA_SOURCES_KEY = 'remoteMediaSources';
export const REMOTE_MEDIA_SOURCES_EVENT = 'remote-media-sources-changed';

function uniqueStrings(values = []) {
  return Array.from(new Set(values.filter(Boolean).map((value) => String(value).trim().toLowerCase())));
}

function getHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function normalizeAssetTypes(assetTypes = []) {
  const normalized = Array.isArray(assetTypes)
    ? assetTypes.filter((assetType) => ['image', 'video', 'audio'].includes(assetType))
    : [];

  return normalized.length > 0 ? Array.from(new Set(normalized)) : ['image'];
}

function defaultNameForSource(source = {}) {
  if (source.name) {
    return source.name;
  }

  if (source.provider === 'github' && source.repo) {
    return `${source.repo} media`;
  }

  if (source.provider === 'local-folder' && source.directoryName) {
    return source.directoryName;
  }

  const manifestHostname = getHostname(source.manifestUrl);
  return manifestHostname ? `${manifestHostname} media` : 'Remote media source';
}

function createSourceId(provider) {
  return `${provider || 'remote'}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createLocalFolderSource(directoryHandle, assetTypes = [], overrides = {}) {
  const sourceId = overrides.id || createSourceId('local-folder');

  return normalizeRemoteMediaSource({
    ...overrides,
    id: sourceId,
    provider: 'local-folder',
    directoryHandleKey: overrides.directoryHandleKey || sourceId,
    directoryName: overrides.directoryName || directoryHandle?.name || null,
    name: overrides.name || directoryHandle?.name || 'Local media folder',
    assetTypes,
  });
}

function emitSourcesChanged(sources) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(REMOTE_MEDIA_SOURCES_EVENT, {
    detail: sources,
  }));
}

export function normalizeRemoteMediaSource(source = {}) {
  if (!source || typeof source !== 'object' || !source.provider) {
    return null;
  }

  const manifestHostname = source.manifestUrl ? [getHostname(source.manifestUrl)] : [];
  const now = new Date().toISOString();

  return {
    id: source.id || createSourceId(source.provider),
    name: defaultNameForSource(source),
    provider: source.provider,
    manifestUrl: source.manifestUrl || null,
    folderUrl: source.folderUrl || null,
    owner: source.owner || null,
    repo: source.repo || null,
    ref: source.provider === 'github' ? (source.ref || 'main') : (source.ref || null),
    path: source.path || source.manifestPath || null,
    baseUrl: source.baseUrl || null,
    directoryHandleKey: source.directoryHandleKey || null,
    directoryName: source.directoryName || null,
    allowedHostnames: uniqueStrings([
      ...(Array.isArray(source.allowedHostnames) ? source.allowedHostnames : []),
      ...manifestHostname,
    ]),
    assetTypes: normalizeAssetTypes(source.assetTypes),
    createdAt: source.createdAt || now,
    updatedAt: now,
  };
}

export function getRemoteMediaSources() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(REMOTE_MEDIA_SOURCES_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((source) => normalizeRemoteMediaSource(source))
      .filter(Boolean);
  } catch (error) {
    console.error('Failed to load remote media sources:', error);
    return [];
  }
}

export function saveRemoteMediaSources(sources = []) {
  if (typeof window === 'undefined') {
    return [];
  }

  const normalizedSources = sources
    .map((source) => normalizeRemoteMediaSource(source))
    .filter(Boolean);

  localStorage.setItem(REMOTE_MEDIA_SOURCES_KEY, JSON.stringify(normalizedSources));
  emitSourcesChanged(normalizedSources);
  return normalizedSources;
}

export function addRemoteMediaSource(source) {
  const normalizedSource = normalizeRemoteMediaSource(source);
  if (!normalizedSource) {
    throw new Error('A valid remote media source is required.');
  }

  const existingSources = getRemoteMediaSources().filter((item) => item.id !== normalizedSource.id);
  saveRemoteMediaSources([...existingSources, normalizedSource]);
  return normalizedSource;
}

export function deleteRemoteMediaSource(id) {
  const nextSources = getRemoteMediaSources().filter((source) => source.id !== id);
  saveRemoteMediaSources(nextSources);
  return nextSources;
}

export function filterSourcesByAssetType(sources = [], assetType) {
  return sources.filter((source) => {
    if (!Array.isArray(source.assetTypes) || source.assetTypes.length === 0) {
      return true;
    }

    return source.assetTypes.includes(assetType);
  });
}

const remoteMediaSourcesService = {
  addRemoteMediaSource,
  createLocalFolderSource,
  deleteRemoteMediaSource,
  filterSourcesByAssetType,
  getRemoteMediaSources,
  normalizeRemoteMediaSource,
  saveRemoteMediaSources,
};

export default remoteMediaSourcesService;