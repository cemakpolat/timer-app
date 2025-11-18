import FirebaseService from './firebase/FirebaseService';
import MockRealtimeService from './mock/MockRealtimeService';

/**
 * Factory for creating realtime service instances
 * Following Factory Pattern and Dependency Inversion Principle
 *
 * Makes it easy to switch between different backends:
 * - Firebase
 * - Supabase
 * - Pusher
 * - Custom backend
 * - Mock (for testing)
 */

// Service type enum
export const ServiceType = {
  FIREBASE: 'firebase',
  SUPABASE: 'supabase',
  MOCK: 'mock'
};

class RealtimeServiceFactory {
  static instance = null;
  static currentService = null;
  static initListeners = [];
  static errorListeners = [];

  /**
   * Get or create service instance (Singleton pattern)
   * @param {string} type - Service type from ServiceType enum
   * @param {Object} config - Service configuration
   * @returns {IRealtimeService} Service instance
   */
  /**
   * Create or get the current service instance.
   * @param {string} type
   * @param {Object} config
   * @param {Object} options - { allowFallback: boolean }
   */
  static async createService(type = ServiceType.FIREBASE, config = {}, options = { allowFallback: true }) {
    // Return existing service if already created
    if (this.currentService) {
      return this.currentService;
    }

    let service;

    switch (type) {
      case ServiceType.FIREBASE:
        try {
          service = new FirebaseService();
          await service.initialize(config);
        } catch (err) {
          console.error('Firebase init failed:', err);
          // Notify error listeners
          try {
            this.errorListeners.forEach(cb => { try { cb(err); } catch (e) { console.error('errorListener error', e); } });
          } catch (e) {}
          if (options && options.allowFallback) {
            console.warn('Falling back to MockRealtimeService because allowFallback=true');
            service = new MockRealtimeService();
            await service.initialize({});
          } else {
            // Do not swallow the error when caller explicitly requested no fallback
            throw err;
          }
        }
        break;

      case ServiceType.SUPABASE:
        // Future implementation
        throw new Error('Supabase not implemented yet. Use ServiceType.FIREBASE');

      case ServiceType.MOCK:
        service = new MockRealtimeService();
        await service.initialize({});
        break;

      default:
        throw new Error(`Unknown service type: ${type}`);
    }

    this.currentService = service;

    // Notify listeners that a service has been initialized
    try {
      this.initListeners.forEach((cb) => {
        try { cb(this.currentService); } catch (e) { console.error('initListener error', e); }
      });
    } catch (e) {
      // ignore
    }
    return service;
  }

  static onInit(cb) {
    if (typeof cb === 'function') this.initListeners.push(cb);
  }

  static offInit(cb) {
    this.initListeners = this.initListeners.filter(f => f !== cb);
  }

  static onError(cb) {
    if (typeof cb === 'function') this.errorListeners.push(cb);
  }

  static offError(cb) {
    this.errorListeners = this.errorListeners.filter(f => f !== cb);
  }

  /**
   * Get current service instance
   */
  static getService() {
    if (!this.currentService) {
      throw new Error('Service not initialized. Call createService() first.');
    }
    return this.currentService;
  }

  /**
   * Reset service (useful for testing or switching backends)
   */
  static async resetService() {
    if (this.currentService) {
      await this.currentService.disconnect();
      this.currentService = null;
    }
  }
}

export default RealtimeServiceFactory;
