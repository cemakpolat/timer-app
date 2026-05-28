import mediaPolicyService from './mediaPolicyService';
import MediaProviderFactory from './mediaProviders/MediaProviderFactory';
import { filterSourcesByAssetType, normalizeRemoteMediaSource } from './remoteMediaSourcesService';

export const REMOTE_MEDIA_ASSET_LIMITS = {
  image: 60,
  video: 20,
  audio: 80,
};

function mapPreviewAssets(assets = [], source = {}, assetType) {
  const assetLimit = REMOTE_MEDIA_ASSET_LIMITS[assetType] || assets.length;

  return assets.slice(0, assetLimit).map((asset) => {
    const isLocalSource = source.provider === 'local-folder' || asset.isLocal === true;

    return {
      ...asset,
      isRemote: !isLocalSource,
      isLocal: isLocalSource || asset.isLocal === true,
      isBuiltIn: false,
      sourceId: asset.sourceId || source.id,
      provider: asset.provider || source.provider,
      size: asset.bytes || 0,
      sourceName: source.name || source.id,
    };
  });
}

export async function previewRemoteMediaSource(sourceInput = {}, assetType) {
  const source = normalizeRemoteMediaSource({
    ...sourceInput,
    assetTypes: [assetType],
  });

  if (!source) {
    return {
      source: null,
      approvedAssets: [],
      rejectedAssets: [],
      status: 'invalid',
      errors: ['A valid remote media source is required.'],
    };
  }

  const sourceValidation = mediaPolicyService.validateSource(source);
  if (!sourceValidation.valid) {
    return {
      source,
      approvedAssets: [],
      rejectedAssets: [],
      status: 'invalid',
      errors: sourceValidation.errors,
    };
  }

  try {
    const listedAssets = await MediaProviderFactory.listAssets(source);
    const { approvedAssets, rejectedAssets } = mediaPolicyService.evaluateAssets(listedAssets, source);
    const filteredApprovedAssets = approvedAssets.filter((asset) => asset.assetType === assetType);
    const filteredRejectedAssets = rejectedAssets.filter((asset) => asset.assetType === assetType);

    return {
      source,
      approvedAssets: mapPreviewAssets(filteredApprovedAssets, source, assetType),
      rejectedAssets: filteredRejectedAssets,
      status: 'ready',
      errors: [],
    };
  } catch (error) {
    return {
      source,
      approvedAssets: [],
      rejectedAssets: [],
      status: 'error',
      errors: [error.message || 'Failed to preview remote media source.'],
    };
  }
}

export async function loadRemoteMediaAssets(sources = [], assetType) {
  const eligibleSources = filterSourcesByAssetType(sources, assetType);

  const sourceResults = await Promise.all(eligibleSources.map(async (source) => {
    const sourceValidation = mediaPolicyService.validateSource(source);
    if (!sourceValidation.valid) {
      return {
        source,
        approvedAssets: [],
        rejectedAssets: [],
        status: 'invalid',
        errors: sourceValidation.errors,
      };
    }

    try {
      const listedAssets = await MediaProviderFactory.listAssets(source);
      const { approvedAssets, rejectedAssets } = mediaPolicyService.evaluateAssets(listedAssets, source);

      return {
        source,
        approvedAssets: approvedAssets.filter((asset) => asset.assetType === assetType),
        rejectedAssets: rejectedAssets.filter((asset) => asset.assetType === assetType),
        status: 'ready',
        errors: [],
      };
    } catch (error) {
      return {
        source,
        approvedAssets: [],
        rejectedAssets: [],
        status: 'error',
        errors: [error.message || 'Failed to load remote media source.'],
      };
    }
  }));

  const remoteAssets = [];
  const sourceStatuses = [];

  sourceResults.forEach(({ source, approvedAssets, rejectedAssets, status, errors }) => {
    const cappedAssets = mapPreviewAssets(approvedAssets, source, assetType);

    remoteAssets.push(...cappedAssets);

    sourceStatuses.push({
      sourceId: source.id,
      name: source.name || source.id,
      provider: source.provider,
      status,
      approvedCount: cappedAssets.length,
      rejectedCount: rejectedAssets.length,
      errors,
      lastSyncedAt: new Date().toISOString(),
    });
  });

  return {
    remoteAssets,
    sourceStatuses,
  };
}

const remoteMediaLibraryService = {
  loadRemoteMediaAssets,
  previewRemoteMediaSource,
  REMOTE_MEDIA_ASSET_LIMITS,
};

export default remoteMediaLibraryService;