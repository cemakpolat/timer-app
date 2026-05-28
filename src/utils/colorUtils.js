/**
 * Color utility functions for theme and UI color calculations
 * Provides luminance calculation, contrast determination, and color manipulation
 */

/**
 * Calculate relative luminance of a color using WCAG standards
 * @param {string} hexColor - Hex color string (e.g., '#ffffff')
 * @returns {number} Relative luminance value between 0 and 1
 */
export const getLuminance = (hexColor) => {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const [rs, gs, bs] = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  // Calculate relative luminance using WCAG formula
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Determine if a color is light (luminance > 0.5)
 * @param {string} hexColor - Hex color string
 * @returns {boolean} True if color is light, false if dark
 */
export const isLightColor = (hexColor) => {
  return getLuminance(hexColor) > 0.5;
};

/**
 * Get contrasting text color (black or white) for a given background color
 * @param {string} bgColor - Background hex color string
 * @returns {string} '#000000' for light backgrounds, '#ffffff' for dark backgrounds
 */
export const getContrastColor = (bgColor) => {
  return isLightColor(bgColor) ? '#000000' : '#ffffff';
};

/**
 * Convert hex color to rgba with specified opacity
 * @param {string} hexColor - Hex color string
 * @param {number} opacity - Opacity value between 0 and 1
 * @returns {string} RGBA color string
 */
export const hexToRgba = (hexColor, opacity = 1) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Get semi-transparent text color based on theme
 * @param {Object} theme - Theme object with text color property
 * @param {number} opacity - Opacity value between 0 and 1 (default: 0.7)
 * @returns {string} RGBA color string with specified opacity
 */
export const getTextOpacity = (theme, opacity = 0.7) => {
  const baseColor = theme.text || '#ffffff';
  return hexToRgba(baseColor, opacity);
};

/**
 * Validate if string is a valid hex color
 * @param {string} color - Color string to validate
 * @returns {boolean} True if valid hex color
 */
export const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Lighten a hex color by a percentage
 * @param {string} hexColor - Hex color string
 * @param {number} percent - Percentage to lighten (0-100)
 * @returns {string} Lightened hex color
 */
export const lightenColor = (hexColor, percent) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const amount = Math.round(2.55 * percent);
  const newR = Math.min(255, r + amount);
  const newG = Math.min(255, g + amount);
  const newB = Math.min(255, b + amount);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

/**
 * Darken a hex color by a percentage
 * @param {string} hexColor - Hex color string
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string} Darkened hex color
 */
export const darkenColor = (hexColor, percent) => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const amount = Math.round(2.55 * percent);
  const newR = Math.max(0, r - amount);
  const newG = Math.max(0, g - amount);
  const newB = Math.max(0, b - amount);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};
