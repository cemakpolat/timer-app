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

  /**
   * Get or create service instance (Singleton pattern)
   * @param {string} type - Service type from ServiceType enum
   * @param {Object} config - Service configuration
   * @returns {IRealtimeService} Service instance
   */
  static async createService(type = ServiceType.FIREBASE, config = {}) {
    // Return existing service if already created
    if (this.currentService) {
      return this.currentService;
    }

    let service;

    switch (type) {
      case ServiceType.FIREBASE:
        service = new FirebaseService();
        await service.initialize(config);
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
    return service;
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
