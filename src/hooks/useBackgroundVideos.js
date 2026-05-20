import { useState, useEffect, useCallback, useRef } from 'react';
import { saveFileBlob, getFileBlob, deleteFileBlob } from '../services/indexeddb';
import { loadRemoteMediaAssets } from '../services/remoteMediaLibraryService';
import {
  addRemoteMediaSource as persistRemoteMediaSource,
  deleteRemoteMediaSource as removePersistedRemoteMediaSource,
  filterSourcesByAssetType,
  getRemoteMediaSources,
  REMOTE_MEDIA_SOURCES_EVENT,
} from '../services/remoteMediaSourcesService';

const MAX_VIDEO_SIZE = 52_428_800; // 50 MB
const ACCEPTED_MIME_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

const useBackgroundVideos = () => {
  const fileStorageRef = useRef(new Map()); // id → { url, blob }

  const [selectedVideoId, setSelectedVideoId] = useState(() => {
    try {
      return localStorage.getItem('selectedVideoId') || 'None';
    } catch {
      return 'None';
    }
  });

  const [customBackgroundVideos, setCustomBackgroundVideos] = useState(() => {
    try {
      const stored = localStorage.getItem('customBackgroundVideos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [remoteBackgroundVideos, setRemoteBackgroundVideos] = useState([]);
  const [remoteBackgroundVideoSources, setRemoteBackgroundVideoSources] = useState([]);
  const [remoteBackgroundVideoSourceStatuses, setRemoteBackgroundVideoSourceStatuses] = useState([]);

  useEffect(() => {
    localStorage.setItem('selectedVideoId', selectedVideoId);
  }, [selectedVideoId]);

  useEffect(() => {
    localStorage.setItem('customBackgroundVideos', JSON.stringify(customBackgroundVideos));
  }, [customBackgroundVideos]);

  const refreshRemoteBackgroundVideos = useCallback(async () => {
    const sources = filterSourcesByAssetType(getRemoteMediaSources(), 'video');
    setRemoteBackgroundVideoSources(sources);

    if (sources.length === 0) {
      setRemoteBackgroundVideos([]);
      setRemoteBackgroundVideoSourceStatuses([]);
      return { remoteAssets: [], sourceStatuses: [] };
    }

    const { remoteAssets, sourceStatuses } = await loadRemoteMediaAssets(sources, 'video');
    setRemoteBackgroundVideos(remoteAssets);
    setRemoteBackgroundVideoSourceStatuses(sourceStatuses);
    return { remoteAssets, sourceStatuses };
  }, []);

  useEffect(() => {
    refreshRemoteBackgroundVideos();
  }, [refreshRemoteBackgroundVideos]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleSourcesChanged = () => {
      refreshRemoteBackgroundVideos();
    };

    window.addEventListener(REMOTE_MEDIA_SOURCES_EVENT, handleSourcesChanged);
    return () => {
      window.removeEventListener(REMOTE_MEDIA_SOURCES_EVENT, handleSourcesChanged);
    };
  }, [refreshRemoteBackgroundVideos]);

  useEffect(() => {
    if (selectedVideoId === 'None') {
      return;
    }

    const selectedExists = customBackgroundVideos.some((video) => video.id === selectedVideoId)
      || remoteBackgroundVideos.some((video) => video.id === selectedVideoId);

    if (!selectedExists) {
      setSelectedVideoId('None');
    }
  }, [customBackgroundVideos, remoteBackgroundVideos, selectedVideoId]);

  const getAllBackgroundVideos = useCallback(() => {
    return [
      { id: 'None', name: 'None', size: 0 },
      ...customBackgroundVideos,
      ...remoteBackgroundVideos.map((video) => ({
        id: video.id,
        name: video.name,
        size: video.bytes || 0,
        mimeType: video.mimeType,
        duration: video.duration,
        isRemote: true,
        sourceId: video.sourceId,
        sourceName: video.sourceName,
        provider: video.provider,
      })),
    ];
  }, [customBackgroundVideos, remoteBackgroundVideos]);

  const getBackgroundVideoUrl = useCallback(async (id) => {
    if (id === 'None' || !id) return null;

    if (fileStorageRef.current.has(id)) {
      return fileStorageRef.current.get(id).url;
    }

    try {
      const blob = await getFileBlob(`vid_${id}`);
      if (blob) {
        const url = URL.createObjectURL(blob);
        fileStorageRef.current.set(id, { url, blob });
        return url;
      }
    } catch (error) {
      console.error('Failed to fetch background video from IndexedDB:', error);
    }

    const remoteVideo = remoteBackgroundVideos.find((video) => video.id === id);
    if (remoteVideo) {
      return remoteVideo.url;
    }

    return null;
  }, [remoteBackgroundVideos]);

  const uploadBackgroundVideo = useCallback(async (file) => {
    if (!file) throw new Error('No file selected.');

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      throw new Error('Unsupported format. Please use MP4, WebM, or OGG.');
    }

    if (file.size > MAX_VIDEO_SIZE) {
      const sizeMB = (file.size / 1_048_576).toFixed(1);
      throw new Error(`File too large (${sizeMB} MB). Maximum allowed size is 50 MB.`);
    }

    const fileId = `custom_${Date.now()}`;
    const fileName = file.name.replace(/\.[^/.]+$/, '');

    try {
      await saveFileBlob(`vid_${fileId}`, file);
      const url = URL.createObjectURL(file);
      fileStorageRef.current.set(fileId, { url, blob: file });

      const newVideo = {
        id: fileId,
        name: fileName,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };

      setCustomBackgroundVideos(prev => [...prev, newVideo]);
      return newVideo;
    } catch (error) {
      console.error('Failed to upload background video:', error);
      throw error;
    }
  }, []);

  const deleteBackgroundVideo = useCallback(async (id) => {
    if (id === 'None') throw new Error('Cannot delete None.');

    const remoteVideo = remoteBackgroundVideos.find((video) => video.id === id);
    if (remoteVideo) {
      throw new Error('Remote videos are removed by deleting their source');
    }

    try {
      await deleteFileBlob(`vid_${id}`);
      setCustomBackgroundVideos(prev => prev.filter(v => v.id !== id));

      if (fileStorageRef.current.has(id)) {
        const entry = fileStorageRef.current.get(id);
        if (entry?.url) {
          try { URL.revokeObjectURL(entry.url); } catch { /* ignore */ }
        }
        fileStorageRef.current.delete(id);
      }

      if (selectedVideoId === id) {
        setSelectedVideoId('None');
      }
    } catch (error) {
      console.error('Failed to delete background video:', error);
      throw error;
    }
  }, [remoteBackgroundVideos, selectedVideoId]);

  const addRemoteBackgroundVideoSource = useCallback(async (sourceInput) => {
    const assetTypes = Array.from(new Set([...(sourceInput.assetTypes || []), 'video']));
    const source = persistRemoteMediaSource({
      ...sourceInput,
      assetTypes,
    });

    await refreshRemoteBackgroundVideos();
    return source;
  }, [refreshRemoteBackgroundVideos]);

  const deleteRemoteBackgroundVideoSource = useCallback(async (sourceId) => {
    const selectedSourceMatch = remoteBackgroundVideos.some(
      (video) => video.sourceId === sourceId && video.id === selectedVideoId
    );

    removePersistedRemoteMediaSource(sourceId);
    if (selectedSourceMatch) {
      setSelectedVideoId('None');
    }

    await refreshRemoteBackgroundVideos();
    return true;
  }, [remoteBackgroundVideos, refreshRemoteBackgroundVideos, selectedVideoId]);

  return {
    selectedVideoId,
    setSelectedVideoId,
    customBackgroundVideos,
    remoteBackgroundVideoSources,
    remoteBackgroundVideoSourceStatuses,
    getAllBackgroundVideos,
    getBackgroundVideoUrl,
    uploadBackgroundVideo,
    deleteBackgroundVideo,
    addRemoteBackgroundVideoSource,
    deleteRemoteBackgroundVideoSource,
    refreshRemoteBackgroundVideos,
  };
};

export default useBackgroundVideos;
