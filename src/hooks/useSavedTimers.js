import { useState, useEffect, useCallback } from 'react';

const defaultSavedTimers = [
  { name: "Pomodoro", duration: 25, unit: "min", min: 25, color: "#ef4444", group: "Work", scene: "deepWork" },
  { name: "Short Break", duration: 5, unit: "min", min: 5, color: "#10b981", group: "Work", scene: "coffee" },
  { name: "Deep Work", duration: 50, unit: "min", min: 50, color: "#8b5cf6", group: "Work", scene: "deepWork" },
  { name: "Workout", duration: 30, unit: "min", min: 30, color: "#f59e0b", group: "Fitness", scene: "exercise" }
];

/**
 * Custom hook to manage saved timers
 * Handles CRUD operations, grouping, and persistence for saved timers
 */
const useSavedTimers = () => {
  // Load saved timers from localStorage
  const [saved, setSaved] = useState(() => {
    try {
      const storedSaved = localStorage.getItem('savedTimers');
      return storedSaved ? JSON.parse(storedSaved) : defaultSavedTimers;
    } catch (error) {
      console.error("Failed to load saved timers from localStorage:", error);
      return defaultSavedTimers;
    }
  });

  // Persist to localStorage whenever saved timers change
  useEffect(() => {
    localStorage.setItem('savedTimers', JSON.stringify(saved));
  }, [saved]);

  // Get all unique groups (excluding "Sequences")
  const getGroups = useCallback(() => {
    return [...new Set(saved.map(t => t.group).filter(Boolean))];
  }, [saved]);

  // Get filtered groups for dropdown (excluding "Sequences")
  const getFilteredGroups = useCallback((searchTerm = '') => {
    return getGroups()
      .filter(g => g !== 'Sequences')
      .filter(g => g.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [getGroups]);

  // Create a new timer
  const createTimer = useCallback((timerData) => {
    const { name, duration, unit = 'min', color = '#3b82f6', group = 'Custom', scene = 'none' } = timerData;
    
    if (!name || !duration) {
      console.error('Timer name and duration are required');
      return false;
    }

    const durationValue = parseInt(duration);
    if (isNaN(durationValue) || durationValue < 0) {
      console.error('Invalid duration value');
      return false;
    }

    setSaved(prev => [{
      name,
      duration: durationValue,
      unit,
      min: unit === 'min' ? durationValue : Math.ceil(durationValue / 60),
      color,
      group,
      scene
    }, ...prev]);

    return true;
  }, []);

  // Save a sequence as a timer
  const saveSequence = useCallback((sequenceName, sequenceSteps) => {
    if (!sequenceSteps || sequenceSteps.length === 0 || !sequenceName) {
      console.error('Sequence name and steps are required');
      return false;
    }

    const totalMinutes = sequenceSteps.reduce((sum, t) => {
      const mins = t.unit === 'sec' ? t.duration / 60 : t.duration;
      return sum + mins;
    }, 0);

    setSaved(prev => [{
      name: sequenceName,
      duration: Math.ceil(totalMinutes),
      unit: 'min',
      min: Math.ceil(totalMinutes),
      color: sequenceSteps[0].color,
      group: 'Sequences',
      isSequence: true,
      steps: sequenceSteps
    }, ...prev]);

    return true;
  }, []);

  // Delete a timer
  const deleteTimer = useCallback((timerToDelete) => {
    if (!timerToDelete) return false;
    
    setSaved(prev => prev.filter(t => t !== timerToDelete));
    return true;
  }, []);

  // Update a timer
  const updateTimer = useCallback((oldTimer, updates) => {
    setSaved(prev => prev.map(t => 
      t === oldTimer ? { ...t, ...updates } : t
    ));
  }, []);

  // Share a timer group
  const shareTimerGroup = useCallback((groupName) => {
    const groupTimers = saved.filter(t => t.group === groupName && !t.isSequence);
    const encoded = btoa(JSON.stringify({ group: groupName, timers: groupTimers }));
    const url = `${window.location.origin}${window.location.pathname}?import=${encoded}`;
    
    navigator.clipboard.writeText(url);
    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: { message: 'Share link copied to clipboard!', type: 'success', ttl: 3000 }
    }));
    
    return url;
  }, [saved]);

  // Import timers from shared data
  const importTimers = useCallback((importData) => {
    if (importData.group && importData.timers) {
      // Remove existing timers from the same group
      setSaved(prev => {
        const filtered = prev.filter(t => t.group !== importData.group);
        return [...importData.timers, ...filtered];
      });
      return true;
    }
    return false;
  }, []);

  // Reset to default timers
  const resetToDefaults = useCallback(() => {
    setSaved(defaultSavedTimers);
  }, []);

  // Get timers by group
  const getTimersByGroup = useCallback((groupName) => {
    return saved.filter(t => t.group === groupName);
  }, [saved]);

  return {
    saved,
    setSaved,
    getGroups,
    getFilteredGroups,
    createTimer,
    saveSequence,
    deleteTimer,
    updateTimer,
    shareTimerGroup,
    importTimers,
    resetToDefaults,
    getTimersByGroup,
    defaultSavedTimers,
  };
};

export default useSavedTimers;
