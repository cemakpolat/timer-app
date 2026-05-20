/**
 * Style utility functions for consistent UI styling
 * Provides reusable style generators for inputs, buttons, and common UI elements
 */

/**
 * Generate consistent input style
 * @param {string} accentColor - Accent color for focus states
 * @param {string} textColor - Text color (default: '#ffffff')
 * @param {string} borderColor - Border color (default: 'rgba(255,255,255,0.1)')
 * @returns {Object} React style object
 */
export const inputStyle = (
  accentColor,
  textColor = '#ffffff',
  borderColor = 'rgba(255,255,255,0.1)'
) => ({
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${borderColor}`,
  borderRadius: 8,
  padding: 12,
  color: textColor,
  fontSize: 14,
  boxSizing: 'border-box',
});

/**
 * Generate button style with theme colors
 * @param {Object} theme - Theme object
 * @param {boolean} isPrimary - Whether button is primary style
 * @returns {Object} React style object
 */
export const buttonStyle = (theme, isPrimary = false) => ({
  background: isPrimary ? theme.accent : 'rgba(255,255,255,0.05)',
  border: `1px solid ${isPrimary ? theme.accent : 'rgba(255,255,255,0.1)'}`,
  borderRadius: 8,
  padding: '10px 16px',
  color: theme.text || '#ffffff',
  fontSize: 14,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

/**
 * Generate card style with theme
 * @param {Object} theme - Theme object
 * @param {number} opacity - Card opacity (default: 1)
 * @returns {Object} React style object
 */
export const cardStyle = (theme, opacity = 1) => ({
  background: theme.card || 'rgba(255,255,255,0.05)',
  borderRadius: 12,
  padding: 20,
  opacity,
  transition: 'all 0.3s ease',
});

/**
 * Generate consistent select/dropdown style
 * @param {string} accentColor - Accent color
 * @param {string} textColor - Text color (default: '#ffffff')
 * @returns {Object} React style object
 */
export const selectStyle = (accentColor, textColor = '#ffffff') => ({
  ...inputStyle(accentColor, textColor),
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${encodeURIComponent(textColor)}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 36,
});

/**
 * Generate text area style
 * @param {string} accentColor - Accent color
 * @param {string} textColor - Text color (default: '#ffffff')
 * @param {string} borderColor - Border color (default: 'rgba(255,255,255,0.1)')
 * @returns {Object} React style object
 */
export const textAreaStyle = (
  accentColor,
  textColor = '#ffffff',
  borderColor = 'rgba(255,255,255,0.1)'
) => ({
  ...inputStyle(accentColor, textColor, borderColor),
  minHeight: 100,
  resize: 'vertical',
  fontFamily: 'inherit',
});

/**
 * Generate checkbox/toggle style
 * @param {string} accentColor - Accent color
 * @param {boolean} isChecked - Whether checkbox is checked
 * @returns {Object} React style object
 */
export const checkboxStyle = (accentColor, isChecked = false) => ({
  width: 20,
  height: 20,
  borderRadius: 4,
  border: `2px solid ${isChecked ? accentColor : 'rgba(255,255,255,0.3)'}`,
  background: isChecked ? accentColor : 'transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});
