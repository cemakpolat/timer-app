import { act, renderHook } from '@testing-library/react';
import useAppDataManagement from '../hooks/useAppDataManagement';

describe('useAppDataManagement', () => {
  const OriginalFileReader = global.FileReader;

  afterEach(() => {
    global.FileReader = OriginalFileReader;
  });

  it('imports backup data into the provided setters', () => {
    const importedData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      saved: [{ name: 'Focus', duration: 25, unit: 'min' }],
      history: [{ id: 1, completedAt: new Date().toISOString() }],
      currentStreak: 4,
      lastCompletionDate: 'Wed May 28 2026',
      totalCompletions: 12,
      achievements: ['first_timer'],
      monthlyStats: { '2026-05': { completions: 12 } },
      firstTimerDate: '2026-05-01T10:00:00.000Z',
      timeCapsules: [{ id: 5, message: 'Keep going' }],
      theme: 'Ocean',
      settings: {
        alarmSoundType: 'Bell',
        alarmVolume: 0.8,
        repeatEnabled: true,
        weatherEffect: 'rain',
        ambientSoundType: 'Forest',
        ambientVolume: 0.4,
      },
    };

    global.FileReader = class MockFileReader {
      readAsText() {
        this.onload({ target: { result: JSON.stringify(importedData) } });
      }
    };

    const setters = {
      setAchievements: jest.fn(),
      setAlarmSoundType: jest.fn(),
      setAlarmVolume: jest.fn(),
      setAmbientSoundType: jest.fn(),
      setAmbientVolume: jest.fn(),
      setCurrentStreak: jest.fn(),
      setFirstTimerDate: jest.fn(),
      setHistory: jest.fn(),
      setLastCompletionDate: jest.fn(),
      setMonthlyStats: jest.fn(),
      setRepeatEnabled: jest.fn(),
      setSaved: jest.fn(),
      setTheme: jest.fn(),
      setTimeCapsules: jest.fn(),
      setTotalCompletions: jest.fn(),
      setWeatherEffect: jest.fn(),
    };

    const { result } = renderHook(() => useAppDataManagement({
      achievements: [],
      alarmSoundType: 'Default',
      alarmVolume: 1,
      ambientSoundType: 'None',
      ambientVolume: 1,
      currentStreak: 0,
      firstTimerDate: null,
      history: [],
      lastCompletionDate: null,
      monthlyStats: {},
      repeatEnabled: false,
      saved: [],
      themeName: 'Midnight',
      themes: [{ name: 'Midnight' }, { name: 'Ocean' }],
      timeCapsules: [],
      totalCompletions: 0,
      weatherEffect: 'none',
      ...setters,
    }));

    const event = { target: { files: [{}], value: 'selected-file' } };

    act(() => {
      result.current.importData(event);
    });

    expect(setters.setSaved).toHaveBeenCalledWith(importedData.saved);
    expect(setters.setHistory).toHaveBeenCalledWith(importedData.history);
    expect(setters.setCurrentStreak).toHaveBeenCalledWith(importedData.currentStreak);
    expect(setters.setAchievements).toHaveBeenCalledWith(importedData.achievements);
    expect(setters.setTheme).toHaveBeenCalledWith({ name: 'Ocean' });
    expect(setters.setAlarmSoundType).toHaveBeenCalledWith('Bell');
    expect(setters.setAmbientVolume).toHaveBeenCalledWith(0.4);
    expect(event.target.value).toBe('');
  });
});