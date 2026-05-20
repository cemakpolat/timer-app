const MB = 1024 * 1024;

export const REMOTE_MEDIA_POLICY = {
  allowedImageMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  blockedImageMimeTypes: ['image/svg+xml', 'image/gif', 'image/heic', 'image/heif'],
  allowedVideoMimeTypes: ['video/mp4', 'video/webm'],
  recommendedImageBytes: 8 * MB,
  maxImageBytes: 12 * MB,
  maxImagePixels: 20_000_000,
  maxImageWidth: 4096,
  maxImageHeight: 4096,
  recommendedVideoBytes: 80 * MB,
  maxVideoBytes: 120 * MB,
  maxVideoWidth: 1920,
  maxVideoHeight: 1080,
  maxVideoDurationSeconds: 90,
};

const PROVIDER_HOST_ALLOWLIST = {
  github: [
    'raw.githubusercontent.com',
    'github.com',
    'objects.githubusercontent.com',
    '*.githubusercontent.com',
  ],
  'generic-manifest': [],
};

function uniqueStrings(values = []) {
  return Array.from(new Set(values.filter(Boolean).map((value) => String(value).toLowerCase())));
}

function getUrlHostname(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isHttpsUrl(url) {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

function hostnameMatchesRule(hostname, rule) {
  if (!hostname || !rule) {
    return false;
  }

  if (rule.startsWith('*.')) {
    const suffix = rule.slice(1);
    return hostname.endsWith(suffix);
  }

  return hostname === rule;
}

function normalizePositiveNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null;
}

function getAllowedHostnames(source = {}) {
  const providerHostnames = PROVIDER_HOST_ALLOWLIST[source.provider] || [];
  const configuredHostnames = Array.isArray(source.allowedHostnames)
    ? source.allowedHostnames
    : [];
  const manifestHostname = source.manifestUrl ? [getUrlHostname(source.manifestUrl)] : [];

  return uniqueStrings([...providerHostnames, ...configuredHostnames, ...manifestHostname]);
}

class MediaPolicyService {
  validateSource(source = {}) {
    const errors = [];

    if (!source.id) {
      errors.push('Remote media source id is required.');
    }

    if (!source.provider) {
      errors.push('Remote media source provider is required.');
    }

    if (source.manifestUrl && !isHttpsUrl(source.manifestUrl)) {
      errors.push('Remote media manifests must use HTTPS.');
    }

    return {
      valid: errors.length === 0,
      errors,
      allowedHostnames: getAllowedHostnames(source),
    };
  }

  validateAsset(asset = {}, source = {}) {
    const errors = [];
    const assetType = asset.assetType;
    const mimeType = asset.mimeType ? String(asset.mimeType).toLowerCase() : null;
    const bytes = normalizePositiveNumber(asset.bytes);
    const width = normalizePositiveNumber(asset.width);
    const height = normalizePositiveNumber(asset.height);
    const duration = normalizePositiveNumber(asset.duration);
    const allowedHostnames = getAllowedHostnames(source);
    const assetHostname = getUrlHostname(asset.url);
    const posterHostname = asset.posterUrl ? getUrlHostname(asset.posterUrl) : null;

    if (!assetType || !['image', 'video'].includes(assetType)) {
      errors.push('Remote media asset type must be image or video.');
    }

    if (!asset.url) {
      errors.push('Remote media asset URL is required.');
    } else if (!isHttpsUrl(asset.url)) {
      errors.push('Remote media asset URLs must use HTTPS.');
    }

    if (!mimeType) {
      errors.push('Remote media asset MIME type is required.');
    }

    if (bytes === null) {
      errors.push('Remote media asset byte size is required.');
    }

    if (allowedHostnames.length === 0) {
      errors.push('Remote media source must define at least one allowed hostname.');
    }

    if (assetHostname && allowedHostnames.length > 0) {
      const assetAllowed = allowedHostnames.some((rule) => hostnameMatchesRule(assetHostname, rule));
      if (!assetAllowed) {
        errors.push('Remote media asset hostname is not allowlisted.');
      }
    }

    if (asset.posterUrl) {
      if (!isHttpsUrl(asset.posterUrl)) {
        errors.push('Remote media poster URLs must use HTTPS.');
      } else if (posterHostname && allowedHostnames.length > 0) {
        const posterAllowed = allowedHostnames.some((rule) => hostnameMatchesRule(posterHostname, rule));
        if (!posterAllowed) {
          errors.push('Remote media poster hostname is not allowlisted.');
        }
      }
    }

    if (assetType === 'image') {
      if (mimeType && REMOTE_MEDIA_POLICY.blockedImageMimeTypes.includes(mimeType)) {
        errors.push('Remote image MIME type is blocked.');
      } else if (mimeType && !REMOTE_MEDIA_POLICY.allowedImageMimeTypes.includes(mimeType)) {
        errors.push('Remote image MIME type is not allowed.');
      }

      if (bytes !== null && bytes > REMOTE_MEDIA_POLICY.maxImageBytes) {
        errors.push('Remote image exceeds the maximum allowed size.');
      }

      if (width !== null && width > REMOTE_MEDIA_POLICY.maxImageWidth) {
        errors.push('Remote image width exceeds the maximum allowed size.');
      }

      if (height !== null && height > REMOTE_MEDIA_POLICY.maxImageHeight) {
        errors.push('Remote image height exceeds the maximum allowed size.');
      }

      if (width !== null && height !== null && (width * height) > REMOTE_MEDIA_POLICY.maxImagePixels) {
        errors.push('Remote image exceeds the maximum allowed pixel count.');
      }
    }

    if (assetType === 'video') {
      if (mimeType && !REMOTE_MEDIA_POLICY.allowedVideoMimeTypes.includes(mimeType)) {
        errors.push('Remote video MIME type is not allowed.');
      }

      if (bytes !== null && bytes > REMOTE_MEDIA_POLICY.maxVideoBytes) {
        errors.push('Remote video exceeds the maximum allowed size.');
      }

      if (width !== null && width > REMOTE_MEDIA_POLICY.maxVideoWidth) {
        errors.push('Remote video width exceeds the maximum allowed size.');
      }

      if (height !== null && height > REMOTE_MEDIA_POLICY.maxVideoHeight) {
        errors.push('Remote video height exceeds the maximum allowed size.');
      }

      if (duration !== null && duration > REMOTE_MEDIA_POLICY.maxVideoDurationSeconds) {
        errors.push('Remote video duration exceeds the maximum allowed length.');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: this.getAssetWarnings(asset),
      allowedHostnames,
    };
  }

  getAssetWarnings(asset = {}) {
    const warnings = [];
    const bytes = normalizePositiveNumber(asset.bytes);
    const assetType = asset.assetType;

    if (assetType === 'image' && bytes !== null && bytes > REMOTE_MEDIA_POLICY.recommendedImageBytes) {
      warnings.push('Remote image is above the recommended size.');
    }

    if (assetType === 'video' && bytes !== null && bytes > REMOTE_MEDIA_POLICY.recommendedVideoBytes) {
      warnings.push('Remote video is above the recommended size.');
    }

    return warnings;
  }

  evaluateAssets(assets = [], source = {}) {
    const approvedAssets = [];
    const rejectedAssets = [];

    assets.forEach((asset) => {
      const validation = this.validateAsset(asset, source);
      if (validation.valid) {
        approvedAssets.push({ ...asset, policyWarnings: validation.warnings });
      } else {
        rejectedAssets.push({ ...asset, policyErrors: validation.errors });
      }
    });

    return { approvedAssets, rejectedAssets };
  }
}

const mediaPolicyService = new MediaPolicyService();

export default mediaPolicyService;