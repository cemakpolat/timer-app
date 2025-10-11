import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS, ACHIEVEMENTS, LIMITS } from '../utils/constants';
import { getTodayString, getYesterdayString } from '../utils/helpers';

/**
 * Custom hook for gamification features (streaks, achievements, history)
 * @returns {Object} Gamification state and controls
 */
export const useGamification = () => {
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.HISTORY, []);
  const [currentStreak, setCurrentStreak] = useLocalStorage(STORAGE_KEYS.CURRENT_STREAK, 0);
  const [lastCompletionDate, setLastCompletionDate] = useLocalStorage(STORAGE_KEYS.LAST_COMPLETION_DATE, null);
  const [achievements, setAchievements] = useLocalStorage(STORAGE_KEYS.ACHIEVEMENTS, []);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Display toast notification
  const showNotification = useCallback((message, duration = 3000) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  }, []);

  // Check and unlock achievement
  const checkAchievement = useCallback((achievementId, achievementData) => {
    if (!achievements.some(a => a.id === achievementId)) {
      const today = getTodayString();
      const newAchievement = {
        ...achievementData,
        id: achievementId,
        date: today
      };
      setAchievements(prev => [...prev, newAchievement]);
      showNotification(`Achievement Unlocked: ${achievementData.name}! 🎉`);
      return true;
    }
    return false;
  }, [achievements, setAchievements, showNotification]);

  // Update streaks based on completion
  const updateStreaks = useCallback(() => {
    const today = getTodayString();
    const yesterday = getYesterdayString();

    if (lastCompletionDate === today) {
      // Already completed today, no streak change
      return currentStreak;
    } else if (lastCompletionDate === yesterday) {
      // Consecutive day completion
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setLastCompletionDate(today);
      showNotification(`Streak: ${newStreak} day${newStreak > 1 ? 's' : ''}! 🔥`);

      // Check streak achievements
      if (newStreak === 7) {
        checkAchievement(ACHIEVEMENTS.WEEK_STREAK.id, ACHIEVEMENTS.WEEK_STREAK);
      } else if (newStreak === 30) {
        checkAchievement(ACHIEVEMENTS.MONTH_STREAK.id, ACHIEVEMENTS.MONTH_STREAK);
      }

      return newStreak;
    } else {
      // Streak broken, start new one
      setCurrentStreak(1);
      setLastCompletionDate(today);
      return 1;
    }
  }, [lastCompletionDate, currentStreak, setCurrentStreak, setLastCompletionDate, showNotification, checkAchievement]);

  // Add entry to history
  const addToHistory = useCallback((entry) => {
    const historyEntry = {
      ...entry,
      completedAt: new Date().toISOString(),
      id: Date.now()
    };

    setHistory(prev => [historyEntry, ...prev].slice(0, LIMITS.MAX_HISTORY));

    // Update streaks
    updateStreaks();

    // Check first completion achievement
    if (history.length === 0) {
      checkAchievement(
        ACHIEVEMENTS.FIRST_COMPLETION.id,
        ACHIEVEMENTS.FIRST_COMPLETION
      );
    }

    // Check century achievement (100 completions)
    if (history.length + 1 >= 100) {
      checkAchievement(ACHIEVEMENTS.CENTURY.id, ACHIEVEMENTS.CENTURY);
    }
  }, [history, setHistory, updateStreaks, checkAchievement]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    showNotification('History cleared');
  }, [setHistory, showNotification]);

  // Get recent timers from history
  const getRecentTimers = useCallback((limit = LIMITS.MAX_RECENT_TIMERS) => {
    const timerEntries = history.filter(entry => entry.type === 'Timer');
    const uniqueTimers = new Map();

    // Get unique timers (latest occurrence of each timer name)
    timerEntries.forEach(entry => {
      if (!uniqueTimers.has(entry.name)) {
        uniqueTimers.set(entry.name, entry);
      }
    });

    return Array.from(uniqueTimers.values()).slice(0, limit);
  }, [history]);

  // Get stats
  const getStats = useCallback(() => {
    const totalCompletions = history.length;
    const totalTime = history.reduce((sum, entry) => sum + (entry.totalSeconds || 0), 0);
    const avgTime = totalCompletions > 0 ? Math.floor(totalTime / totalCompletions) : 0;

    return {
      totalCompletions,
      totalTime,
      avgTime,
      currentStreak,
      achievementsCount: achievements.length
    };
  }, [history, currentStreak, achievements]);

  return {
    history,
    currentStreak,
    lastCompletionDate,
    achievements,
    showToast,
    toastMessage,
    addToHistory,
    clearHistory,
    getRecentTimers,
    updateStreaks,
    checkAchievement,
    showNotification,
    getStats
  };
};