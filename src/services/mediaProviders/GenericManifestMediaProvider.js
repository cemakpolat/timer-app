import IMediaProvider from '../interfaces/IMediaProvider';

const EXTENSION_TO_MIME = {
  image: {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
  },
  video: {
    mp4: 'video/mp4',
    webm: 'video/webm',
  },
  audio: {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    m4a: 'audio/x-m4a',
    webm: 'audio/webm',
  },
};

function sanitizeIdSegment(value) {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return normalized || 'asset';
}

function createAssetId(sourceId, assetType, index, rawAsset) {
  const seed = rawAsset.id || rawAsset.name || rawAsset.url || `${assetType}-${index}`;
  return `${sanitizeIdSegment(sourceId)}-${sanitizeIdSegment(assetType)}-${sanitizeIdSegment(seed)}`;
}

function inferMimeType(url, assetType) {
  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split('.').pop()?.toLowerCase();
    const inferred = extension ? EXTENSION_TO_MIME[assetType]?.[extension] : null;

    if (inferred) {
      return inferred;
    }

    if (assetType === 'image') {
      return null;
    }

    if (assetType === 'video') {
      return null;
    }

    if (assetType === 'audio') {
      return null;
    }
  } catch {
    return null;
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

function inferName(url) {
  try {
    const pathname = new URL(url).pathname;
    const lastSegment = pathname.split('/').filter(Boolean).pop();
    return lastSegment ? decodeURIComponent(lastSegment.replace(/\.[^.]+$/, '')) : 'Remote asset';
  } catch {
    return 'Remote asset';
  }
}

class GenericManifestMediaProvider extends IMediaProvider {
  constructor(fetchImpl = fetch) {
    super();
    this.fetchImpl = fetchImpl;
  }

  supports(source) {
    return source?.provider === 'generic-manifest';
  }

  async listAssets(source) {
    const manifestUrl = source?.manifestUrl;

    if (!manifestUrl) {
      throw new Error('Generic manifest media source requires a manifestUrl.');
    }

    const response = await this.fetchImpl(manifestUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to load remote media manifest (${response.status}).`);
    }

    const manifest = await response.json();
    return this.parseManifest(manifest, source);
  }

  parseManifest(manifest = {}, source = {}) {
    const flattenedAssets = [];

    if (Array.isArray(manifest.assets)) {
      flattenedAssets.push(...manifest.assets);
    }

    if (Array.isArray(manifest.images)) {
      flattenedAssets.push(...manifest.images.map((asset) => ({ ...asset, type: 'image' })));
    }

    if (Array.isArray(manifest.videos)) {
      flattenedAssets.push(...manifest.videos.map((asset) => ({ ...asset, type: 'video' })));
    }

    if (Array.isArray(manifest.audios)) {
      flattenedAssets.push(...manifest.audios.map((asset) => ({ ...asset, type: 'audio' })));
    }

    if (flattenedAssets.length === 0) {
      throw new Error('Remote media manifest must define assets, images, or videos.');
    }

    return flattenedAssets.map((rawAsset, index) => this.normalizeAsset(rawAsset, index, source, manifest));
  }

  normalizeAsset(rawAsset = {}, index, source = {}, manifest = {}) {
    const assetType = rawAsset.assetType || rawAsset.type;
    const baseUrl = manifest.baseUrl || source.baseUrl || source.manifestUrl;

    if (!assetType || !['image', 'video', 'audio'].includes(assetType)) {
      throw new Error('Remote media assets must declare an image, video, or audio type.');
    }

    if (!rawAsset.url) {
      throw new Error('Remote media asset URL is required.');
    }

    const resolvedUrl = new URL(rawAsset.url, baseUrl).toString();
    const resolvedPosterUrl = rawAsset.posterUrl || rawAsset.poster
      ? new URL(rawAsset.posterUrl || rawAsset.poster, baseUrl).toString()
      : null;

    return {
      id: rawAsset.id || createAssetId(source.id, assetType, index, rawAsset),
      sourceId: source.id,
      provider: source.provider,
      assetType,
      name: rawAsset.name || rawAsset.title || inferName(resolvedUrl),
      url: resolvedUrl,
      mimeType: rawAsset.mimeType || rawAsset.contentType || inferMimeType(resolvedUrl, assetType),
      bytes: toNullableNumber(rawAsset.bytes ?? rawAsset.size ?? rawAsset.contentLength),
      width: toNullableNumber(rawAsset.width),
      height: toNullableNumber(rawAsset.height),
      duration: toNullableNumber(rawAsset.duration),
      posterUrl: resolvedPosterUrl,
      checksum: rawAsset.checksum || rawAsset.etag || null,
      cachePolicy: rawAsset.cachePolicy || 'stream-on-demand',
    };
  }
}

export default GenericManifestMediaProvider;