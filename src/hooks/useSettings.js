import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage application settings
 * Handles alarm sound, volume, animations, repeat preferences, and data export/import
 */
const useSettings = () => {
  // Alarm sound settings
  const [alarmSoundType, setAlarmSoundType] = useState(() => {
    try {
      return localStorage.getItem('alarmSoundType') || 'bell';
    } catch (error) {
      console.error('Failed to load alarmSoundType:', error);
      return 'bell';
    }
  });

  const [alarmVolume, setAlarmVolume] = useState(() => {
    try {
      return parseFloat(localStorage.getItem('alarmVolume')) || 0.5;
    } catch (error) {
      console.error('Failed to load alarmVolume:', error);
      return 0.5;
    }
  });

  // UI preferences
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    try {
      return localStorage.getItem('animationsEnabled') !== 'false';
    } catch (error) {
      console.error('Failed to load animationsEnabled:', error);
      return true;
    }
  });

  const [repeatEnabled, setRepeatEnabled] = useState(() => {
    try {
      return localStorage.getItem('repeatEnabled') === 'true';
    } catch (error) {
      console.error('Failed to load repeatEnabled:', error);
      return false;
    }
  });

  // Weather effect settings
  const [weatherEffect, setWeatherEffect] = useState(() => {
    try {
      return localStorage.getItem('weatherEffect') || 'none';
    } catch (error) {
      console.error('Failed to load weatherEffect:', error);
      return 'none';
    }
  });

  // Weather effect configuration (color, opacity)
  const [weatherConfig, setWeatherConfig] = useState(() => {
    const defaults = {
      rain: { color: '#4682B4', opacity: 0.6 },
      winter: { color: '#FFFFFF', opacity: 0.6 },
      cloudy: { color: '#FFFFFF', opacity: 0.8 },
      sunny: { color: '#FFD700', opacity: 0.2 }
    };

    try {
      const stored = localStorage.getItem('weatherConfig');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge stored config with defaults to ensure all keys exist
        return { ...defaults, ...parsed };
      }
      return defaults;
    } catch (error) {
      console.error('Failed to load weatherConfig:', error);
      return defaults;
    }
  });

  // Ambient sound settings
  const [ambientSoundType, setAmbientSoundType] = useState(() => {
    try {
      return localStorage.getItem('ambientSoundType') || 'None';
    } catch (error) {
      console.error('Failed to load ambientSoundType:', error);
      return 'None';
    }
  });

  const [ambientVolume, setAmbientVolume] = useState(() => {
    try {
      return parseFloat(localStorage.getItem('ambientVolume')) || 0.3;
    } catch (error) {
      console.error('Failed to load ambientVolume:', error);
      return 0.3;
    }
  });
  useEffect(() => {
    localStorage.setItem('alarmSoundType', alarmSoundType);
  }, [alarmSoundType]);

  useEffect(() => {
    localStorage.setItem('alarmVolume', alarmVolume.toString());
  }, [alarmVolume]);

  useEffect(() => {
    localStorage.setItem('animationsEnabled', animationsEnabled.toString());
  }, [animationsEnabled]);

  useEffect(() => {
    localStorage.setItem('repeatEnabled', repeatEnabled.toString());
  }, [repeatEnabled]);

  useEffect(() => {
    localStorage.setItem('weatherEffect', weatherEffect);
  }, [weatherEffect]);

  useEffect(() => {
    localStorage.setItem('weatherConfig', JSON.stringify(weatherConfig));
  }, [weatherConfig]);

  useEffect(() => {
    localStorage.setItem('ambientSoundType', ambientSoundType);
  }, [ambientSoundType]);

  useEffect(() => {
    localStorage.setItem('ambientVolume', ambientVolume.toString());
  }, [ambientVolume]);

  // Export all data
  const exportData = useCallback((data) => {
    const allData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      ...data,
      settings: {
        alarmSoundType,
        alarmVolume,
        animationsEnabled,
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
  }, [alarmSoundType, alarmVolume, animationsEnabled, repeatEnabled, weatherEffect, ambientSoundType, ambientVolume]);

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
            if (imported.settings.animationsEnabled !== undefined) setAnimationsEnabled(imported.settings.animationsEnabled);
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
        console.error('Import error:', error);
        window.dispatchEvent(new CustomEvent('app-toast', {
          detail: { message: '❌ Failed to import data', type: 'error', ttl: 3000 }
        }));
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }, []);

  // Reset all settings to defaults
  const resetSettings = useCallback(() => {
    setAlarmSoundType('bell');
    setAlarmVolume(0.5);
    setAnimationsEnabled(true);
    setRepeatEnabled(false);
  }, []);

  return {
    // Sound settings
    alarmSoundType,
    setAlarmSoundType,
    alarmVolume,
    setAlarmVolume,
    
    // UI preferences
    animationsEnabled,
    setAnimationsEnabled,
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
    
    // Data management
    exportData,
    importData,
    resetSettings,
  };
};

export default useSettings;
