import { useState, useEffect, useRef, useCallback } from 'react';
import { TIMER_MODES, LIMITS } from '../utils/constants';
import { triggerHapticFeedback } from '../utils/helpers';

/**
 * Custom hook for timer logic with support for multiple modes
 * @returns {Object} Timer state and controls
 */
export const useTimer = () => {
  const [mode, setMode] = useState(TIMER_MODES.TIMER);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const intervalRef = useRef(null);
  const lastActiveTimeRef = useRef(null);

  // Handle visibility change (tab switching, app backgrounding)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Store the current time when tab becomes hidden
        lastActiveTimeRef.current = Date.now();
      } else if (isRunning && lastActiveTimeRef.current) {
        // Calculate elapsed time while tab was hidden
        const elapsed = Math.floor((Date.now() - lastActiveTimeRef.current) / 1000);

        if (mode === TIMER_MODES.STOPWATCH) {
          // For stopwatch, add elapsed time
          setTime(prev => prev + elapsed);
        } else {
          // For countdown timers, subtract elapsed time
          setTime(prev => Math.max(0, prev - elapsed));
        }

        lastActiveTimeRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, mode]);

  // Core timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (mode === TIMER_MODES.STOPWATCH) {
            return prev + 1;
          }

          // Countdown logic
          if (prev <= 0) {
            return 0;
          }

          // Haptic feedback for last few seconds
          if (prev <= LIMITS.WARNING_THRESHOLD && prev > 0) {
            triggerHapticFeedback(30);
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode]);

  // Start timer
  const start = useCallback(() => {
    setIsRunning(true);
    triggerHapticFeedback();
  }, []);

  // Pause timer
  const pause = useCallback(() => {
    setIsRunning(false);
    triggerHapticFeedback();
  }, []);

  // Toggle play/pause
  const toggle = useCallback(() => {
    setIsRunning(prev => !prev);
    triggerHapticFeedback();
  }, []);

  // Reset timer
  const reset = useCallback(() => {
    setIsRunning(false);
    if (mode === TIMER_MODES.STOPWATCH) {
      setTime(0);
    } else {
      setTime(initialTime);
    }
    triggerHapticFeedback();
  }, [mode, initialTime]);

  // Set timer with specific duration
  const setTimer = useCallback((seconds, mode = TIMER_MODES.TIMER) => {
    setMode(mode);
    setTime(seconds);
    setInitialTime(seconds);
    setIsRunning(false);
  }, []);

  // Start stopwatch
  const startStopwatch = useCallback(() => {
    setMode(TIMER_MODES.STOPWATCH);
    setTime(0);
    setInitialTime(0);
    setIsRunning(true);
    triggerHapticFeedback();
  }, []);

  return {
    mode,
    isRunning,
    time,
    initialTime,
    start,
    pause,
    toggle,
    reset,
    setTimer,
    startStopwatch,
    setMode,
    setTime,
    setInitialTime
  };
};