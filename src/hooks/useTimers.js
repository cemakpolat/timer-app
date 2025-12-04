import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  getAllTimers,
  getTimerById,
  saveCustomTimer,
  deleteCustomTimer,
  getTemplatesByType,
  createRoomPayloadFromTemplate
} from '../services/timerService';

/**
 * useTimers Hook
 *
 * Provides reactive access to unified timer/template library.
 * Merges built-in templates with custom timers from localStorage.
 * Automatically handles localStorage changes and re-renders.
 *
 * Features:
 * - Memoized timer lists (all, templates, custom)
 * - Filter by type (workout, focus, block)
 * - CRUD operations for custom timers
 * - Room payload generation from templates
 * - Reactive to localStorage changes
 */
export const useTimers = (filterType = null) => {
  const [allTimers, setAllTimers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial load and listen for localStorage changes
  useEffect(() => {
    const loadTimers = () => {
      try {
        const timers = getAllTimers();
        setAllTimers(timers);
        setError(null);
      } catch (err) {
        console.error('Error loading timers:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadTimers();

    // Listen for custom timer changes in localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'customTimers' || e.key === null) {
        // If key is null, page was reloaded; if it's customTimers, another tab changed it
        loadTimers();
      }
    };

    // Listen for localStorage changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Optional: periodically check for changes in case storage event doesn't fire
    // This is especially useful for same-tab updates
    const interval = setInterval(() => {
      const timers = getAllTimers();
      setAllTimers(prevTimers => {
        if (JSON.stringify(timers) !== JSON.stringify(prevTimers)) {
          return timers;
        }
        return prevTimers;
      });
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Memoized filtered timers based on type
  const templates = useMemo(() => {
    return getTemplatesByType('workout');
  }, []);

  const customTimers = useMemo(() => {
    return allTimers.filter(t => t.metadata?.source === 'custom');
  }, [allTimers]);

  const filteredTimers = useMemo(() => {
    if (!filterType) return allTimers;
    return getTemplatesByType(filterType);
  }, [allTimers, filterType]);

  // CRUD operations
  const createTimer = useCallback((timerData) => {
    try {
      saveCustomTimer(timerData);
      const timers = getAllTimers();
      setAllTimers(timers);
      return timerData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateTimer = useCallback((timerId, timerData) => {
    try {
      saveCustomTimer({ ...timerData, id: timerId });
      const timers = getAllTimers();
      setAllTimers(timers);
      return timerData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteTimer = useCallback((timerId) => {
    try {
      deleteCustomTimer(timerId);
      const timers = getAllTimers();
      setAllTimers(timers);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getTimer = useCallback((timerId) => {
    return getTimerById(timerId);
  }, []);

  const createRoomFromTemplate = useCallback((templateId, options = {}) => {
    try {
      return createRoomPayloadFromTemplate(templateId, options);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    // State
    allTimers,
    templates,
    customTimers,
    filteredTimers,
    isLoading,
    error,

    // Queries
    getTimer,

    // Mutations
    createTimer,
    updateTimer,
    deleteTimer,
    createRoomFromTemplate,

    // Computed
    templateCount: templates.length,
    customCount: customTimers.length,
    totalCount: allTimers.length
  };
};

export default useTimers;
