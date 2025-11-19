/**
 * Timer utility functions for formatting and calculations
 */

/**
 * Format seconds into HH:MM:SS display
 * @param {number} totalSeconds - Total seconds to format
 * @returns {string} Formatted time string
 */
export const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Calculate total seconds from hours, minutes, seconds
 * @param {number} hours - Hours
 * @param {number} minutes - Minutes  
 * @param {number} seconds - Seconds
 * @returns {number} Total seconds
 */
export const calculateTotalSeconds = (hours, minutes, seconds) => {
  return (hours * 3600) + (minutes * 60) + seconds;
};

/**
 * Calculate total time remaining for interval timer
 * @param {number} workSeconds - Work duration in seconds
 * @param {number} restSeconds - Rest duration in seconds
 * @param {number} rounds - Number of rounds
 * @param {number} currentRound - Current round (1-indexed)
 * @param {boolean} isWork - Whether currently in work phase
 * @param {number} timeRemaining - Time remaining in current phase
 * @returns {number} Total seconds remaining
 */
export const calculateIntervalRemaining = (workSeconds, restSeconds, rounds, currentRound, isWork, timeRemaining) => {
  let totalRemaining = timeRemaining; // Current phase remaining
  
  if (isWork) {
    // Add rest for current round
    totalRemaining += restSeconds;
  }
  
  // Add all remaining complete rounds
  const remainingRounds = rounds - currentRound;
  totalRemaining += remainingRounds * (workSeconds + restSeconds);
  
  return totalRemaining;
};

/**
 * Validate timer input values
 * @param {number} hours - Hours
 * @param {number} minutes - Minutes
 * @param {number} seconds - Seconds
 * @returns {boolean} Whether inputs are valid
 */
export const validateTimerInput = (hours, minutes, seconds) => {
  if (hours < 0 || minutes < 0 || seconds < 0) return false;
  if (minutes > 59 || seconds > 59) return false;
  if (hours === 0 && minutes === 0 && seconds === 0) return false;
  return true;
};

/**
 * Parse time from HH:MM:SS string
 * @param {string} timeString - Time in HH:MM:SS format
 * @returns {object} Object with hours, minutes, seconds
 */
export const parseTimeString = (timeString) => {
  const parts = timeString.split(':');
  return {
    hours: parseInt(parts[0]) || 0,
    minutes: parseInt(parts[1]) || 0,
    seconds: parseInt(parts[2]) || 0
  };
};
