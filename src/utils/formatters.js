/**
 * Format seconds into HH:MM:SS or MM:SS format
 * @param {number} seconds - Total seconds to format
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Format ISO date string to readable format
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (isoString) => {
  return new Date(isoString).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format duration for display
 * @param {number} duration - Duration value
 * @param {string} unit - Unit (min or sec)
 * @returns {string} Formatted duration string
 */
export const formatDuration = (duration, unit = 'min') => {
  if (unit === 'min') {
    if (duration < 60) {
      return `${duration}m`;
    }
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  if (duration < 60) {
    return `${duration}s`;
  }

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

/**
 * Parse time input to seconds
 * @param {number} hours
 * @param {number} minutes
 * @param {number} seconds
 * @returns {number} Total seconds
 */
export const parseTimeToSeconds = (hours = 0, minutes = 0, seconds = 0) => {
  return (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Calculate total sequence duration in seconds
 * @param {Array} sequence - Array of timer objects
 * @returns {number} Total seconds
 */
export const calculateSequenceDuration = (sequence) => {
  return sequence.reduce((sum, timer) => {
    return sum + (timer.unit === 'sec' ? timer.duration : timer.duration * 60);
  }, 0);
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {string} isoString - ISO date string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return formatDate(isoString);
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};