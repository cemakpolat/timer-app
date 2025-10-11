/**
 * Interface for real-time service implementations
 * Following Interface Segregation Principle (ISP) from SOLID
 *
 * Any real-time backend (Firebase, Supabase, Pusher, etc.) must implement this interface
 */

export class IRealtimeService {
  /**
   * Initialize the service with configuration
   * @param {Object} config - Service-specific configuration
   */
  async initialize(config) {
    throw new Error('Method not implemented');
  }

  /**
   * Get current active users count (efficient, non-continuous)
   * @returns {Promise<number>} Number of active users
   */
  async getActiveUsersCount() {
    throw new Error('Method not implemented');
  }

  /**
   * Update user's presence (heartbeat)
   * @param {string} userId - User identifier
   * @param {Object} metadata - Optional user metadata
   */
  async updatePresence(userId, metadata = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Remove user presence (on disconnect)
   * @param {string} userId - User identifier
   */
  async removePresence(userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Subscribe to active users count changes
   * @param {Function} callback - Called when count changes
   * @returns {Function} Unsubscribe function
   */
  subscribeToActiveUsers(callback) {
    throw new Error('Method not implemented');
  }

  // === FOCUS ROOMS ===

  /**
   * Get list of active focus rooms
   * @returns {Promise<Array>} List of rooms
   */
  async getFocusRooms() {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new focus room
   * @param {Object} room - Room details (name, maxParticipants, duration, etc.)
   * @returns {Promise<Object>} Created room
   */
  async createFocusRoom(room) {
    throw new Error('Method not implemented');
  }

  /**
   * Join a focus room
   * @param {string} roomId - Room identifier
   * @param {string} userId - User identifier
   * @param {Object} userInfo - User info (displayName, etc.)
   * @returns {Promise<Object>} Room data
   */
  async joinFocusRoom(roomId, userId, userInfo) {
    throw new Error('Method not implemented');
  }

  /**
   * Leave a focus room
   * @param {string} roomId - Room identifier
   * @param {string} userId - User identifier
   */
  async leaveFocusRoom(roomId, userId) {
    throw new Error('Method not implemented');
  }

  /**
   * Subscribe to focus room updates
   * @param {string} roomId - Room identifier
   * @param {Function} callback - Called when room updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToFocusRoom(roomId, callback) {
    throw new Error('Method not implemented');
  }

  /**
   * Send a message to a focus room
   * @param {string} roomId - Room identifier
   * @param {string} userId - User identifier
   * @param {string} message - Message text
   */
  async sendMessage(roomId, userId, message) {
    throw new Error('Method not implemented');
  }

  /**
   * Subscribe to room messages
   * @param {string} roomId - Room identifier
   * @param {Function} callback - Called when new message arrives
   * @returns {Function} Unsubscribe function
   */
  subscribeToMessages(roomId, callback) {
    throw new Error('Method not implemented');
  }

  /**
   * Start room timer synchronously
   * @param {string} roomId - Room identifier
   * @param {number} duration - Timer duration in seconds
   */
  async startRoomTimer(roomId, duration) {
    throw new Error('Method not implemented');
  }

  /**
   * Subscribe to room timer updates
   * @param {string} roomId - Room identifier
   * @param {Function} callback - Called on timer updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToRoomTimer(roomId, callback) {
    throw new Error('Method not implemented');
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect() {
    throw new Error('Method not implemented');
  }
}

export default IRealtimeService;
