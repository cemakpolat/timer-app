import { STORAGE_VERSION, STORAGE_KEYS } from '../utils/constants';

/**
 * Service for managing localStorage with versioning and migrations
 */
class StorageService {
  constructor() {
    this.version = STORAGE_VERSION;
    this.initializeStorage();
  }

  /**
   * Initialize storage and run migrations if needed
   */
  initializeStorage() {
    try {
      const storedVersion = localStorage.getItem(STORAGE_KEYS.STORAGE_VERSION);

      if (!storedVersion) {
        // First time user
        localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, this.version);
      } else if (storedVersion !== this.version) {
        // Run migrations
        this.migrate(storedVersion, this.version);
        localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, this.version);
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  /**
   * Migrate data from old version to new version
   * @param {string} from - Old version
   * @param {string} to - New version
   */
  migrate(from, to) {
    console.log(`Migrating storage from ${from} to ${to}`);

    // Add migration logic here for future versions
    // Example:
    // if (from === '1.0' && to === '2.0') {
    //   this.migrateV1ToV2();
    // }
  }

  /**
   * Get item from localStorage with fallback
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Parsed value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success status
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
        this.handleQuotaExceeded();
      } else {
        console.error(`Error saving ${key} to storage:`, error);
      }
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  }

  /**
   * Clear all app data from localStorage
   */
  clear() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Handle quota exceeded error by clearing old data
   */
  handleQuotaExceeded() {
    try {
      // Clear history (oldest data first)
      const history = this.get(STORAGE_KEYS.HISTORY, []);
      if (history.length > 5) {
        this.set(STORAGE_KEYS.HISTORY, history.slice(0, 5));
        console.log('Cleared old history to free up space');
      }
    } catch (error) {
      console.error('Error handling quota exceeded:', error);
    }
  }

  /**
   * Export all app data
   * @returns {Object} All stored data
   */
  exportData() {
    const data = {};
    try {
      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        const value = this.get(key);
        if (value !== null) {
          data[name] = value;
        }
      });
      data.version = this.version;
      data.exportDate = new Date().toISOString();
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  /**
   * Import app data
   * @param {Object} data - Data to import
   * @returns {boolean} Success status
   */
  importData(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid import data');
      }

      // Backup current data
      const backup = this.exportData();

      try {
        Object.entries(data).forEach(([name, value]) => {
          const key = STORAGE_KEYS[name];
          if (key && name !== 'version' && name !== 'exportDate') {
            this.set(key, value);
          }
        });
        return true;
      } catch (error) {
        // Restore backup on failure
        console.error('Import failed, restoring backup:', error);
        Object.entries(backup).forEach(([name, value]) => {
          const key = STORAGE_KEYS[name];
          if (key && name !== 'version' && name !== 'exportDate') {
            this.set(key, value);
          }
        });
        return false;
      }
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Object} Storage stats
   */
  getStorageStats() {
    try {
      let totalSize = 0;
      const sizes = {};

      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        const item = localStorage.getItem(key);
        if (item) {
          const size = new Blob([item]).size;
          sizes[name] = size;
          totalSize += size;
        }
      });

      return {
        totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        sizes,
        itemCount: Object.keys(sizes).length
      };
    } catch (error) {
      console.error('Error calculating storage stats:', error);
      return null;
    }
  }
}

const storageService = new StorageService();

export default storageService;