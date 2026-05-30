import { useCallback } from 'react';

function dispatchDataToast(message, type = 'info', ttl = 3000) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type, ttl } }));
}

export default function useAppDataManagement({
  achievements,
  alarmSoundType,
  alarmVolume,
  ambientSoundType,
  ambientVolume,
  currentStreak,
  firstTimerDate,
  history,
  lastCompletionDate,
  monthlyStats,
  repeatEnabled,
  saved,
  setAchievements,
  setAlarmSoundType,
  setAlarmVolume,
  setAmbientSoundType,
  setAmbientVolume,
  setCurrentStreak,
  setFirstTimerDate,
  setHistory,
  setLastCompletionDate,
  setMonthlyStats,
  setRepeatEnabled,
  setSaved,
  setTheme,
  setTimeCapsules,
  setTotalCompletions,
  setWeatherEffect,
  setWeatherEffectFavorites,
  themeName,
  themes,
  timeCapsules,
  totalCompletions,
  weatherEffect,
  weatherEffectFavorites,
}) {
  const exportData = useCallback(() => {
    const allData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      saved,
      history,
      currentStreak,
      lastCompletionDate,
      totalCompletions,
      achievements,
      monthlyStats,
      firstTimerDate,
      timeCapsules: timeCapsules.filter((capsule) => !capsule.opened),
      theme: themeName,
      settings: {
        alarmSoundType,
        alarmVolume,
        repeatEnabled,
        weatherEffect,
        weatherEffectFavorites,
        ambientSoundType,
        ambientVolume,
      },
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    dispatchDataToast('✅ Data exported successfully!', 'success');
  }, [
    achievements,
    alarmSoundType,
    alarmVolume,
    ambientSoundType,
    ambientVolume,
    currentStreak,
    firstTimerDate,
    history,
    lastCompletionDate,
    monthlyStats,
    repeatEnabled,
    saved,
    themeName,
    timeCapsules,
    totalCompletions,
    weatherEffect,
    weatherEffectFavorites,
  ]);

  const importData = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const imported = JSON.parse(loadEvent.target.result);

        if (!imported.version || !imported.exportDate) {
          throw new Error('Invalid backup file');
        }

        if (imported.saved) setSaved(imported.saved);
        if (imported.history) setHistory(imported.history);
        if (imported.currentStreak !== undefined) setCurrentStreak(imported.currentStreak);
        if (imported.lastCompletionDate) setLastCompletionDate(imported.lastCompletionDate);
        if (imported.totalCompletions !== undefined) setTotalCompletions(imported.totalCompletions);
        if (imported.achievements) setAchievements(imported.achievements);
        if (imported.monthlyStats) setMonthlyStats(imported.monthlyStats);
        if (imported.firstTimerDate) setFirstTimerDate(imported.firstTimerDate);
        if (imported.timeCapsules) setTimeCapsules(imported.timeCapsules);

        if (imported.theme) {
          const importedTheme = themes.find((item) => item.name === imported.theme);
          if (importedTheme) {
            setTheme(importedTheme);
          }
        }

        if (imported.settings) {
          if (imported.settings.alarmSoundType) setAlarmSoundType(imported.settings.alarmSoundType);
          if (imported.settings.alarmVolume !== undefined) setAlarmVolume(imported.settings.alarmVolume);
          if (imported.settings.repeatEnabled !== undefined) setRepeatEnabled(imported.settings.repeatEnabled);
          if (imported.settings.weatherEffect) setWeatherEffect(imported.settings.weatherEffect);
          if (Array.isArray(imported.settings.weatherEffectFavorites)) {
            setWeatherEffectFavorites(imported.settings.weatherEffectFavorites.filter((item) => typeof item === 'string'));
          }
          if (imported.settings.ambientSoundType) setAmbientSoundType(imported.settings.ambientSoundType);
          if (imported.settings.ambientVolume !== undefined) setAmbientVolume(imported.settings.ambientVolume);
        }

        dispatchDataToast('✅ Data imported successfully!', 'success');
      } catch (error) {
        dispatchDataToast('❌ Failed to import data', 'error');
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  }, [
    setAchievements,
    setAlarmSoundType,
    setAlarmVolume,
    setAmbientSoundType,
    setAmbientVolume,
    setCurrentStreak,
    setFirstTimerDate,
    setHistory,
    setLastCompletionDate,
    setMonthlyStats,
    setRepeatEnabled,
    setSaved,
    setTheme,
    setTimeCapsules,
    setTotalCompletions,
    setWeatherEffect,
    setWeatherEffectFavorites,
    themes,
  ]);

  return {
    exportData,
    importData,
  };
}