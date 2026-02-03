/**
 * Logger utility for consistent and environment-aware logging
 * Provides different log levels and conditional logging based on environment
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log levels enumeration
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

/**
 * Logger configuration
 */
const config = {
  enableInProduction: false,
  enableTimestamps: true,
  enableStackTrace: true, // Enable in tests too
  enableInTests: false // Allow enabling logging in tests
};

/**
 * Get current minimum log level based on environment
 * @returns {string} Minimum log level
 */
const getMinLevel = () => {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? LogLevel.DEBUG : LogLevel.WARN;
};

/**
 * Get formatted timestamp
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format log message with context
 * @param {string} level - Log level
 * @param {string} context - Context or module name
 * @param {string} message - Log message
 * @returns {string} Formatted message
 */
const formatMessage = (level, context, message) => {
  const timestamp = config.enableTimestamps ? `[${getTimestamp()}]` : '';
  const contextStr = context ? `[${context}]` : '';
  return `${timestamp} ${contextStr} ${message}`;
};

/**
 * Check if logging is enabled for given level
 * @param {string} level - Log level to check
 * @returns {boolean} True if logging is enabled for this level
 */
const isLevelEnabled = (level) => {
  const currentIsTest = process.env.NODE_ENV === 'test';
  if (currentIsTest && !config.enableInTests) return false; // Disable logging in tests unless explicitly enabled
  
  const currentIsDev = process.env.NODE_ENV === 'development';
  const currentIsProd = process.env.NODE_ENV === 'production';
  
  // In development, allow all levels
  if (currentIsDev) {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(getMinLevel());
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex >= currentLevelIndex;
  }
  
  // In production, always allow WARN and ERROR regardless of enableInProduction setting
  if (currentIsProd && (level === LogLevel.WARN || level === LogLevel.ERROR)) {
    return true;
  }
  
  // For other cases, check enableInProduction
  if (!currentIsDev && !config.enableInProduction) return false;
  
  const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
  const currentLevelIndex = levels.indexOf(getMinLevel());
  const requestedLevelIndex = levels.indexOf(level);
  
  return requestedLevelIndex >= currentLevelIndex;
};

/**
 * Logger class for context-specific logging
 */
class Logger {
  constructor(context = '') {
    this.context = context;
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {...any} args - Additional arguments
   */
  debug(message, ...args) {
    if (isLevelEnabled(LogLevel.DEBUG)) {
      console.log(formatMessage(LogLevel.DEBUG, this.context, message), message, ...args);
    }
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {...any} args - Additional arguments
   */
  info(message, ...args) {
    if (isLevelEnabled(LogLevel.INFO)) {
      console.log(formatMessage(LogLevel.INFO, this.context, message), message, ...args);
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {...any} args - Additional arguments
   */
  warn(message, ...args) {
    if (isLevelEnabled(LogLevel.WARN)) {
      console.warn(formatMessage(LogLevel.WARN, this.context, message), message, ...args);
    }
  }

  /**
   * Log error message with optional error object
   * @param {string} message - Error message
   * @param {Error} error - Error object (optional)
   * @param {...any} args - Additional arguments
   */
  error(message, error, ...args) {
    if (isLevelEnabled(LogLevel.ERROR)) {
      console.error(formatMessage(LogLevel.ERROR, this.context, message), error, ...args);
      
      if (error && config.enableStackTrace && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
  }

  /**
   * Group related log messages
   * @param {string} label - Group label
   * @param {Function} callback - Function containing grouped logs (optional)
   */
  group(label, callback) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.group(formatMessage(LogLevel.INFO, this.context, label));
      if (callback) {
        try {
          callback();
        } finally {
          console.groupEnd();
        }
      }
    }
  }

  /**
   * Create a collapsed group
   * @param {string} label - Group label
   * @param {Function} callback - Function containing grouped logs (optional)
   */
  groupCollapsed(label, callback) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.groupCollapsed(formatMessage(LogLevel.INFO, this.context, label));
      if (callback) {
        try {
          callback();
        } finally {
          console.groupEnd();
        }
      }
    }
  }

  /**
   * End group
   */
  groupEnd() {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.groupEnd();
    }
  }

  /**
   * Start a timer
   * @param {string} label - Timer label
   */
  time(label) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.time(formatMessage(LogLevel.INFO, this.context, label));
    }
  }

  /**
   * End a timer
   * @param {string} label - Timer label
   */
  timeEnd(label) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.timeEnd(formatMessage(LogLevel.INFO, this.context, label));
    }
  }

  /**
   * Measure execution time of a function
   * @param {string} label - Label for the measurement
   * @param {Function} fn - Function to measure
   * @returns {Promise<any>|any} Result of the function
   */
  async measure(label, fn) {
    if (!isDevelopment) {
      return await fn();
    }

    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.debug(`${label} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.error(`${label} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }
}

/**
 * Create a logger instance for a specific context/module
 * @param {string} context - Context or module name
 * @returns {Logger} Logger instance
 */
export const createLogger = (context) => {
  return new Logger(context);
};

/**
 * Default logger instance
 */
export const logger = new Logger('App');

/**
 * Configure logger settings
 * @param {Object} newConfig - Configuration options
 */
export const configureLogger = (newConfig) => {
  Object.assign(config, newConfig);
};

export default logger;
