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

  const [previewTheme, setPreviewTheme] = useState(null);

  // Get current theme object
  const theme = useMemo(() => {
    return THEMES.find(t => t.name === themeName) || THEMES[0];
  }, [themeName]);

  // Get effective theme (preview or current)
  const effectiveTheme = previewTheme || theme;

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
    setPreviewTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};