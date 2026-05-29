import { useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_THEME_DRAFT = {
  name: '',
  bg: '#000000',
  card: '#1a1a1a',
  accent: '#3b82f6',
  text: '#ffffff',
};

function dispatchThemeToast(message, type = 'info', ttl = 3000) {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type, ttl } }));
}

function normalizeThemeOpacityValue(value) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return 1;
  }

  const normalized = parsed > 1 ? parsed / 100 : parsed;
  return Math.min(1, Math.max(0, normalized));
}

export default function useThemeManager(defaultThemes) {
  const [deletedDefaultThemes, setDeletedDefaultThemes] = useState(() => {
    try {
      const stored = localStorage.getItem('deletedDefaultThemes');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load deleted default themes:', error);
      return [];
    }
  });

  const [themes, setThemes] = useState(() => {
    try {
      const storedCustomThemes = localStorage.getItem('customThemes');
      const customThemes = storedCustomThemes ? JSON.parse(storedCustomThemes) : [];
      const availableDefaultThemes = defaultThemes.filter((theme) => !deletedDefaultThemes.includes(theme.name));
      return [...availableDefaultThemes, ...customThemes];
    } catch (error) {
      console.error('Failed to load custom themes:', error);
      return defaultThemes;
    }
  });

  const [theme, setTheme] = useState(() => {
    try {
      const storedThemeName = localStorage.getItem('selectedThemeName');
      return storedThemeName ? themes.find((item) => item.name === storedThemeName) || themes[0] : themes[0];
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
      return themes[0];
    }
  });

  const [customBorderRadius, setCustomBorderRadius] = useState(() => {
    try {
      const stored = localStorage.getItem('customBorderRadius');
      return stored !== null ? parseInt(stored, 10) : null;
    } catch (error) {
      console.error('Failed to load customBorderRadius:', error);
      return null;
    }
  });

  const [themeOpacity, setThemeOpacityState] = useState(() => {
    try {
      const stored = localStorage.getItem('themeOpacity');
      if (stored !== null) {
        return normalizeThemeOpacityValue(stored);
      }
    } catch (error) {
      console.error('Failed to load themeOpacity:', error);
    }

    return 1;
  });

  const setThemeOpacity = useCallback((valueOrUpdater) => {
    if (typeof valueOrUpdater === 'function') {
      setThemeOpacityState((prev) => normalizeThemeOpacityValue(valueOrUpdater(prev)));
      return;
    }

    setThemeOpacityState(normalizeThemeOpacityValue(valueOrUpdater));
  }, []);

  const [showThemes, setShowThemes] = useState(false);
  const [previewTheme] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [newThemeName, setNewThemeName] = useState(DEFAULT_THEME_DRAFT.name);
  const [newThemeBg, setNewThemeBg] = useState(DEFAULT_THEME_DRAFT.bg);
  const [newThemeCard, setNewThemeCard] = useState(DEFAULT_THEME_DRAFT.card);
  const [newThemeAccent, setNewThemeAccent] = useState(DEFAULT_THEME_DRAFT.accent);
  const [newThemeText, setNewThemeText] = useState(DEFAULT_THEME_DRAFT.text);
  const [showDeleteThemeModal, setShowDeleteThemeModal] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState(null);

  useEffect(() => {
    if (theme?.name) {
      localStorage.setItem('selectedThemeName', theme.name);
    }
  }, [theme?.name]);

  useEffect(() => {
    if (customBorderRadius !== null) {
      localStorage.setItem('customBorderRadius', customBorderRadius.toString());
    } else {
      localStorage.removeItem('customBorderRadius');
    }
  }, [customBorderRadius]);

  useEffect(() => {
    if (customBorderRadius !== null) {
      setTheme((prev) => {
        if (!prev || prev.borderRadius === customBorderRadius) {
          return prev;
        }

        return { ...prev, borderRadius: customBorderRadius };
      });
      return;
    }

    try {
      const original = themes.find((themeOption) => themeOption.name === theme?.name);
      if (original) {
        setTheme(original);
      }
    } catch (err) {
      // ignore
    }
  }, [customBorderRadius, theme?.name, themes]);

  useEffect(() => {
    const normalizedThemeOpacity = normalizeThemeOpacityValue(themeOpacity);
    if (normalizedThemeOpacity !== themeOpacity) {
      setThemeOpacityState(normalizedThemeOpacity);
      return;
    }

    localStorage.setItem('themeOpacity', normalizedThemeOpacity.toString());
  }, [themeOpacity]);

  const effectiveTheme = useMemo(() => ({
    ...theme,
    borderRadius: customBorderRadius !== null ? customBorderRadius : (theme?.borderRadius !== undefined ? theme.borderRadius : 12),
  }), [theme, customBorderRadius]);

  const resetThemeDraft = () => {
    setNewThemeName(DEFAULT_THEME_DRAFT.name);
    setNewThemeBg(DEFAULT_THEME_DRAFT.bg);
    setNewThemeCard(DEFAULT_THEME_DRAFT.card);
    setNewThemeAccent(DEFAULT_THEME_DRAFT.accent);
    setNewThemeText(DEFAULT_THEME_DRAFT.text);
    setShowColorPicker(false);
    setEditingTheme(null);
  };

  const saveCustomTheme = () => {
    if (!newThemeName.trim()) {
      dispatchThemeToast('Please enter a theme name', 'error');
      return;
    }

    const themeData = {
      name: newThemeName.trim(),
      bg: newThemeBg,
      card: newThemeCard,
      accent: newThemeAccent,
      text: newThemeText,
      isDefault: false,
    };

    try {
      const storedCustomThemes = localStorage.getItem('customThemes');
      const customThemes = storedCustomThemes ? JSON.parse(storedCustomThemes) : [];

      if (editingTheme) {
        const index = customThemes.findIndex((customTheme) => customTheme.name === editingTheme.name);
        if (index !== -1) {
          if (
            editingTheme.name !== themeData.name
            && customThemes.some((customTheme) => customTheme.name.toLowerCase() === themeData.name.toLowerCase())
          ) {
            dispatchThemeToast('Theme name already exists', 'error');
            return;
          }

          customThemes[index] = themeData;
          localStorage.setItem('customThemes', JSON.stringify(customThemes));
          setThemes((prev) => prev.map((item) => item.name === editingTheme.name ? themeData : item));

          if (theme?.name === editingTheme.name) {
            setTheme(themeData);
            localStorage.setItem('selectedThemeName', themeData.name);
          }

          dispatchThemeToast('Theme updated!', 'success');
        }
      } else {
        if (customThemes.some((customTheme) => customTheme.name.toLowerCase() === themeData.name.toLowerCase())) {
          dispatchThemeToast('Theme name already exists', 'error');
          return;
        }

        customThemes.push(themeData);
        localStorage.setItem('customThemes', JSON.stringify(customThemes));
        setThemes((prev) => [...prev, themeData]);
        dispatchThemeToast('Custom theme saved!', 'success');
      }

      resetThemeDraft();
    } catch (error) {
      console.error('Error saving custom theme:', error);
      dispatchThemeToast('Failed to save theme', 'error');
    }
  };

  const deleteTheme = (themeItem) => {
    try {
      if (themeItem.isDefault) {
        const updatedDeleted = [...deletedDefaultThemes, themeItem.name];
        setDeletedDefaultThemes(updatedDeleted);
        localStorage.setItem('deletedDefaultThemes', JSON.stringify(updatedDeleted));
        setThemes((prev) => prev.filter((item) => item.name !== themeItem.name));
      } else {
        const storedCustomThemes = localStorage.getItem('customThemes');
        const customThemes = storedCustomThemes ? JSON.parse(storedCustomThemes) : [];
        const updatedThemes = customThemes.filter((item) => item.name !== themeItem.name);
        localStorage.setItem('customThemes', JSON.stringify(updatedThemes));
        setThemes((prev) => prev.filter((item) => item.name !== themeItem.name));
      }

      if (theme?.name === themeItem.name) {
        const midnight = themes.find((item) => item.name === 'Midnight') || defaultThemes[0];
        setTheme(midnight);
        localStorage.setItem('selectedThemeName', midnight.name);
      }

      setShowDeleteThemeModal(false);
      setThemeToDelete(null);
      dispatchThemeToast('Theme deleted!', 'success');
    } catch (error) {
      console.error('Error deleting theme:', error);
      dispatchThemeToast('Failed to delete theme', 'error');
    }
  };

  return {
    themes,
    setThemes,
    theme,
    setTheme,
    customBorderRadius,
    setCustomBorderRadius,
    themeOpacity,
    setThemeOpacity,
    effectiveTheme,
    showThemes,
    setShowThemes,
    previewTheme,
    showColorPicker,
    setShowColorPicker,
    editingTheme,
    setEditingTheme,
    newThemeName,
    setNewThemeName,
    newThemeBg,
    setNewThemeBg,
    newThemeCard,
    setNewThemeCard,
    newThemeAccent,
    setNewThemeAccent,
    newThemeText,
    setNewThemeText,
    showDeleteThemeModal,
    setShowDeleteThemeModal,
    themeToDelete,
    setThemeToDelete,
    saveCustomTheme,
    deleteTheme,
  };
}