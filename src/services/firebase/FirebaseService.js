import { IRealtimeService } from '../interfaces/IRealtimeService';

/**
 * Firebase implementation of IRealtimeService
 * Uses efficient polling for presence, real-time for rooms/chat
 *
 * Following SOLID principles:
 * - Single Responsibility: Only handles Firebase operations
 * - Open/Closed: Extends IRealtimeService interface
 * - Liskov Substitution: Can replace any IRealtimeService
 * - Dependency Inversion: Depends on abstraction (IRealtimeService)
 */
class FirebaseService extends IRealtimeService {
  constructor() {
    super();
    this.db = null;
    this.auth = null;
    this.currentUserId = null;
    this.presenceInterval = null;
    this.subscriptions = new Map();
  }

  /**
   * Initialize Firebase with config
   * @param {Object} config - Firebase config object
   */
  async initialize(config) {
    try {
      const { initializeApp } = await import('firebase/app');
      const { getDatabase, ref, set, get, onValue, off, remove, serverTimestamp } = await import('firebase/database');
      const { getAuth, signInAnonymously } = await import('firebase/auth');

      // Initialize Firebase
      const app = initializeApp(config);
      this.db = getDatabase(app);
      this.auth = getAuth(app);

      // Store Firebase methods for later use
      this.firebase = { ref, set, get, onValue, off, remove, serverTimestamp };

      // Sign in anonymously
      const userCredential = await signInAnonymously(this.auth);
      this.currentUserId = userCredential.user.uid;

      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get active users count efficiently (single read, no continuous connection)
   * Counts users active in last 2 minutes
   */
  async getActiveUsersCount() {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, get } = this.firebase;
    const presenceRef = ref(this.db, 'presence');
    const snapshot = await get(presenceRef);

    if (!snapshot.exists()) return 0;

    const now = Date.now();
    const ACTIVE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

    let count = 0;
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.lastSeen && (now - data.lastSeen) < ACTIVE_THRESHOLD) {
        count++;
      }
    });

    return count;
  }

  /**
   * Update user presence (called periodically via heartbeat)
   * Uses simple timestamp update - very efficient
   */
  async updatePresence(userId = this.currentUserId, metadata = {}) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, set } = this.firebase;
    const userPresenceRef = ref(this.db, `presence/${userId}`);

    await set(userPresenceRef, {
      lastSeen: Date.now(),
      ...metadata
    });
  }

  /**
   * Start automatic presence heartbeat
   * Calls updatePresence every 60 seconds
   */
  startPresenceHeartbeat(intervalMs = 60000, metadata = {}) {
    // Initial update
    this.updatePresence(this.currentUserId, metadata);

    // Setup interval
    this.presenceInterval = setInterval(() => {
      this.updatePresence(this.currentUserId, metadata);
    }, intervalMs);
  }

  /**
   * Stop presence heartbeat
   */
  stopPresenceHeartbeat() {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }
  }

  /**
   * Remove user presence
   */
  async removePresence(userId = this.currentUserId) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, remove } = this.firebase;
    const userPresenceRef = ref(this.db, `presence/${userId}`);
    await remove(userPresenceRef);
  }

  /**
   * Subscribe to active users count (real-time)
   * Only use this if you need live updates, otherwise use getActiveUsersCount()
   */
  subscribeToActiveUsers(callback) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, onValue, off } = this.firebase;
    const presenceRef = ref(this.db, 'presence');

    const listener = onValue(presenceRef, (snapshot) => {
      const now = Date.now();
      const ACTIVE_THRESHOLD = 2 * 60 * 1000;

      let count = 0;
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          if (data.lastSeen && (now - data.lastSeen) < ACTIVE_THRESHOLD) {
            count++;
          }
        });
      }

      callback(count);
    });

    // Return unsubscribe function
    return () => off(presenceRef, 'value', listener);
  }

  // === FOCUS ROOMS ===

  /**
   * Get list of active focus rooms
   */
  async getFocusRooms() {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, get } = this.firebase;
    const roomsRef = ref(this.db, 'focusRooms');
    const snapshot = await get(roomsRef);

    if (!snapshot.exists()) return [];

    const rooms = [];
    const now = Date.now();

    snapshot.forEach((childSnapshot) => {
      const room = { id: childSnapshot.key, ...childSnapshot.val() };

      // Only return active rooms (not completed and not expired)
      if (!room.completed && (!room.endsAt || room.endsAt > now)) {
        rooms.push(room);
      }
    });

    return rooms.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Create a new focus room
   */
  async createFocusRoom(roomData) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, set } = this.firebase;
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const roomRef = ref(this.db, `focusRooms/${roomId}`);

    const room = {
      id: roomId,
      name: roomData.name || 'Focus Room',
      createdBy: this.currentUserId,
      createdAt: Date.now(),
      maxParticipants: roomData.maxParticipants || 10,
      duration: roomData.duration || 1500, // 25 min default
      participants: {},
      timerStartedAt: null,
      timerEndsAt: null,
      completed: false,
      isPublic: roomData.isPublic !== false
    };

    await set(roomRef, room);
    return room;
  }

  /**
   * Join a focus room
   */
  async joinFocusRoom(roomId, userId = this.currentUserId, userInfo = {}) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, set, get } = this.firebase;
    const roomRef = ref(this.db, `focusRooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      throw new Error('Room not found');
    }

    const room = snapshot.val();
    const participantCount = Object.keys(room.participants || {}).length;

    if (participantCount >= room.maxParticipants) {
      throw new Error('Room is full');
    }

    const participantRef = ref(this.db, `focusRooms/${roomId}/participants/${userId}`);
    await set(participantRef, {
      joinedAt: Date.now(),
      displayName: userInfo.displayName || `User ${userId.substr(0, 6)}`,
      ...userInfo
    });

    return { ...room, id: roomId };
  }

  /**
   * Leave a focus room
   */
  async leaveFocusRoom(roomId, userId = this.currentUserId) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, remove } = this.firebase;
    const participantRef = ref(this.db, `focusRooms/${roomId}/participants/${userId}`);
    await remove(participantRef);
  }

  /**
   * Subscribe to focus room updates
   */
  subscribeToFocusRoom(roomId, callback) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, onValue, off } = this.firebase;
    const roomRef = ref(this.db, `focusRooms/${roomId}`);

    const listener = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: roomId, ...snapshot.val() });
      } else {
        callback(null);
      }
    });

    const key = `room_${roomId}`;
    this.subscriptions.set(key, { ref: roomRef, listener });

    return () => {
      off(roomRef, 'value', listener);
      this.subscriptions.delete(key);
    };
  }

  /**
   * Send a message to a focus room
   */
  async sendMessage(roomId, userId = this.currentUserId, message) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, set } = this.firebase;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageRef = ref(this.db, `focusRooms/${roomId}/messages/${messageId}`);

    await set(messageRef, {
      id: messageId,
      userId,
      text: message,
      timestamp: Date.now()
    });
  }

  /**
   * Subscribe to room messages
   */
  subscribeToMessages(roomId, callback) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, onValue, off } = this.firebase;
    const messagesRef = ref(this.db, `focusRooms/${roomId}/messages`);

    const listener = onValue(messagesRef, (snapshot) => {
      const messages = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          messages.push(childSnapshot.val());
        });
      }
      messages.sort((a, b) => a.timestamp - b.timestamp);
      callback(messages);
    });

    const key = `messages_${roomId}`;
    this.subscriptions.set(key, { ref: messagesRef, listener });

    return () => {
      off(messagesRef, 'value', listener);
      this.subscriptions.delete(key);
    };
  }

  /**
   * Start room timer
   */
  async startRoomTimer(roomId, duration) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, set } = this.firebase;
    const timerRef = ref(this.db, `focusRooms/${roomId}/timer`);

    const now = Date.now();
    await set(timerRef, {
      startedAt: now,
      endsAt: now + (duration * 1000),
      duration
    });
  }

  /**
   * Subscribe to room timer
   */
  subscribeToRoomTimer(roomId, callback) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, onValue, off } = this.firebase;
    const timerRef = ref(this.db, `focusRooms/${roomId}/timer`);

    const listener = onValue(timerRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : null);
    });

    const key = `timer_${roomId}`;
    this.subscriptions.set(key, { ref: timerRef, listener });

    return () => {
      off(timerRef, 'value', listener);
      this.subscriptions.delete(key);
    };
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect() {
    // Stop heartbeat
    this.stopPresenceHeartbeat();

    // Remove presence
    await this.removePresence();

    // Unsubscribe from all
    this.subscriptions.forEach(({ ref, listener }) => {
      const { off } = this.firebase;
      off(ref, 'value', listener);
    });
    this.subscriptions.clear();

    console.log('Firebase service disconnected');
  }
}

export default FirebaseService;
