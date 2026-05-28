import React from 'react';
import { act, renderHook } from '@testing-library/react';
import useCompletionTracking from '../hooks/useCompletionTracking';

function useCompletionTrackingHarness(initialState = {}) {
  const [history, setHistory] = React.useState(initialState.history || []);
  const [currentStreak, setCurrentStreak] = React.useState(initialState.currentStreak || 0);
  const [lastCompletionDate, setLastCompletionDate] = React.useState(initialState.lastCompletionDate || null);
  const [totalCompletions, setTotalCompletions] = React.useState(initialState.totalCompletions || 0);
  const [achievements, setAchievements] = React.useState(initialState.achievements || []);
  const [firstTimerDate, setFirstTimerDate] = React.useState(initialState.firstTimerDate || null);
  const [monthlyStats, setMonthlyStats] = React.useState(initialState.monthlyStats || {});
  const [dailyChallenge, setDailyChallenge] = React.useState(initialState.dailyChallenge || null);
  const [timeCapsules, setTimeCapsules] = React.useState(initialState.timeCapsules || []);

  const tracking = useCompletionTracking({
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
  });

  return {
    ...tracking,
    state: {
      achievements,
      currentStreak,
      firstTimerDate,
      history,
      lastCompletionDate,
      monthlyStats,
      timeCapsules,
      totalCompletions,
    },
  };
}

describe('useCompletionTracking', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('unlocks the streak achievement when a consecutive completion reaches seven days', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { result } = renderHook(() => useCompletionTrackingHarness({
      currentStreak: 6,
      lastCompletionDate: yesterday.toDateString(),
      totalCompletions: 6,
    }));

    act(() => {
      result.current.addToHistory({
        type: 'Timer',
        name: 'Focus Session',
        totalSeconds: 1500,
      });
    });

    expect(result.current.state.currentStreak).toBe(7);
    expect(result.current.state.totalCompletions).toBe(7);
    expect(result.current.state.achievements).toContain('streak_7');
    expect(result.current.showAchievement?.name).toBe('Week Warrior');
  });
});