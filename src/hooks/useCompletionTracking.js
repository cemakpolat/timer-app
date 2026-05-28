import { useCallback, useEffect, useRef, useState } from 'react';

const ACHIEVEMENT_DEFINITIONS = [
  { id: 'first_timer', name: 'First Steps', description: 'Complete your first timer', icon: '🎯', requirement: 1 },
  { id: 'early_bird', name: 'Early Bird', description: 'Complete a timer before 7 AM', icon: '🌅', checkTime: true },
  { id: 'night_owl', name: 'Night Owl', description: 'Complete a timer after 10 PM', icon: '🦉', checkTime: true },
  { id: 'century_club', name: 'Century Club', description: 'Complete 100 timers', icon: '💯', requirement: 100 },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: '🔥', streak: 7 },
  { id: 'streak_30', name: 'Month Master', description: '30-day streak', icon: '👑', streak: 30 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete 10 timers in one day', icon: '⚡', dailyCount: 10 },
  { id: 'dedicated', name: 'Dedicated', description: 'Complete 500 timers', icon: '🏆', requirement: 500 },
];

function dispatchAppToast(message, type = 'info', ttl = 3000) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type, ttl } }));
}

function getNextDailyChallengeProgress(dailyChallenge, entry, today) {
  if (!dailyChallenge || dailyChallenge.date !== today) {
    return null;
  }

  if (dailyChallenge.type === 'completions') {
    return dailyChallenge.progress + 1;
  }

  if (dailyChallenge.type === 'time') {
    return dailyChallenge.progress + Math.floor((entry.totalSeconds || 0) / 60);
  }

  if (dailyChallenge.type === 'morning') {
    return new Date().getHours() < 10 ? 1 : dailyChallenge.progress;
  }

  if (dailyChallenge.type === 'pomodoro') {
    return entry.totalSeconds >= 1400 && entry.totalSeconds <= 1600
      ? dailyChallenge.progress + 1
      : dailyChallenge.progress;
  }

  return dailyChallenge.progress;
}

export default function useCompletionTracking({
  history,
  setHistory,
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
  setMonthlyStats,
  dailyChallenge,
  setDailyChallenge,
  timeCapsules,
  setTimeCapsules,
}) {
  const [showAchievement, setShowAchievement] = useState(null);
  const [showCapsuleNotification, setShowCapsuleNotification] = useState(null);
  const achievementTimeoutRef = useRef(null);

  useEffect(() => () => {
    if (achievementTimeoutRef.current) {
      clearTimeout(achievementTimeoutRef.current);
      achievementTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    const now = Date.now();
    const readyCapsules = timeCapsules.filter((capsule) => capsule.openAt <= now && !capsule.opened);

    if (readyCapsules.length === 0) {
      return;
    }

    setShowCapsuleNotification(readyCapsules[readyCapsules.length - 1]);
    setTimeCapsules((previousCapsules) => previousCapsules.map((capsule) => (
      capsule.openAt <= now && !capsule.opened
        ? { ...capsule, opened: true }
        : capsule
    )));
  }, [timeCapsules, setTimeCapsules]);

  const dismissCapsuleNotification = useCallback(() => {
    setShowCapsuleNotification(null);
  }, []);

  const checkAchievements = useCallback(({ nextHistory, nextStreak, nextTotalCompletions }) => {
    const newAchievements = [];
    const currentHour = new Date().getHours();

    ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
      if (achievements.includes(achievement.id)) {
        return;
      }

      let unlocked = false;

      if (achievement.requirement && nextTotalCompletions >= achievement.requirement) {
        unlocked = true;
      }

      if (achievement.streak && nextStreak >= achievement.streak) {
        unlocked = true;
      }

      if (achievement.checkTime) {
        if (achievement.id === 'early_bird' && currentHour < 7) {
          unlocked = true;
        }

        if (achievement.id === 'night_owl' && currentHour >= 22) {
          unlocked = true;
        }
      }

      if (achievement.dailyCount) {
        const today = new Date().toDateString();
        const todayCompletions = nextHistory.filter((item) => new Date(item.completedAt).toDateString() === today).length;
        if (todayCompletions >= achievement.dailyCount) {
          unlocked = true;
        }
      }

      if (!unlocked) {
        return;
      }

      newAchievements.push(achievement.id);
      setShowAchievement(achievement);

      if (achievementTimeoutRef.current) {
        clearTimeout(achievementTimeoutRef.current);
      }

      achievementTimeoutRef.current = setTimeout(() => {
        setShowAchievement(null);
        achievementTimeoutRef.current = null;
      }, 5000);
    });

    if (newAchievements.length > 0) {
      setAchievements((previousAchievements) => [
        ...previousAchievements,
        ...newAchievements.filter((id) => !previousAchievements.includes(id)),
      ]);
    }
  }, [achievements, setAchievements]);

  const addToHistory = useCallback((entry) => {
    const completedAt = new Date().toISOString();
    const historyEntry = { ...entry, completedAt, id: Date.now() };
    const nextHistory = [historyEntry, ...history].slice(0, 10);
    const today = new Date(completedAt).toDateString();
    const yesterday = new Date(completedAt);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    let nextStreak = currentStreak;
    if (lastCompletionDate === yesterdayString) {
      nextStreak = currentStreak + 1;
    } else if (lastCompletionDate !== today) {
      nextStreak = 1;
    }

    const nextTotalCompletions = totalCompletions + 1;

    setHistory(nextHistory);

    if (!firstTimerDate) {
      setFirstTimerDate(completedAt);
    }

    const currentMonth = completedAt.slice(0, 7);
    setMonthlyStats((previousStats) => ({
      ...previousStats,
      [currentMonth]: {
        completions: (previousStats[currentMonth]?.completions || 0) + 1,
        totalSeconds: (previousStats[currentMonth]?.totalSeconds || 0) + (entry.totalSeconds || 0),
        bestStreak: Math.max(previousStats[currentMonth]?.bestStreak || 0, nextStreak),
      },
    }));

    setTotalCompletions(nextTotalCompletions);

    if (lastCompletionDate !== today) {
      setCurrentStreak(nextStreak);
      setLastCompletionDate(today);

      if (lastCompletionDate === yesterdayString) {
        dispatchAppToast(`🔥 ${nextStreak} day streak!`, 'success', 3000);
      }
    }

    const nextChallengeProgress = getNextDailyChallengeProgress(dailyChallenge, entry, today);
    if (nextChallengeProgress !== null) {
      setDailyChallenge((previousChallenge) => ({ ...previousChallenge, progress: nextChallengeProgress }));

      if (nextChallengeProgress >= dailyChallenge.target && dailyChallenge.progress < dailyChallenge.target) {
        dispatchAppToast('🎯 Daily Challenge Complete!', 'success', 3000);
      }
    }

    checkAchievements({ nextHistory, nextStreak, nextTotalCompletions });
  }, [
    history,
    setHistory,
    currentStreak,
    setCurrentStreak,
    lastCompletionDate,
    setLastCompletionDate,
    totalCompletions,
    setTotalCompletions,
    firstTimerDate,
    setFirstTimerDate,
    setMonthlyStats,
    dailyChallenge,
    setDailyChallenge,
    checkAchievements,
  ]);

  const createTimeCapsule = useCallback((message) => {
    if (!message.trim()) {
      return false;
    }

    const newCapsule = {
      id: Date.now(),
      message,
      createdAt: Date.now(),
      openAt: Date.now() + (30 * 24 * 60 * 60 * 1000),
      opened: false,
    };

    setTimeCapsules((previousCapsules) => [...previousCapsules, newCapsule]);
    dispatchAppToast(`📩 Time capsule created! You'll see it in 30 days`, 'success', 3000);
    return true;
  }, [setTimeCapsules]);

  return {
    achievementDefinitions: ACHIEVEMENT_DEFINITIONS,
    showAchievement,
    showCapsuleNotification,
    dismissCapsuleNotification,
    addToHistory,
    createTimeCapsule,
  };
}