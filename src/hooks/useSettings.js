import { useState, useEffect, useCallback, useRef } from 'react';
import { saveFileBlob, getFileBlob, deleteFileBlob, clearAllFileBlobs } from '../services/indexeddb';
import { logger } from '../utils/logger';

/**
 * Default weather configuration - centralized to avoid recreation
 */
const DEFAULT_WEATHER_CONFIG = {
  rain: { color: '#4682B4', opacity: 0.6 },
  winter: { color: '#FFFFFF', opacity: 0.6 },
  cloudy: { color: '#FFFFFF', opacity: 0.8 },
  sunny: { color: '#FFD700', opacity: 0.2 },
  spring: { color: '#FFB6C1', opacity: 0.7 },
  autumn: { color: '#D2691E', opacity: 0.7 },
  sakura: { color: '#FFB7C5', opacity: 0.8 },
  fireflies: { color: '#FFD700', opacity: 0.9 },
  butterflies: { color: '#FF69B4', opacity: 0.85 },
  fire: { color: '#FF6347', opacity: 0.7 },
  lanterns: { color: '#FF0000', opacity: 0.85 },
  aurora: { color: '#00FF80', opacity: 0.6 },
  desert: { color: '#DEB887', opacity: 0.5 },
  tropical: { color: '#FF69B4', opacity: 0.8 },
  coffee: { color: '#8B4513', opacity: 0.6 },
  fireplace: { color: '#FF4500', opacity: 0.8 }
};

/**
 * Safe localStorage getter with error handling
 */
const getSafeLocalStorage = (key, defaultValue, parser = (v) => v) => {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? parser(value) : defaultValue;
  } catch (error) {
    logger.error(`Failed to load ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Custom hook to manage application settings
 * Optimized to reduce localStorage operations and improve performance
 * Handles alarm sound, volume, animations, repeat preferences, and data export/import
 */
const useSettings = () => {
  // Alarm sound settings
  const [alarmSoundType, setAlarmSoundType] = useState(() => 
    getSafeLocalStorage('alarmSoundType', 'bell')
  );

  const [alarmVolume, setAlarmVolume] = useState(() => 
    getSafeLocalStorage('alarmVolume', 0.5, parseFloat)
  );

  // UI preferences
  const [repeatEnabled, setRepeatEnabled] = useState(() => 
    getSafeLocalStorage('repeatEnabled', false, v => v === 'true')
  );

  // Scene settings
  const [weatherEffect, setWeatherEffect] = useState(() => 
    getSafeLocalStorage('weatherEffect', 'none')
  );

  // Scene configuration (color, opacity)
  const [weatherConfig, setWeatherConfig] = useState(() => {
    try {
      const stored = localStorage.getItem('weatherConfig');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge stored config with defaults to ensure all keys exist
        return { ...DEFAULT_WEATHER_CONFIG, ...parsed };
      }
      return DEFAULT_WEATHER_CONFIG;
    } catch (error) {
      logger.error('Failed to load weatherConfig:', error);
      return DEFAULT_WEATHER_CONFIG;
    }
  });

  // Ambient sound settings
  const [ambientSoundType, setAmbientSoundType] = useState(() => 
    getSafeLocalStorage('ambientSoundType', 'None')
  );

  const [ambientVolume, setAmbientVolume] = useState(() => 
    getSafeLocalStorage('ambientVolume', 0.3, parseFloat)
  );

  // Custom music files - store file references in memory for this session
  const [customMusicFiles, setCustomMusicFiles] = useState(() => 
    getSafeLocalStorage('customMusicFiles', [], JSON.parse)
  );

  // In-memory storage for file data during session
  const fileStorageRef = useRef(new Map());
  
  // Track if settings have changed to batch localStorage writes
  const saveTimeoutRef = useRef(null);

  // On mount: restore persisted file blobs from IndexedDB for known metadata
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        for (const f of customMusicFiles) {
          try {
            const blob = await getFileBlob(f.id);
            if (blob && mounted) {
              const url = URL.createObjectURL(blob);
              fileStorageRef.current.set(f.id, { blob, url });
            }
          } catch (err) {
            logger.warn('Failed to restore blob for', f.id, err);
          }
        }
      } catch (err) {
        logger.error('Error restoring custom music files from IndexedDB', err);
      }
    })();
    return () => { mounted = false; };
  }, [customMusicFiles]); // Include customMusicFiles to ensure effect runs when it changes
  
  // Debounced localStorage save function to batch writes
  const debouncedSave = useCallback((key, value) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        logger.error(`Failed to save ${key}:`, error);
      }
    }, 100); // 100ms debounce
  }, []);

  // Batch persist all settings changes
  useEffect(() => {
    debouncedSave('alarmSoundType', alarmSoundType);
  }, [alarmSoundType, debouncedSave]);

  useEffect(() => {
    debouncedSave('alarmVolume', alarmVolume.toString());
  }, [alarmVolume, debouncedSave]);

  useEffect(() => {
    debouncedSave('repeatEnabled', repeatEnabled.toString());
  }, [repeatEnabled, debouncedSave]);

  useEffect(() => {
    debouncedSave('weatherEffect', weatherEffect);
  }, [weatherEffect, debouncedSave]);

  useEffect(() => {
    debouncedSave('weatherConfig', JSON.stringify(weatherConfig));
  }, [weatherConfig, debouncedSave]);

  useEffect(() => {
    debouncedSave('ambientSoundType', ambientSoundType);
  }, [ambientSoundType, debouncedSave]);

  useEffect(() => {
    debouncedSave('ambientVolume', ambientVolume.toString());
  }, [ambientVolume, debouncedSave]);

  useEffect(() => {
    debouncedSave('customMusicFiles', JSON.stringify(customMusicFiles));
  }, [customMusicFiles, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Export all data
  const exportData = useCallback((data) => {
    const allData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      ...data,
      settings: {
        alarmSoundType,
        alarmVolume,
        repeatEnabled,
        weatherEffect,
        ambientSoundType,
        ambientVolume,
      }
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: { message: '✅ Data exported successfully!', type: 'success', ttl: 3000 }
    }));
  }, [alarmSoundType, alarmVolume, repeatEnabled, weatherEffect, ambientSoundType, ambientVolume]);

  // Import data and return imported settings
  const importData = useCallback((event, onImportComplete) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Validate and import
        if (imported.version && imported.exportDate) {
          // Import settings if present
          if (imported.settings) {
            if (imported.settings.alarmSoundType) setAlarmSoundType(imported.settings.alarmSoundType);
            if (imported.settings.alarmVolume !== undefined) setAlarmVolume(imported.settings.alarmVolume);
            if (imported.settings.repeatEnabled !== undefined) setRepeatEnabled(imported.settings.repeatEnabled);
            if (imported.settings.weatherEffect) setWeatherEffect(imported.settings.weatherEffect);
            if (imported.settings.ambientSoundType) setAmbientSoundType(imported.settings.ambientSoundType);
            if (imported.settings.ambientVolume !== undefined) setAmbientVolume(imported.settings.ambientVolume);
          }

          // Call the callback with the rest of the data
          if (onImportComplete) {
            onImportComplete(imported);
          }

          window.dispatchEvent(new CustomEvent('app-toast', {
            detail: { message: '✅ Data imported successfully!', type: 'success', ttl: 3000 }
          }));
        } else {
          throw new Error('Invalid backup file');
        }
      } catch (error) {
        logger.error('Import error:', error);
        window.dispatchEvent(new CustomEvent('app-toast', {
          detail: { message: '❌ Failed to import data', type: 'error', ttl: 3000 }
        }));
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }, []);

  // Custom music file management
  const uploadCustomMusic = useCallback(async (file) => {
    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/ogg', 'audio/aac', 'audio/flac'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file format. Please upload MP3, WAV, OGG, AAC, or FLAC files.');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit.');
    }

    // Check for duplicate names
    const existingNames = customMusicFiles.map(f => f.name.toLowerCase());
    if (existingNames.includes(file.name.toLowerCase())) {
      throw new Error('A file with this name already exists.');
    }

    const fileId = Date.now().toString();

    // Persist blob to IndexedDB
    await saveFileBlob(fileId, file);

    // Create object URL for session playback and store in memory map
    const url = URL.createObjectURL(file);
    fileStorageRef.current.set(fileId, { blob: file, url });

    // Store only metadata in localStorage
    const extIndex = file.name.lastIndexOf('.');
    const ext = extIndex > 0 ? file.name.slice(extIndex) : '';
    const musicFile = {
      id: fileId,
      name: file.name,
      originalName: file.name,
      ext,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    };

    setCustomMusicFiles(prev => [...prev, musicFile]);
    return musicFile;
  }, [customMusicFiles]);

  const getCustomMusicUrl = useCallback((fileId) => {
    const entry = fileStorageRef.current.get(fileId);
    return entry ? entry.url : null;
  }, []);

  // Ensure the URL for a custom music file is available. If not present in memory,
  // try to load the blob from IndexedDB, create an object URL and cache it.
  const ensureCustomMusicUrl = useCallback(async (fileId) => {
    const entry = fileStorageRef.current.get(fileId);
    if (entry && entry.url) return entry.url;
    try {
      const blob = await getFileBlob(fileId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        fileStorageRef.current.set(fileId, { blob, url });
        return url;
      }
    } catch (err) {
      console.warn('Failed to load blob for', fileId, err);
    }
    return null;
  }, []);

  const deleteCustomMusic = useCallback((fileId) => {
    setCustomMusicFiles(prev => prev.filter(file => file.id !== fileId));
    const entry = fileStorageRef.current.get(fileId);
    if (entry && entry.url) {
      try { URL.revokeObjectURL(entry.url); } catch (e) { /* ignore */ }
    }
    fileStorageRef.current.delete(fileId);
    // Remove blob from IndexedDB
    deleteFileBlob(fileId).catch(err => logger.warn('Failed to delete blob from IDB', err));
  }, []);

  const renameCustomMusic = useCallback((fileId, newName) => {
    if (!newName || typeof newName !== 'string') return;
    setCustomMusicFiles(prev => prev.map(f => f.id === fileId ? { ...f, name: newName } : f));
  }, []);

  const resetSettings = useCallback(() => {
    setAlarmSoundType('bell');
    setAlarmVolume(0.5);
    setRepeatEnabled(false);
    setCustomMusicFiles([]);
    // Revoke object URLs and clear in-memory map
    for (const entry of fileStorageRef.current.values()) {
      if (entry && entry.url) {
        try { URL.revokeObjectURL(entry.url); } catch (e) { /* ignore */ }
      }
    }
    fileStorageRef.current.clear();
    // Clear IndexedDB store
    clearAllFileBlobs().catch(err => logger.warn('Failed to clear IDB store', err));
  }, []);

  return {
    // Sound settings
    alarmSoundType,
    setAlarmSoundType,
    alarmVolume,
    setAlarmVolume,
    
    // UI preferences
    repeatEnabled,
    setRepeatEnabled,
    weatherEffect,
    setWeatherEffect,
    weatherConfig,
    setWeatherConfig,
    
    // Ambient sound settings
    ambientSoundType,
    setAmbientSoundType,
    ambientVolume,
    setAmbientVolume,
    
    // Custom music files
    customMusicFiles,
    uploadCustomMusic,
    deleteCustomMusic,
    renameCustomMusic,
    getCustomMusicUrl,
    ensureCustomMusicUrl,
    
    // Data management
    exportData,
    importData,
    resetSettings,
  };
};

export default useSettings;
