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
import { BUILT_IN_BACKGROUND_IMAGES } from '../utils/constants';

/**
 * Custom hook to manage background images
 * Handles built-in and custom uploaded background images
 * Stores files in IndexedDB for persistence
 */
const useBackgroundImages = () => {
  // File storage ref for this session (holds object URLs)
  const fileStorageRef = useRef(new Map());

  // Selected background image (id)
  const [selectedBackgroundId, setSelectedBackgroundId] = useState(() => {
    try {
      return localStorage.getItem('selectedBackgroundId') || 'None';
    } catch (error) {
      console.error('Failed to load selectedBackgroundId:', error);
      return 'None';
    }
  });

  // Custom uploaded images (metadata only - files stored in IndexedDB)
  const [customBackgroundImages, setCustomBackgroundImages] = useState(() => {
    try {
      const stored = localStorage.getItem('customBackgroundImages');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load customBackgroundImages:', error);
      return [];
    }
  });

  const [remoteBackgroundImages, setRemoteBackgroundImages] = useState([]);
  const [remoteBackgroundImageSources, setRemoteBackgroundImageSources] = useState([]);
  const [remoteBackgroundImageSourceStatuses, setRemoteBackgroundImageSourceStatuses] = useState([]);

  // Persist selectedBackgroundId to localStorage
  useEffect(() => {
    localStorage.setItem('selectedBackgroundId', selectedBackgroundId);
  }, [selectedBackgroundId]);

  // Persist customBackgroundImages metadata to localStorage
  useEffect(() => {
    localStorage.setItem('customBackgroundImages', JSON.stringify(customBackgroundImages));
  }, [customBackgroundImages]);

  const refreshRemoteBackgroundImages = useCallback(async () => {
    const sources = filterSourcesByAssetType(getRemoteMediaSources(), 'image');
    setRemoteBackgroundImageSources(sources);

    if (sources.length === 0) {
      setRemoteBackgroundImages([]);
      setRemoteBackgroundImageSourceStatuses([]);
      return { remoteAssets: [], sourceStatuses: [] };
    }

    const { remoteAssets, sourceStatuses } = await loadRemoteMediaAssets(sources, 'image');
    setRemoteBackgroundImages(remoteAssets);
    setRemoteBackgroundImageSourceStatuses(sourceStatuses);
    return { remoteAssets, sourceStatuses };
  }, []);

  useEffect(() => {
    refreshRemoteBackgroundImages();
  }, [refreshRemoteBackgroundImages]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleSourcesChanged = () => {
      refreshRemoteBackgroundImages();
    };

    window.addEventListener(REMOTE_MEDIA_SOURCES_EVENT, handleSourcesChanged);

    return () => {
      window.removeEventListener(REMOTE_MEDIA_SOURCES_EVENT, handleSourcesChanged);
    };
  }, [refreshRemoteBackgroundImages]);

  useEffect(() => {
    if (selectedBackgroundId === 'None') {
      return;
    }

    const selectedExists = BUILT_IN_BACKGROUND_IMAGES.some((img) => img.id === selectedBackgroundId)
      || customBackgroundImages.some((img) => img.id === selectedBackgroundId)
      || remoteBackgroundImages.some((img) => img.id === selectedBackgroundId);

    if (!selectedExists) {
      setSelectedBackgroundId('None');
    }
  }, [selectedBackgroundId, customBackgroundImages, remoteBackgroundImages]);

  // Get all available background images (built-in + custom)
  const getAllBackgroundImages = useCallback(() => {
    const all = [
      { id: 'None', name: 'None', isBuiltIn: true, path: null },
      ...BUILT_IN_BACKGROUND_IMAGES,
      ...customBackgroundImages,
      ...remoteBackgroundImages.map((image) => ({
        id: image.id,
        name: image.name,
        isBuiltIn: false,
        isRemote: true,
        provider: image.provider,
        sourceId: image.sourceId,
        sourceName: image.sourceName,
        bytes: image.bytes,
        mimeType: image.mimeType,
      })),
    ];
    return all;
  }, [customBackgroundImages, remoteBackgroundImages]);

  // Get image URL (file or built-in path)
  const getBackgroundImageUrl = useCallback(async (id) => {
    if (id === 'None' || !id) return null;

    // Check if it's a built-in image
    const builtIn = BUILT_IN_BACKGROUND_IMAGES.find(img => img.id === id);
    if (builtIn) return builtIn.path;

    // Check if it's a custom image stored in memory (this session)
    if (fileStorageRef.current.has(id)) {
      return fileStorageRef.current.get(id).url;
    }

    // Try to fetch from IndexedDB
    try {
      const blob = await getFileBlob(`bg_${id}`);
      if (blob) {
        const url = URL.createObjectURL(blob);
        fileStorageRef.current.set(id, { url, blob });
        return url;
      }
    } catch (error) {
      console.error('Failed to fetch background image from IndexedDB:', error);
    }

    const remoteImage = remoteBackgroundImages.find((image) => image.id === id);
    if (remoteImage) {
      return remoteImage.url;
    }

    return null;
  }, [remoteBackgroundImages]);

  // Upload custom background image
  const uploadBackgroundImage = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }

    const fileId = `custom_${Date.now()}`;
    const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension

    try {
      // Save to IndexedDB
      await saveFileBlob(`bg_${fileId}`, file);

      // Create object URL for this session
      const url = URL.createObjectURL(file);
      fileStorageRef.current.set(fileId, { url, blob: file });

      // Add to custom images list
      const newImage = {
        id: fileId,
        name: fileName,
        isBuiltIn: false,
        uploadedAt: new Date().toISOString()
      };

      setCustomBackgroundImages(prev => [...prev, newImage]);
      return newImage;
    } catch (error) {
      console.error('Failed to upload background image:', error);
      throw error;
    }
  }, []);

  // Delete background image
  const deleteBackgroundImage = useCallback(async (id) => {
    if (id === 'None') {
      throw new Error('Cannot delete None background');
    }

    const remoteImage = remoteBackgroundImages.find((image) => image.id === id);
    if (remoteImage) {
      throw new Error('Remote background images are removed by deleting their source');
    }

    // Check if built-in image (cannot delete)
    const builtIn = BUILT_IN_BACKGROUND_IMAGES.find(img => img.id === id);
    if (builtIn) {
      throw new Error('Cannot delete built-in background images');
    }

    try {
      // Delete from IndexedDB
      await deleteFileBlob(`bg_${id}`);

      // Remove from custom images list
      setCustomBackgroundImages(prev => prev.filter(img => img.id !== id));

      // Revoke object URL if in memory
      if (fileStorageRef.current.has(id)) {
        const entry = fileStorageRef.current.get(id);
        if (entry && entry.url) {
          try {
            URL.revokeObjectURL(entry.url);
          } catch (e) {
            /* ignore */
          }
        }
        fileStorageRef.current.delete(id);
      }

      // Reset to 'None' if deleted image was selected
      if (selectedBackgroundId === id) {
        setSelectedBackgroundId('None');
      }

      return true;
    } catch (error) {
      console.error('Failed to delete background image:', error);
      throw error;
    }
  }, [remoteBackgroundImages, selectedBackgroundId]);

  const addRemoteBackgroundImageSource = useCallback(async (sourceInput) => {
    const assetTypes = Array.from(new Set([...(sourceInput.assetTypes || []), 'image']));
    const source = persistRemoteMediaSource({
      ...sourceInput,
      assetTypes,
    });

    await refreshRemoteBackgroundImages();
    return source;
  }, [refreshRemoteBackgroundImages]);

  const deleteRemoteBackgroundImageSource = useCallback(async (sourceId) => {
    const selectedSourceMatch = remoteBackgroundImages.some(
      (image) => image.sourceId === sourceId && image.id === selectedBackgroundId
    );

    removePersistedRemoteMediaSource(sourceId);
    if (selectedSourceMatch) {
      setSelectedBackgroundId('None');
    }

    await refreshRemoteBackgroundImages();
    return true;
  }, [remoteBackgroundImages, refreshRemoteBackgroundImages, selectedBackgroundId]);

  // Rename background image
  const renameBackgroundImage = useCallback((id, newName) => {
    const customImg = customBackgroundImages.find(img => img.id === id);
    if (!customImg) return;

    setCustomBackgroundImages(prev =>
      prev.map(img => img.id === id ? { ...img, name: newName } : img)
    );
  }, [customBackgroundImages]);

  return {
    selectedBackgroundId,
    setSelectedBackgroundId,
    customBackgroundImages,
    remoteBackgroundImageSources,
    remoteBackgroundImageSourceStatuses,
    getAllBackgroundImages,
    getBackgroundImageUrl,
    uploadBackgroundImage,
    deleteBackgroundImage,
    addRemoteBackgroundImageSource,
    deleteRemoteBackgroundImageSource,
    refreshRemoteBackgroundImages,
    renameBackgroundImage,
  };
};

export default useBackgroundImages;
