import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS, DEFAULT_SAVED_TIMERS } from '../utils/constants';

const TimerContext = createContext();

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  // Saved timers
  const [savedTimers, setSavedTimers] = useLocalStorage(
    STORAGE_KEYS.SAVED_TIMERS,
    DEFAULT_SAVED_TIMERS
  );

  // Interval settings
  const [work, setWork] = useState(40);
  const [rest, setRest] = useState(20);
  const [rounds, setRounds] = useState(8);
  const [workLabel, setWorkLabel] = useLocalStorage(
    STORAGE_KEYS.WORK_LABEL,
    'Work'
  );
  const [restLabel, setRestLabel] = useLocalStorage(
    STORAGE_KEYS.REST_LABEL,
    'Rest'
  );

  // Sequence state
  const [sequence, setSequence] = useState([]);
  const [sequenceName, setSequenceName] = useState('');

  // App settings
  const [repeatEnabled, setRepeatEnabled] = useLocalStorage(
    STORAGE_KEYS.REPEAT_ENABLED,
    false
  );

  // Add new timer
  const addTimer = useCallback((timer) => {
    setSavedTimers(prev => [timer, ...prev]);
  }, [setSavedTimers]);

  // Delete timer
  const deleteTimer = useCallback((timerToDelete) => {
    setSavedTimers(prev => prev.filter(t => t !== timerToDelete));
  }, [setSavedTimers]);

  // Update timer
  const updateTimer = useCallback((oldTimer, newTimer) => {
    setSavedTimers(prev => prev.map(t => t === oldTimer ? newTimer : t));
  }, [setSavedTimers]);

  // Get timers by group
  const getTimersByGroup = useCallback((groupName) => {
    return savedTimers.filter(t => t.group === groupName);
  }, [savedTimers]);

  // Get all groups
  const getGroups = useCallback(() => {
    return [...new Set(savedTimers.map(t => t.group).filter(Boolean))];
  }, [savedTimers]);

  // Import timers from share link
  const importTimers = useCallback((importData) => {
    try {
      const { timers } = importData;

      // Filter out duplicates
      const existingNames = new Set(savedTimers.map(t => t.name));
      const newTimers = timers.filter(t => !existingNames.has(t.name));

      if (newTimers.length > 0) {
        setSavedTimers(prev => [...newTimers, ...prev]);
        return { success: true, count: newTimers.length };
      }

      return { success: false, message: 'All timers already exist' };
    } catch (error) {
      console.error('Error importing timers:', error);
      return { success: false, message: 'Import failed' };
    }
  }, [savedTimers, setSavedTimers]);

  const value = {
    savedTimers,
    setSavedTimers,
    addTimer,
    deleteTimer,
    updateTimer,
    getTimersByGroup,
    getGroups,
    importTimers,

    work,
    setWork,
    rest,
    setRest,
    rounds,
    setRounds,
    workLabel,
    setWorkLabel,
    restLabel,
    setRestLabel,

    sequence,
    setSequence,
    sequenceName,
    setSequenceName,

    repeatEnabled,
    setRepeatEnabled
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};