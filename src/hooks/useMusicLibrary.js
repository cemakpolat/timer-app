import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addRemoteMediaSource as persistRemoteMediaSource,
  createLocalFolderSource,
  deleteRemoteMediaSource as removePersistedRemoteMediaSource,
  filterSourcesByAssetType,
  getRemoteMediaSources,
  REMOTE_MEDIA_SOURCES_EVENT,
} from '../services/remoteMediaSourcesService';
import { loadRemoteMediaAssets } from '../services/remoteMediaLibraryService';
import {
  addMediaSelection,
  getMediaSelections,
  MEDIA_SELECTIONS_EVENT,
  moveMediaSelection,
  removeMediaSelection,
} from '../services/mediaSelectionService';
import {
  deleteLocalMediaSourceHandle,
  resolveLocalMediaFile,
  saveLocalMediaSourceHandle,
  supportsLocalMediaLibrary,
} from '../services/localMediaLibraryService';

const LOCAL_MUSIC_URL_CACHE_PREFIX = 'music-selection:';

function getSelectionLookupKey(selection) {
  return `${LOCAL_MUSIC_URL_CACHE_PREFIX}${selection.selectionId}`;
}

export default function useMusicLibrary() {
  const localUrlCacheRef = useRef(new Map());
  const [musicSources, setMusicSources] = useState([]);
  const [musicSourceStatuses, setMusicSourceStatuses] = useState([]);
  const [availableMusicAssets, setAvailableMusicAssets] = useState([]);
  const [musicSelections, setMusicSelections] = useState(() => getMediaSelections('music'));

  const supportsLocalFolders = useMemo(() => supportsLocalMediaLibrary(), []);

  const refreshMusicLibrary = useCallback(async () => {
    const sources = filterSourcesByAssetType(getRemoteMediaSources(), 'audio');
    setMusicSources(sources);

    if (sources.length === 0) {
      setAvailableMusicAssets([]);
      setMusicSourceStatuses([]);
      return { remoteAssets: [], sourceStatuses: [] };
    }

    const { remoteAssets, sourceStatuses } = await loadRemoteMediaAssets(sources, 'audio');
    setAvailableMusicAssets(remoteAssets);
    setMusicSourceStatuses(sourceStatuses);
    return { remoteAssets, sourceStatuses };
  }, []);

  useEffect(() => {
    refreshMusicLibrary();
  }, [refreshMusicLibrary]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleSourcesChanged = () => {
      refreshMusicLibrary();
    };
    const handleSelectionsChanged = () => {
      setMusicSelections(getMediaSelections('music'));
    };

    window.addEventListener(REMOTE_MEDIA_SOURCES_EVENT, handleSourcesChanged);
    window.addEventListener(MEDIA_SELECTIONS_EVENT, handleSelectionsChanged);

    return () => {
      window.removeEventListener(REMOTE_MEDIA_SOURCES_EVENT, handleSourcesChanged);
      window.removeEventListener(MEDIA_SELECTIONS_EVENT, handleSelectionsChanged);
    };
  }, [refreshMusicLibrary]);

  const addRemoteMusicSource = useCallback(async (sourceInput) => {
    const assetTypes = Array.from(new Set([...(sourceInput.assetTypes || []), 'audio']));
    const source = persistRemoteMediaSource({
      ...sourceInput,
      assetTypes,
    });

    await refreshMusicLibrary();
    return source;
  }, [refreshMusicLibrary]);

  const addLocalMusicSource = useCallback(async (directoryHandle, overrides = {}) => {
    const source = createLocalFolderSource(directoryHandle, ['audio'], overrides);

    await saveLocalMediaSourceHandle(source.directoryHandleKey || source.id, directoryHandle);
    persistRemoteMediaSource(source);
    await refreshMusicLibrary();
    return source;
  }, [refreshMusicLibrary]);

  const deleteMusicSource = useCallback(async (sourceId) => {
    const sourceToDelete = getRemoteMediaSources().find((source) => source.id === sourceId);

    removePersistedRemoteMediaSource(sourceId);
    if (sourceToDelete?.provider === 'local-folder') {
      await deleteLocalMediaSourceHandle(sourceToDelete.directoryHandleKey || sourceToDelete.id);
    }

    await refreshMusicLibrary();
    return true;
  }, [refreshMusicLibrary]);

  const addMusicSelection = useCallback((asset) => {
    const nextSelections = addMediaSelection('music', {
      assetId: asset.id,
      sourceId: asset.sourceId,
      sourceType: asset.provider,
      assetType: 'audio',
      name: asset.name,
      mimeType: asset.mimeType,
      relativePath: asset.relativePath || null,
      duration: asset.duration,
    });
    setMusicSelections(nextSelections);
    return nextSelections;
  }, []);

  const removeMusicSelection = useCallback((selectionId) => {
    const nextSelections = removeMediaSelection('music', selectionId);
    setMusicSelections(nextSelections);
    return nextSelections;
  }, []);

  const reorderMusicSelection = useCallback((fromIndex, toIndex) => {
    const nextSelections = moveMediaSelection('music', fromIndex, toIndex);
    setMusicSelections(nextSelections);
    return nextSelections;
  }, []);

  const findSelectionById = useCallback((selectionId) => (
    musicSelections.find((selection) => selection.selectionId === selectionId) || null
  ), [musicSelections]);

  const findAvailableMusicAsset = useCallback((selection) => (
    availableMusicAssets.find((asset) => asset.id === selection.assetId && asset.sourceId === selection.sourceId) || null
  ), [availableMusicAssets]);

  const getMusicSelectionStatus = useCallback((selection) => {
    const source = musicSources.find((item) => item.id === selection.sourceId);
    if (!source) {
      return 'missing-source';
    }

    if (source.provider === 'local-folder') {
      return 'ready';
    }

    return findAvailableMusicAsset(selection) ? 'ready' : 'missing-asset';
  }, [findAvailableMusicAsset, musicSources]);

  const resolveMusicSelectionUrl = useCallback(async (selectionInput) => {
    const selection = typeof selectionInput === 'string'
      ? findSelectionById(selectionInput)
      : selectionInput;

    if (!selection) {
      return null;
    }

    const source = musicSources.find((item) => item.id === selection.sourceId) || null;
    if (source?.provider === 'local-folder' || selection.sourceType === 'local-folder') {
      const lookupKey = getSelectionLookupKey(selection);
      const cached = localUrlCacheRef.current.get(lookupKey);
      if (cached) {
        cached.refCount = (cached.refCount ?? 0) + 1;
        return cached.url;
      }

      const file = await resolveLocalMediaFile(source || {
        id: selection.sourceId,
        directoryHandleKey: selection.sourceId,
      }, selection.relativePath);
      if (!file) {
        return null;
      }

      const url = URL.createObjectURL(file);
      localUrlCacheRef.current.set(lookupKey, {
        url,
        refCount: 1,
      });
      return url;
    }

    const asset = findAvailableMusicAsset(selection);
    return asset?.url || null;
  }, [findAvailableMusicAsset, findSelectionById, musicSources]);

  const releaseMusicSelectionUrl = useCallback((selectionInput) => {
    const selection = typeof selectionInput === 'string'
      ? findSelectionById(selectionInput)
      : selectionInput;

    if (!selection) {
      return;
    }

    const lookupKey = getSelectionLookupKey(selection);
    const cached = localUrlCacheRef.current.get(lookupKey);
    if (!cached) {
      return;
    }

    const nextRefCount = Math.max(0, (cached.refCount ?? 0) - 1);
    if (nextRefCount > 0) {
      cached.refCount = nextRefCount;
      return;
    }

    try {
      URL.revokeObjectURL(cached.url);
    } catch (error) {
      console.warn('Failed to revoke local music selection URL:', error);
    }

    localUrlCacheRef.current.delete(lookupKey);
  }, [findSelectionById]);

  useEffect(() => () => {
    Array.from(localUrlCacheRef.current.values()).forEach((entry) => {
      try {
        URL.revokeObjectURL(entry.url);
      } catch (error) {
        console.warn('Failed to revoke cached music selection URL:', error);
      }
    });
    localUrlCacheRef.current.clear();
  }, []);

  return {
    addLocalMusicSource,
    addMusicSelection,
    addRemoteMusicSource,
    availableMusicAssets,
    deleteMusicSource,
    getMusicSelectionStatus,
    musicSelections,
    musicSourceStatuses,
    musicSources,
    refreshMusicLibrary,
    releaseMusicSelectionUrl,
    removeMusicSelection,
    reorderMusicSelection,
    resolveMusicSelectionUrl,
    supportsLocalFolders,
  };
}