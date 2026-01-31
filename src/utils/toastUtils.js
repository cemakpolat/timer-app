/**
 * Toast notification utilities
 * Provides centralized toast notifications for consistent user feedback
 */

/**
 * Toast types enumeration
 */
export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error, info, warning)
 * @param {number} ttl - Time to live in milliseconds (default: 3000)
 */
export const showToast = (message, type = ToastType.INFO, ttl = 3000) => {
  window.dispatchEvent(new CustomEvent('app-toast', {
    detail: { message, type, ttl }
  }));
};

/**
 * Show success toast
 * @param {string} message - Success message
 * @param {number} ttl - Time to live in milliseconds (default: 3000)
 */
export const showSuccess = (message, ttl = 3000) => {
  showToast(`✅ ${message}`, ToastType.SUCCESS, ttl);
};

/**
 * Show error toast
 * @param {string} message - Error message
 * @param {number} ttl - Time to live in milliseconds (default: 5000)
 */
export const showError = (message, ttl = 5000) => {
  showToast(`❌ ${message}`, ToastType.ERROR, ttl);
};

/**
 * Show info toast
 * @param {string} message - Info message
 * @param {number} ttl - Time to live in milliseconds (default: 3000)
 */
export const showInfo = (message, ttl = 3000) => {
  showToast(`ℹ️ ${message}`, ToastType.INFO, ttl);
};

/**
 * Show warning toast
 * @param {string} message - Warning message
 * @param {number} ttl - Time to live in milliseconds (default: 4000)
 */
export const showWarning = (message, ttl = 4000) => {
  showToast(`⚠️ ${message}`, ToastType.WARNING, ttl);
};

/**
 * Handle error and show appropriate toast
 * @param {Error} error - Error object
 * @param {string} context - Context of the error (e.g., 'Save settings', 'Load data')
 */
export const handleError = (error, context = 'Operation') => {
  const message = error && error.message 
    ? `${context} failed: ${error.message}` 
    : `${context} failed`;
  
  console.error(`[${context}]`, error);
  showError(message);
};

/**
 * Execute async operation with error handling and toast notifications
 * @param {Function} operation - Async operation to execute
 * @param {Object} options - Options for error handling
 * @param {string} options.context - Context for error messages
 * @param {string} options.successMessage - Message to show on success
 * @param {boolean} options.showSuccess - Whether to show success toast (default: true)
 * @returns {Promise<any>} Result of the operation or undefined on error
 */
export const withErrorHandling = async (operation, options = {}) => {
  const {
    context = 'Operation',
    successMessage,
    showSuccess: shouldShowSuccess = true
  } = options;

  try {
    const result = await operation();
    
    if (successMessage && shouldShowSuccess) {
      showSuccess(successMessage);
    }
    
    return result;
  } catch (error) {
    handleError(error, context);
    return undefined;
  }
};

/**
 * Validate and show error toast if validation fails
 * @param {boolean} condition - Validation condition
 * @param {string} errorMessage - Error message to show if validation fails
 * @returns {boolean} True if validation passed, false otherwise
 */
export const validateOrToast = (condition, errorMessage) => {
  if (!condition) {
    showError(errorMessage);
    return false;
  }
  return true;
};
