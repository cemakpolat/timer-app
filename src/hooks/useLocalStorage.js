import { useState, useEffect } from 'react';
import { debounce } from '../utils/helpers';

/**
 * Custom hook for localStorage with automatic serialization/deserialization
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @param {boolean} debounceWrite - Whether to debounce writes (default: false)
 * @returns {[value, setValue, removeValue]} - Tuple of value, setter, and remover
 */
export const useLocalStorage = (key, initialValue, debounceWrite = false) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Debounced version of localStorage.setItem
  const debouncedSetItem = debounce((key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
        // Optionally clear old data or notify user
      } else {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    }
  }, 500);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (debounceWrite) {
        debouncedSetItem(key, valueToStore);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // Function to remove value from localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  };

  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for ${key}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
};