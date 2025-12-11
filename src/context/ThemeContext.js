import React, { createContext, useContext, useState, useMemo } from 'react';
import { THEMES, STORAGE_KEYS } from '../utils/constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useLocalStorage(
    STORAGE_KEYS.THEME,
    THEMES[0].name
  );

  const [customBorderRadius, setCustomBorderRadius] = useLocalStorage(
    STORAGE_KEYS.CUSTOM_BORDER_RADIUS,
    null // null means use theme default
  );

  const [themeOpacity, setThemeOpacity] = useLocalStorage(
    STORAGE_KEYS.THEME_OPACITY,
    1 // 1 means full opacity
  );

  const [previewTheme, setPreviewTheme] = useState(null);

  // Get current theme object
  const theme = useMemo(() => {
    return THEMES.find(t => t.name === themeName) || THEMES[0];
  }, [themeName]);

  // Get effective theme (preview or current) with custom border radius
  const effectiveTheme = useMemo(() => {
    const baseTheme = previewTheme || theme;
    return {
      ...baseTheme,
      borderRadius: customBorderRadius !== null ? customBorderRadius : baseTheme.borderRadius || 10
    };
  }, [previewTheme, theme, customBorderRadius]);

  const setTheme = (newTheme) => {
    if (typeof newTheme === 'string') {
      setThemeName(newTheme);
    } else if (newTheme && newTheme.name) {
      setThemeName(newTheme.name);
    }
  };

  const value = {
    theme: effectiveTheme,
    themeName,
    themes: THEMES,
    setTheme,
    previewTheme,
    setPreviewTheme,
    customBorderRadius,
    setCustomBorderRadius,
    themeOpacity,
    setThemeOpacity
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};