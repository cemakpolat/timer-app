import { useState, useEffect, useCallback, useRef } from 'react';
import { saveFileBlob, getFileBlob, deleteFileBlob } from '../services/indexeddb';
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

  // Persist selectedBackgroundId to localStorage
  useEffect(() => {
    localStorage.setItem('selectedBackgroundId', selectedBackgroundId);
  }, [selectedBackgroundId]);

  // Persist customBackgroundImages metadata to localStorage
  useEffect(() => {
    localStorage.setItem('customBackgroundImages', JSON.stringify(customBackgroundImages));
  }, [customBackgroundImages]);

  // Get all available background images (built-in + custom)
  const getAllBackgroundImages = useCallback(() => {
    const all = [
      { id: 'None', name: 'None', isBuiltIn: true, path: null },
      ...BUILT_IN_BACKGROUND_IMAGES,
      ...customBackgroundImages
    ];
    return all;
  }, [customBackgroundImages]);

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

    return null;
  }, []);

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
  }, [selectedBackgroundId]);

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
    getAllBackgroundImages,
    getBackgroundImageUrl,
    uploadBackgroundImage,
    deleteBackgroundImage,
    renameBackgroundImage,
  };
};

export default useBackgroundImages;
