import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Build key combination string
      let combination = '';
      if (ctrl) combination += 'ctrl+';
      if (shift) combination += 'shift+';
      if (alt) combination += 'alt+';
      combination += key;

      // Also check for simple key
      const handlers = [shortcuts[combination], shortcuts[key]];

      handlers.forEach(handler => {
        if (handler) {
          event.preventDefault();
          handler(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
};

/**
 * Default keyboard shortcuts for timer app
 * @param {Object} actions - Actions to bind to shortcuts
 * @returns {Object} Shortcut map
 */
export const getDefaultShortcuts = (actions) => ({
  // Spacebar: Toggle play/pause
  ' ': actions.toggle,

  // R: Reset timer
  'r': actions.reset,

  // Escape: Cancel/close modals
  'escape': actions.cancel,

  // T: Switch to Timer mode
  't': actions.switchToTimer,

  // S: Switch to Stopwatch mode
  's': actions.switchToStopwatch,

  // I: Switch to Interval mode
  'i': actions.switchToInterval,

  // N: Create new timer
  'n': actions.createNew,

  // ?: Show help/shortcuts
  '?': actions.showHelp,

  // F: Toggle fullscreen
  'f': actions.toggleFullscreen
});