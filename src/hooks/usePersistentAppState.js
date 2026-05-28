import { useCallback, useEffect, useState } from 'react';

function readJsonStorage(key, fallbackValue) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallbackValue;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return fallbackValue;
  }
}

function readNumberStorage(key, fallbackValue = 0) {
  try {
    const stored = localStorage.getItem(key);
    const parsed = parseInt(stored, 10);
    return Number.isNaN(parsed) ? fallbackValue : parsed;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return fallbackValue;
  }
}

function readStringStorage(key, fallbackValue = null) {
  try {
    return localStorage.getItem(key) || fallbackValue;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return fallbackValue;
  }
}

function readBooleanStorage(key, fallbackValue = false) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallbackValue : stored === 'true';
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return fallbackValue;
  }
}

function createDailyChallenge() {
  const challenges = [
    { type: 'completions', target: 5, text: 'Complete 5 timers today', icon: '🎯' },
    { type: 'time', target: 120, text: 'Focus for 2 hours total', icon: '⏱️' },
    { type: 'streak', target: 1, text: 'Maintain your streak', icon: '🔥' },
    { type: 'morning', target: 1, text: 'Complete a timer before 10 AM', icon: '🌅' },
    { type: 'pomodoro', target: 4, text: 'Complete 4 Pomodoros (25min each)', icon: '🍅' },
  ];
  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
  return { ...randomChallenge, date: new Date().toDateString(), progress: 0 };
}

function loadDailyChallenge() {
  try {
    const stored = localStorage.getItem('dailyChallenge');
    if (stored) {
      const challenge = JSON.parse(stored);
      const today = new Date().toDateString();
      if (challenge.date === today) {
        return challenge;
      }
    }
  } catch (error) {
    console.error('Failed to load dailyChallenge from localStorage:', error);
  }

  return createDailyChallenge();
}

export default function usePersistentAppState(defaultSavedTimers) {
  const [saved, setSaved] = useState(() => readJsonStorage('savedTimers', defaultSavedTimers));
  const [history, setHistory] = useState(() => readJsonStorage('timerHistory', []));
  const [repeatEnabled, setRepeatEnabled] = useState(() => readBooleanStorage('repeatEnabled', false));
  const [timerVisualization, setTimerVisualization] = useState(() => readStringStorage('timerVisualization', 'default'));
  const [cleanMode, setCleanMode] = useState(() => readBooleanStorage('cleanMode', false));
  const [currentStreak, setCurrentStreak] = useState(() => readNumberStorage('currentStreak', 0));
  const [lastCompletionDate, setLastCompletionDate] = useState(() => readStringStorage('lastCompletionDate', null));
  const [totalCompletions, setTotalCompletions] = useState(() => readNumberStorage('totalCompletions', 0));
  const [achievements, setAchievements] = useState(() => readJsonStorage('achievements', []));
  const [firstTimerDate, setFirstTimerDate] = useState(() => readStringStorage('firstTimerDate', null));
  const [monthlyStats, setMonthlyStats] = useState(() => readJsonStorage('monthlyStats', {}));
  const [dailyChallenge, setDailyChallenge] = useState(loadDailyChallenge);
  const [timeCapsules, setTimeCapsules] = useState(() => readJsonStorage('timeCapsules', []));

  useEffect(() => localStorage.setItem('savedTimers', JSON.stringify(saved)), [saved]);
  useEffect(() => localStorage.setItem('timerHistory', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('repeatEnabled', repeatEnabled), [repeatEnabled]);
  useEffect(() => localStorage.setItem('timerVisualization', timerVisualization), [timerVisualization]);
  useEffect(() => localStorage.setItem('cleanMode', cleanMode), [cleanMode]);
  useEffect(() => localStorage.setItem('currentStreak', currentStreak.toString()), [currentStreak]);
  useEffect(() => localStorage.setItem('lastCompletionDate', lastCompletionDate), [lastCompletionDate]);
  useEffect(() => localStorage.setItem('totalCompletions', totalCompletions.toString()), [totalCompletions]);
  useEffect(() => localStorage.setItem('achievements', JSON.stringify(achievements)), [achievements]);
  useEffect(() => localStorage.setItem('monthlyStats', JSON.stringify(monthlyStats)), [monthlyStats]);
  useEffect(() => {
    if (firstTimerDate) {
      localStorage.setItem('firstTimerDate', firstTimerDate);
    }
  }, [firstTimerDate]);
  useEffect(() => localStorage.setItem('dailyChallenge', JSON.stringify(dailyChallenge)), [dailyChallenge]);
  useEffect(() => localStorage.setItem('timeCapsules', JSON.stringify(timeCapsules)), [timeCapsules]);

  const toggleCleanMode = useCallback(() => {
    setCleanMode((value) => !value);
  }, []);

  const resetPersistentState = useCallback(() => {
    setSaved(defaultSavedTimers);
    setHistory([]);
    setRepeatEnabled(false);
    setTimerVisualization('default');
    setCleanMode(false);
    setCurrentStreak(0);
    setLastCompletionDate(null);
    setTotalCompletions(0);
    setAchievements([]);
    setFirstTimerDate(null);
    setMonthlyStats({});
    setDailyChallenge(createDailyChallenge());
    setTimeCapsules([]);
  }, [defaultSavedTimers]);

  return {
    saved,
    setSaved,
    history,
    setHistory,
    repeatEnabled,
    setRepeatEnabled,
    timerVisualization,
    setTimerVisualization,
    cleanMode,
    toggleCleanMode,
    currentStreak,
    setCurrentStreak,
    lastCompletionDate,
    setLastCompletionDate,
    totalCompletions,
    setTotalCompletions,
    achievements,
    setAchievements,
    firstTimerDate,
    setFirstTimerDate,
    monthlyStats,
    setMonthlyStats,
    dailyChallenge,
    setDailyChallenge,
    timeCapsules,
    setTimeCapsules,
    resetPersistentState,
  };
}