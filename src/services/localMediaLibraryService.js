import { deleteFileBlob, getFileBlob, saveFileBlob } from './indexeddb';

const LOCAL_MEDIA_SOURCE_HANDLE_PREFIX = 'local-media-source-handle:';
const localHandleCache = new Map();

const EXTENSION_TO_MIME = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
  m4a: 'audio/x-m4a',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function sanitizeIdSegment(value) {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);

  return normalized || 'asset';
}

function inferMimeTypeFromName(name = '') {
  const extension = String(name).split('.').pop()?.toLowerCase();
  return extension ? EXTENSION_TO_MIME[extension] || null : null;
}

function inferAssetType(file = {}) {
  const mimeType = file.type || inferMimeTypeFromName(file.name);
  if (!mimeType) {
    return null;
  }

  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }

  if (mimeType.startsWith('video/')) {
    return 'video';
  }

  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  return null;
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null;
}

function getSourceHandleKey(sourceOrKey) {
  if (typeof sourceOrKey === 'string') {
    return sourceOrKey;
  }

  if (sourceOrKey?.directoryHandleKey) {
    return sourceOrKey.directoryHandleKey;
  }

  return sourceOrKey?.id || null;
}

function getStorageKey(sourceOrKey) {
  const key = getSourceHandleKey(sourceOrKey);
  return key ? `${LOCAL_MEDIA_SOURCE_HANDLE_PREFIX}${key}` : null;
}

async function ensureDirectoryPermission(handle, mode = 'read') {
  if (!handle) {
    return false;
  }

  if (typeof handle.queryPermission === 'function') {
    const permission = await handle.queryPermission({ mode });
    if (permission === 'granted') {
      return true;
    }
  }

  if (typeof handle.requestPermission === 'function') {
    const permission = await handle.requestPermission({ mode });
    return permission === 'granted';
  }

  return true;
}

function createLocalAsset(source = {}, file = {}, relativePath = '') {
  const assetType = inferAssetType(file);
  if (!assetType) {
    return null;
  }

  const sourceId = source.id || source.directoryHandleKey || 'local-folder';
  const mimeType = file.type || inferMimeTypeFromName(file.name);

  return {
    id: `${sanitizeIdSegment(sourceId)}-${sanitizeIdSegment(relativePath)}`,
    sourceId,
    provider: 'local-folder',
    assetType,
    name: file.name ? file.name.replace(/\.[^.]+$/, '') : relativePath,
    relativePath,
    mimeType,
    bytes: toNullableNumber(file.size),
    duration: null,
    cachePolicy: 'stream-on-demand',
    isLocal: true,
  };
}

async function collectAssets(handle, options, pathParts = [], collectedAssets = []) {
  const { source, assetType, recursive, maxItems } = options;

  for await (const [entryName, entry] of handle.entries()) {
    if (collectedAssets.length >= maxItems) {
      break;
    }

    if (entry.kind === 'directory' && recursive) {
      await collectAssets(entry, options, [...pathParts, entryName], collectedAssets);
      continue;
    }

    if (entry.kind !== 'file') {
      continue;
    }

    const file = await entry.getFile();
    const relativePath = [...pathParts, file.name || entryName].join('/');
    const asset = createLocalAsset(source, file, relativePath);

    if (asset && asset.assetType === assetType) {
      collectedAssets.push(asset);
    }
  }

  return collectedAssets;
}

async function getFileHandleForRelativePath(directoryHandle, relativePath) {
  const pathSegments = String(relativePath || '')
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (pathSegments.length === 0) {
    return null;
  }

  let currentHandle = directoryHandle;
  for (let index = 0; index < pathSegments.length - 1; index += 1) {
    const segment = pathSegments[index];
    if (typeof currentHandle.getDirectoryHandle !== 'function') {
      throw new Error('Local media source does not support nested directory access.');
    }

    currentHandle = await currentHandle.getDirectoryHandle(segment);
  }

  if (typeof currentHandle.getFileHandle !== 'function') {
    throw new Error('Local media source does not support file resolution.');
  }

  return currentHandle.getFileHandle(pathSegments[pathSegments.length - 1]);
}

export function supportsLocalMediaLibrary() {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
}

export async function saveLocalMediaSourceHandle(sourceOrKey, directoryHandle) {
  const storageKey = getStorageKey(sourceOrKey);
  if (!storageKey) {
    throw new Error('A local media source key is required.');
  }

  if (!directoryHandle || directoryHandle.kind !== 'directory') {
    throw new Error('A directory handle is required.');
  }

  localHandleCache.set(storageKey, directoryHandle);
  await saveFileBlob(storageKey, directoryHandle);
  return directoryHandle;
}

export async function getLocalMediaSourceHandle(sourceOrKey) {
  const storageKey = getStorageKey(sourceOrKey);
  if (!storageKey) {
    return null;
  }

  if (localHandleCache.has(storageKey)) {
    return localHandleCache.get(storageKey);
  }

  const storedHandle = await getFileBlob(storageKey);
  if (storedHandle) {
    localHandleCache.set(storageKey, storedHandle);
  }

  return storedHandle;
}

export async function deleteLocalMediaSourceHandle(sourceOrKey) {
  const storageKey = getStorageKey(sourceOrKey);
  if (!storageKey) {
    return false;
  }

  localHandleCache.delete(storageKey);
  await deleteFileBlob(storageKey);
  return true;
}

export async function hasLocalMediaSourcePermission(sourceOrKey, mode = 'read') {
  const handle = await getLocalMediaSourceHandle(sourceOrKey);
  return ensureDirectoryPermission(handle, mode);
}

export async function listLocalMediaAssets(source = {}, assetType, options = {}) {
  if (!['audio', 'video', 'image'].includes(assetType)) {
    throw new Error('Local media asset type must be audio, video, or image.');
  }

  const handle = source.directoryHandle || await getLocalMediaSourceHandle(source);
  if (!handle) {
    throw new Error('Local media source handle is not available.');
  }

  const hasPermission = await ensureDirectoryPermission(handle, options.mode || 'read');
  if (!hasPermission) {
    throw new Error('Local media source permission was not granted.');
  }

  return collectAssets(handle, {
    source,
    assetType,
    recursive: options.recursive !== false,
    maxItems: options.maxItems || 200,
  });
}

export async function resolveLocalMediaFile(source = {}, relativePath) {
  const handle = source.directoryHandle || await getLocalMediaSourceHandle(source);
  if (!handle) {
    throw new Error('Local media source handle is not available.');
  }

  const hasPermission = await ensureDirectoryPermission(handle, 'read');
  if (!hasPermission) {
    throw new Error('Local media source permission was not granted.');
  }

  const fileHandle = await getFileHandleForRelativePath(handle, relativePath);
  if (!fileHandle || typeof fileHandle.getFile !== 'function') {
    throw new Error('Local media file handle could not be resolved.');
  }

  return fileHandle.getFile();
}

const localMediaLibraryService = {
  deleteLocalMediaSourceHandle,
  getLocalMediaSourceHandle,
  hasLocalMediaSourcePermission,
  listLocalMediaAssets,
  resolveLocalMediaFile,
  saveLocalMediaSourceHandle,
  supportsLocalMediaLibrary,
};

export default localMediaLibraryService;