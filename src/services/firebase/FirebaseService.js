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
    this.cleanupTimers = new Map(); // timers for scheduled room removals
  this.participantCleanupTimers = new Map(); // periodic cleanup timers for stale participants (creator-only)
    this.config = {};
  }

  /**
   * Initialize Firebase with config
   * @param {Object} config - Firebase config object
   */
  async initialize(config) {
    try {
      const { initializeApp } = await import('firebase/app');
  const { getDatabase, ref, set, get, onValue, off, remove, serverTimestamp, runTransaction, update } = await import('firebase/database');
      const { getAuth, signInAnonymously } = await import('firebase/auth');

      // Initialize Firebase
      const app = initializeApp(config);
      this.db = getDatabase(app);
      this.auth = getAuth(app);

  // Store Firebase methods for later use
  this.firebase = { ref, set, get, onValue, off, remove, serverTimestamp, runTransaction, update };
  // store config (e.g., roomRemovalDelaySec)
  this.config = config || {};

      // Sign in anonymously
      const userCredential = await signInAnonymously(this.auth);
      this.currentUserId = userCredential.user.uid;

      // Helpful debug logs for dev: print authenticated UID and project info
      try {
        console.log('Firebase initialized successfully');
        console.log('Firebase signed-in UID:', this.currentUserId);
        // If config contains projectId, print it to help debug rules vs project mismatch
        if (config && config.projectId) {
          console.log('Firebase projectId:', config.projectId);
        }
      } catch (e) {
        // Ignore logging errors
      }
      // Ensure a simple user profile exists for this uid so we can display a friendly name
      try {
        const { ref, get, set } = this.firebase;
        const userRef = ref(this.db, `users/${this.currentUserId}`);
        const snap = await get(userRef);
        if (snap.exists()) {
          this.currentUserProfile = snap.val();
        } else {
          // Prefer a client-saved display name if available
          const stored = typeof window !== 'undefined' ? window.localStorage.getItem('userDisplayName') : null;
          const displayName = stored || `User ${this.currentUserId.substr(0, 6)}`;
          await set(userRef, { displayName, createdAt: Date.now() });
          if (typeof window !== 'undefined') window.localStorage.setItem('userDisplayName', displayName);
          this.currentUserProfile = { displayName, createdAt: Date.now() };
        }
      } catch (e) {
        // Non-fatal: profile write/read failed
        console.warn('User profile check/write failed', e);
      }
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
   * Get presence entries for a list of user IDs. Returns a map userId -> presence object or null.
   * @param {Array<string>} userIds
   */
  async getPresenceForUserIds(userIds = []) {
    if (!this.db) throw new Error('Service not initialized');
    const { ref, get } = this.firebase;
    const presenceRef = ref(this.db, 'presence');
    const snap = await get(presenceRef);
  const result = {};
    if (!snap.exists()) {
      userIds.forEach(id => { result[id] = null; });
      return result;
    }
    userIds.forEach((id) => {
      if (snap.child && snap.child(id).exists && snap.child(id).exists()) {
        result[id] = snap.child(id).val();
      } else {
        result[id] = null;
      }
    });
    return result;
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

    const { ref, set, get } = this.firebase;

    // Task 4: Check per-user limit (max 1 active room per user)
    const userRoomsRef = ref(this.db, `userRooms/${this.currentUserId}`);
    const userRoomsSnapshot = await get(userRoomsRef);
    if (userRoomsSnapshot.exists()) {
      // Defensive: check if the referenced room actually exists and is active
      const staleRoomId = userRoomsSnapshot.val();
      if (staleRoomId) {
        const staleRoomRef = ref(this.db, `focusRooms/${staleRoomId}`);
        const staleRoomSnap = await get(staleRoomRef);
        if (!staleRoomSnap.exists()) {
          // Room doesn't exist: clean up userRooms
          await set(userRoomsRef, null);
        } else {
          const roomData = staleRoomSnap.val();
          const isCompleted = roomData.completed;
          const participants = roomData.participants || {};
          const hasNoParticipants = Object.keys(participants).length === 0;
          const userIsParticipant = participants[this.currentUserId] !== undefined;
          
          if (isCompleted || hasNoParticipants || !userIsParticipant) {
            // Stale entry: room is completed, empty, or user is not a participant - clean up userRooms
            await set(userRoomsRef, null);
          } else {
            throw new Error('You already have an active room. Leave your current room before creating a new one.');
          }
        }
      } else {
        // Defensive: clean up null/invalid userRooms entry
        await set(userRoomsRef, null);
      }
    }

    // Task 4: Check global limit (max 100 active rooms)
    const focusRoomsRef = ref(this.db, `focusRooms`);
    const focusRoomsSnapshot = await get(focusRoomsRef);
    let activeRoomCount = 0;
    if (focusRoomsSnapshot.exists()) {
      const rooms = focusRoomsSnapshot.val();
      // Count only active and scheduled rooms (not completed)
      activeRoomCount = Object.values(rooms).filter(r => r && r.status !== 'completed').length;
    }
    if (activeRoomCount >= 100) {
      throw new Error('Maximum number of active rooms (100) has been reached. Please try again later.');
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const roomRef = ref(this.db, `focusRooms/${roomId}`);

    const creatorName = roomData.creatorName || (this.currentUserProfile && this.currentUserProfile.displayName) || `User ${this.currentUserId?.substr?.(0,6) || ''}`;

    // Validate maximum session duration (12 hours = 43200 seconds)
    const MAX_DURATION_SEC = 43200; // 12 hours
    const roomDuration = roomData.duration || 1500;
    if (roomDuration > MAX_DURATION_SEC) {
      throw new Error(`Room duration cannot exceed 12 hours (${MAX_DURATION_SEC} seconds). Requested: ${roomDuration} seconds.`);
    }

    const now = Date.now();
    // Determine if room is scheduled (scheduledFor is in the future)
    const scheduledFor = roomData.scheduledFor || null;
    const isScheduled = scheduledFor && scheduledFor > now;

    // Normalize compositeTimer shape if caller provided exercises
    let compositeTimerNormalized = null;
    if (roomData.compositeTimer) {
      if (roomData.compositeTimer.steps) {
        // Ensure all steps have defined values (no undefined)
        compositeTimerNormalized = {
          ...roomData.compositeTimer,
          steps: roomData.compositeTimer.steps.map(step => ({
            name: step.name || 'Unnamed Step',
            duration: step.duration || 60,
            unit: (step.unit === 'seconds' || step.unit === 'sec') ? 'sec' : (step.unit || 'min'),
            type: step.type || 'work',
            color: step.color || '#3b82f6',
            accent: step.accent || step.color || '#3b82f6'
          }))
        };
      } else if (roomData.compositeTimer.exercises) {
        compositeTimerNormalized = {
          ...roomData.compositeTimer,
          steps: roomData.compositeTimer.exercises.map(ex => ({
            name: ex.name || 'Unnamed Exercise',
            duration: ex.duration || 60,
            unit: (ex.unit === 'seconds' || ex.unit === 'sec') ? 'sec' : (ex.unit || 'min'),
            type: ex.type || 'work',
            color: ex.color || '#3b82f6',
            accent: ex.accent || ex.color || '#3b82f6'
          }))
        };
      }
    }

    const room = {
      id: roomId,
      name: roomData.name || 'Focus Room',
      tag: roomData.tag || 'other',
      createdBy: this.currentUserId,
      creatorName,
      createdAt: now, // Store as timestamp (number) for consistency with presence system
      maxParticipants: roomData.maxParticipants || 10,
      duration: roomData.duration || 1500, // 25 min default
      // Phase 2a: Room scheduling
      scheduledFor: scheduledFor || null,
      status: isScheduled ? 'scheduled' : 'active', // 'scheduled', 'active', 'completed'
      // Optional per-room empty-room removal delay (in seconds). If provided, this overrides service/env defaults.
      emptyRoomRemovalDelaySec: typeof roomData.emptyRoomRemovalDelaySec === 'number' ? roomData.emptyRoomRemovalDelaySec : undefined,
      participants: {},
      timerStartedAt: null,
      timerEndsAt: null,
      completed: false,
      isPublic: roomData.isPublic !== false,
      // Store composite timer data if provided
      compositeTimer: compositeTimerNormalized || null,
      timerType: roomData.timerType || (compositeTimerNormalized ? 'composite' : 'single'),
      currentStep: 0
    };

    await set(roomRef, room);
    return room;
  }

  /**
   * Join a focus room
   */
  async joinFocusRoom(roomId, userId = this.currentUserId, userInfo = {}) {
    if (!this.db) throw new Error('Service not initialized');
    const { ref, set, get, runTransaction } = this.firebase;

    const roomRef = ref(this.db, `focusRooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      throw new Error('Room not found');
    }

    const room = snapshot.val();
    const participantCount = Object.keys(room.participants || {}).length;

    // Check if room is scheduled and time hasn't arrived yet
    if (room.status === 'scheduled' && room.scheduledFor && Date.now() < room.scheduledFor) {
      throw new Error('This room is scheduled for ' + new Date(room.scheduledFor).toLocaleString() + '. You cannot join until the scheduled time.');
    }

    if (participantCount >= room.maxParticipants) {
      throw new Error('Room is full');
    }

    // Use a transaction on userRooms/{userId} to claim this user atomically
    const userRoomsRef = ref(this.db, `userRooms/${userId}`);

    let txResult;
    try {
      txResult = await runTransaction(userRoomsRef, (current) => {
        // If user not in any room, claim this room
        if (current === null || current === undefined) return roomId;
        // If already in same room, keep it
        if (current === roomId) return roomId;
        // Otherwise abort (return undefined cancels the transaction)
        return;
      });
    } catch (err) {
      // Convert Firebase permission errors to a clearer message
      if (err && err.code && (err.code === 'PERMISSION_DENIED' || (err.message && err.message.toLowerCase().includes('permission_denied')))) {
        throw new Error('Permission denied: update your Realtime Database rules to allow authenticated writes to userRooms (see FIREBASE-SETUP.md). Also ensure Anonymous Auth is enabled.');
      }
      throw err;
    }

    if (!txResult.committed) {
      const existing = txResult.snapshot ? txResult.snapshot.val() : null;
      if (existing && existing !== roomId) {
        throw new Error('User already in another room');
      }
      throw new Error('Failed to claim userRooms entry');
    }

    // Now add the participant entry. If this fails, roll back the userRooms claim.
    const participantRef = ref(this.db, `focusRooms/${roomId}/participants/${userId}`);
    try {
      // Try to include any existing avatar from the user's profile
      const userRef = ref(this.db, `users/${userId}`);
      const userSnap = await get(userRef);
      let avatarUrl = null;
      if (userSnap.exists()) {
        const profile = userSnap.val();
        avatarUrl = profile.avatarUrl || null;
      }

      // If no avatar exists, generate a session avatar using DiceBear and mark it as a session avatar
      if (!avatarUrl) {
        try {
          avatarUrl = await this.setUserAvatarFromSeed(userId, true);
        } catch (e) {
          // non-fatal, continue without avatar
          console.warn('Failed to generate session avatar:', e);
          avatarUrl = null;
        }
      }

      await set(participantRef, {
        joinedAt: Date.now(),
        displayName: userInfo.displayName || `User ${userId.substr(0, 6)}`,
        avatarUrl,
        ...userInfo
      });
      // If a scheduled cleanup/removal exists for this room (eg. room was empty), cancel it because someone re-joined
      if (this.cleanupTimers.has(roomId)) {
        clearTimeout(this.cleanupTimers.get(roomId));
        this.cleanupTimers.delete(roomId);
        console.log(`Cancelled scheduled removal for room ${roomId} because a participant re-joined`);
      }
    } catch (err) {
      // Rollback userRooms
      try { await set(userRoomsRef, null); } catch (e) { console.error('Rollback failed', e); }
      if (err && err.code && (err.code === 'PERMISSION_DENIED' || (err.message && err.message.toLowerCase().includes('permission_denied')))) {
        throw new Error('Permission denied when adding participant: ensure Realtime DB rules allow authenticated users to write to focusRooms/{roomId}/participants/{userId} and that Anonymous Auth is enabled.');
      }
      throw err;
    }

    return { ...room, id: roomId };
  }

  /**
   * Leave a focus room
   */
  async leaveFocusRoom(roomId, userId = this.currentUserId) {
    if (!this.db) throw new Error('Service not initialized');

    const { ref, update } = this.firebase;

    // Remove both participant entry and userRooms mapping atomically
    const rootRef = ref(this.db, '/');
    const updates = {};
    updates[`focusRooms/${roomId}/participants/${userId}`] = null;
    updates[`userRooms/${userId}`] = null;

    try {
      await update(rootRef, updates);
    } catch (err) {
      if (err && err.code && (err.code === 'PERMISSION_DENIED' || (err.message && err.message.toLowerCase().includes('permission_denied')))) {
        throw new Error('Permission denied when leaving room: ensure Realtime DB rules allow the user to remove their participant and userRooms entries.');
      }
      throw err;
    }
    // If this user had a session avatar (generated for the room), remove it
    try {
      await this.removeSessionAvatar(userId);
    } catch (e) {
      // non-fatal
      console.warn('Failed to remove session avatar:', e);
    }
    // After leaving, check if the room now has zero participants; if so and there's a timer, schedule removal after 2 minutes
    try {
      const { ref, get } = this.firebase;
      const roomRef = ref(this.db, `focusRooms/${roomId}`);
      const snap = await get(roomRef);
      if (snap.exists()) {
        const room = snap.val();
        const participants = room.participants || {};
        const participantsCount = Object.keys(participants).length;
        if (participantsCount === 0 && room.timer) {
          // Determine delay. Priority: room.emptyRoomRemovalDelaySec -> config.emptyRoomRemovalDelaySec -> config.roomRemovalDelaySec -> REACT_APP_EMPTY_ROOM_REMOVAL_DELAY_SEC -> REACT_APP_ROOM_REMOVAL_DELAY_SEC -> default 120 sec
          const cfg = this.config || {};
          const envEmpty = parseInt(process.env.REACT_APP_EMPTY_ROOM_REMOVAL_DELAY_SEC || '', 10);
          const envRoom = parseInt(process.env.REACT_APP_ROOM_REMOVAL_DELAY_SEC || '', 10);
          // Prefer a per-room override if the room defines emptyRoomRemovalDelaySec
          const delaySec = (typeof room.emptyRoomRemovalDelaySec === 'number' && room.emptyRoomRemovalDelaySec)
            || (typeof cfg.emptyRoomRemovalDelaySec === 'number' && cfg.emptyRoomRemovalDelaySec)
            || cfg.roomRemovalDelaySec
            || envEmpty
            || envRoom
            || 120;
          const delayMs = delaySec * 1000;
          if (this.cleanupTimers.has(roomId)) {
            clearTimeout(this.cleanupTimers.get(roomId));
            this.cleanupTimers.delete(roomId);
          }
          console.log(`Room ${roomId} has no participants but a timer; scheduling removal in ${delayMs}ms`);
          const timeoutId = setTimeout(async () => {
            try {
              console.log(`Scheduled empty-room removal executing for ${roomId} by ${this.currentUserId}`);
              // Fetch latest room state
              const latestSnap = await get(roomRef);
              if (!latestSnap.exists()) return;
              const latestRoom = latestSnap.val();
              const latestParticipants = latestRoom.participants || {};
              if (Object.keys(latestParticipants).length === 0) {
                // Attempt full removal if we are creator, otherwise mark completed
                if (latestRoom.createdBy && latestRoom.createdBy === this.currentUserId) {
                  const { ref: rootRef, update } = this.firebase;
                  const updates2 = {};
                  updates2[`focusRooms/${roomId}`] = null;
                  updates2[`userRooms/${latestRoom.createdBy}`] = null;
                  console.log('Attempting full removal updates:', updates2);
                  await update(rootRef(this.db, '/'), updates2);
                  console.log(`Empty room ${roomId} removed by creator ${this.currentUserId}`);
                } else {
                  // mark completed (safe for non-creator)
                  const { ref: rootRef, update } = this.firebase;
                  const updates2 = {};
                  updates2[`focusRooms/${roomId}/completed`] = true;
                  updates2[`focusRooms/${roomId}/timer`] = null;
                  console.log('Attempting mark-completed updates:', updates2);
                  await update(rootRef(this.db, '/'), updates2);
                  console.log(`Empty room ${roomId} marked completed by non-creator ${this.currentUserId}`);
                }
              } else {
                console.log(`Empty-room removal aborted for ${roomId}: participants re-joined`);
              }
            } catch (err) {
              console.error('Failed scheduled empty-room removal:', err);
            } finally {
              this.cleanupTimers.delete(roomId);
            }
          }, delayMs);
          this.cleanupTimers.set(roomId, timeoutId);
        }
      }
    } catch (e) {
      console.warn('Post-leave room check failed:', e);
    }

    // Clean up any subscriptions for this room to prevent ghost updates
    const keysToCleanup = [`room_${roomId}`, `messages_${roomId}`, `timer_${roomId}`];
    keysToCleanup.forEach(key => {
      const sub = this.subscriptions.get(key);
      if (sub) {
        try {
          const { off } = this.firebase;
          off(sub.ref, 'value', sub.listener);
          this.subscriptions.delete(key);
          console.log(`Cleaned up subscription for ${key} after user ${userId} left room ${roomId}`);
        } catch (e) {
          console.warn('Failed to cleanup subscription', key, e);
        }
      }
    });

    console.log(`User ${userId} left room ${roomId}. Subscriptions remaining:`, this.subscriptions.size);
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

    // If the current client is the room creator, start a periodic cleanup job to remove stale participants
    // This will run whenever we receive an update and the room indicates this client is creator
    const maybeStartCreatorCleanup = async (snapshotVal) => {
      try {
        const room = snapshotVal;
        if (!room) return;
        if (room.createdBy && room.createdBy === this.currentUserId) {
          // start cleanup if not already running
          if (!this.participantCleanupTimers.has(roomId)) {
            const intervalMs = 60 * 1000; // run every minute
            const inactiveThresholdMs = (2 * 60 * 1000); // 2 minutes
            const timerId = setInterval(async () => {
              try {
                await this.cleanupStaleParticipants(roomId, inactiveThresholdMs);
              } catch (e) {
                console.warn('Participant cleanup failed for', roomId, e);
              }
            }, intervalMs);
            this.participantCleanupTimers.set(roomId, timerId);
          }
        } else {
          // not creator: ensure no cleanup running
          if (this.participantCleanupTimers.has(roomId)) {
            clearInterval(this.participantCleanupTimers.get(roomId));
            this.participantCleanupTimers.delete(roomId);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    // run initial check based on current snapshot value
    // Note: listener above already calls callback with snapshot val; we also fetch once to decide cleanup start
    (async () => {
      try {
        const snap = await this.firebase.get(roomRef);
        maybeStartCreatorCleanup(snap.exists() ? snap.val() : null);
      } catch (e) {}
    })();

    return () => {
      off(roomRef, 'value', listener);
      // stop any creator cleanup for this room
      if (this.participantCleanupTimers.has(roomId)) {
        clearInterval(this.participantCleanupTimers.get(roomId));
        this.participantCleanupTimers.delete(roomId);
      }
      this.subscriptions.delete(key);
    };
  }

  /**
   * Remove stale participants from a room. Only the room creator should call this.
   * It looks at presence/{uid}.lastSeen and removes participants whose lastSeen is older than inactiveThresholdMs.
   */
  async cleanupStaleParticipants(roomId, inactiveThresholdMs = 2 * 60 * 1000) {
    if (!this.db) throw new Error('Service not initialized');
    const { ref, get, update } = this.firebase;

    const roomRef = ref(this.db, `focusRooms/${roomId}`);
    const roomSnap = await get(roomRef);
    if (!roomSnap.exists()) return;
    const room = roomSnap.val();

    // Only the creator may remove other participants
    if (!room.createdBy || room.createdBy !== this.currentUserId) return;

    const participants = room.participants || {};
    if (Object.keys(participants).length === 0) return;

    const presenceRef = ref(this.db, 'presence');
    const presenceSnap = await get(presenceRef);
    const now = Date.now();

    const updates = {};
    let any = false;
    Object.keys(participants).forEach((uid) => {
      if (uid === room.createdBy) return; // never remove creator
      const p = presenceSnap.exists() && presenceSnap.child(uid).exists() ? presenceSnap.child(uid).val() : null;
      const lastSeen = p && p.lastSeen ? p.lastSeen : 0;
      if ((now - lastSeen) > inactiveThresholdMs) {
        updates[`focusRooms/${roomId}/participants/${uid}`] = null;
        updates[`userRooms/${uid}`] = null;
        any = true;
      }
    });

    if (any) {
      await update(ref(this.db, '/'), updates);
    }
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
  async startRoomTimer(roomId, duration, timerType = 'timer', timerData = null) {
    if (!this.db) throw new Error('Service not initialized');

    // Defensive normalization: accept `timerData` in either { steps: [...] } or { exercises: [...] } shape
    if (timerType === 'composite' && timerData && !timerData.steps && timerData.exercises) {
      try {
        timerData.steps = timerData.exercises.map(ex => ({
          name: ex.name || 'Unnamed Exercise',
          duration: ex.duration || 60,
          unit: (ex.unit === 'seconds' || ex.unit === 'sec') ? 'sec' : (ex.unit || 'min'),
          type: ex.type || 'work',
          color: ex.color || '#3b82f6',
          accent: ex.accent || ex.color || '#3b82f6'
        }));
      } catch (e) {
        // If normalization fails, leave timerData as-is and let later checks fail cleanly
        // Only log if in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to normalize composite timerData.exercises -> steps', e);
        }
      }
    }

    // Validate maximum session duration (12 hours = 43200 seconds)
    const MAX_DURATION_SEC = 43200; // 12 hours
    if (duration > MAX_DURATION_SEC) {
      throw new Error(`Timer duration cannot exceed 12 hours (${MAX_DURATION_SEC} seconds). Requested: ${duration} seconds.`);
    }

    // For composite timers, also validate total duration
    if (timerType === 'composite' && timerData?.steps) {
      const totalDurationSec = timerData.steps.reduce((total, step) => {
        return total + (step.unit === 'sec' ? step.duration : step.duration * 60);
      }, 0);
      
      if (totalDurationSec > MAX_DURATION_SEC) {
        throw new Error(`Composite timer total duration cannot exceed 12 hours (${MAX_DURATION_SEC} seconds). Total: ${totalDurationSec} seconds.`);
      }
    } else if (timerType === 'composite' && timerData?.exercises) {
      const totalDurationSec = timerData.exercises.reduce((total, exercise) => {
        return total + (exercise.unit === 'sec' || exercise.unit === 'seconds' ? exercise.duration : exercise.duration * 60);
      }, 0);
      
      if (totalDurationSec > MAX_DURATION_SEC) {
        throw new Error(`Composite timer total duration cannot exceed 12 hours (${MAX_DURATION_SEC} seconds). Total: ${totalDurationSec} seconds.`);
      }
    }

    const { ref, set, get, update } = this.firebase;

    // Check if room is scheduled and time hasn't arrived yet
    const roomRef = ref(this.db, `focusRooms/${roomId}`);
    const roomSnapshot = await get(roomRef);
    if (!roomSnapshot.exists()) {
      throw new Error('Room not found');
    }
    const room = roomSnapshot.val();
    if (room.status === 'scheduled' && room.scheduledFor && Date.now() < room.scheduledFor) {
      throw new Error('This room is scheduled for ' + new Date(room.scheduledFor).toLocaleString() + '. You cannot start the timer until the scheduled time.');
    }

    // Handle composite timers
    let timerDuration = duration;
    if (timerType === 'composite' && timerData?.steps) {
      const currentStepData = timerData.steps[timerData.currentStep || 0];
      timerDuration = currentStepData ? (currentStepData.unit === 'sec' ? currentStepData.duration : currentStepData.duration * 60) : duration;
    } else if (timerType === 'composite' && timerData?.exercises) {
      const currentExerciseData = timerData.exercises[timerData.currentStep || 0];
      timerDuration = currentExerciseData ? (currentExerciseData.unit === 'sec' || currentExerciseData.unit === 'seconds' ? currentExerciseData.duration : currentExerciseData.duration * 60) : duration;
    }

    const timerRef = ref(this.db, `focusRooms/${roomId}/timer`);
    const now = Date.now();
    await set(timerRef, {
      startedAt: now,
      endsAt: now + (timerDuration * 1000),
      duration: timerDuration
    });

    // Update room with timerType and compositeTimer
    const roomUpdate = { timerType };
    if (timerType === 'composite' && timerData) {
      roomUpdate.compositeTimer = timerData;
      roomUpdate.currentStep = timerData.currentStep || 0;
    } else {
      roomUpdate.compositeTimer = null;
      roomUpdate.currentStep = 0;
    }
    await update(roomRef, roomUpdate);
    // Schedule room removal after timer end + configured delay
    try {
      const delaySec = (this.config && this.config.roomRemovalDelaySec) || parseInt(process.env.REACT_APP_ROOM_REMOVAL_DELAY_SEC || '30', 10);
      const totalMs = (duration + delaySec) * 1000;
      if (this.cleanupTimers.has(roomId)) {
        clearTimeout(this.cleanupTimers.get(roomId));
      }
      const timeoutId = setTimeout(async () => {
        try {
          // Double-check room still exists and timer ended
          const { get, ref, update } = this.firebase;
          const roomRef = ref(this.db, `focusRooms/${roomId}`);
          const snap = await get(roomRef);
          if (!snap.exists()) return;
          const room = snap.val();
          const now2 = Date.now();
          if (room.timer && room.timer.endsAt && room.timer.endsAt <= now2) {
            // If this client is the creator, perform full removal (remove room and the creator's userRooms mapping).
            // Otherwise, mark the room as completed so it no longer appears active. Deleting a room from a different
            // anonymous client will often fail due to security rules that restrict deletions to the creator.
            if (room.createdBy && room.createdBy === this.currentUserId) {
              const rootRef = ref(this.db, '/');
              const updates = {};
              updates[`focusRooms/${roomId}`] = null;
              updates[`userRooms/${room.createdBy}`] = null;
              await update(rootRef, updates);
              console.log(`Room ${roomId} removed after timeout by creator`);
            } else {
              // Mark room as completed and clear the timer so viewers know it's finished.
              const roomUpdates = {};
              roomUpdates[`focusRooms/${roomId}/completed`] = true;
              roomUpdates[`focusRooms/${roomId}/timer`] = null;
              await update(ref(this.db, '/'), roomUpdates);
              console.log(`Room ${roomId} marked completed after timeout (cleanup by non-creator)`);
            }
          }
        } catch (err) {
          console.error('Failed to auto-remove room:', err);
        } finally {
          this.cleanupTimers.delete(roomId);
        }
      }, totalMs);
      this.cleanupTimers.set(roomId, timeoutId);
    } catch (e) {
      console.error('Failed to schedule room removal:', e);
    }
  }

  /**
   * Extend room timer by the specified duration (in milliseconds)
   * Only the room owner can extend the timer
   * @param {string} roomId
   * @param {number} extensionMs - milliseconds to add to the timer (max 30 min)
   */
  async extendRoomTimer(roomId, extensionMs) {
    if (!this.db) throw new Error('Service not initialized');
    const { ref, get, update } = this.firebase;

    // Max extension: 30 minutes
    const MAX_EXTENSION_MS = 30 * 60 * 1000;
    if (extensionMs > MAX_EXTENSION_MS) {
      throw new Error(`Extension exceeds maximum of 30 minutes (got ${Math.floor(extensionMs / 1000 / 60)} min)`);
    }

    // Verify current user is the room owner
    const roomRef = ref(this.db, `focusRooms/${roomId}`);
    const snap = await get(roomRef);
    if (!snap.exists()) throw new Error('Room not found');

    const room = snap.val();
    if (room.createdBy !== this.currentUserId) {
      throw new Error('Only the room owner can extend the timer');
    }

    if (!room.timer || !room.timer.endsAt) {
      throw new Error('Timer not started');
    }

    // Check that total duration won't exceed 12 hours
    const MAX_TOTAL_DURATION_SEC = 43200; // 12 hours
    const currentDuration = room.timer.duration || 0;
    const newTotalDuration = currentDuration + extensionMs / 1000;
    
    if (newTotalDuration > MAX_TOTAL_DURATION_SEC) {
      throw new Error(`Total timer duration cannot exceed 12 hours (${MAX_TOTAL_DURATION_SEC} seconds). Current: ${Math.floor(currentDuration)}s, Extension would make: ${Math.floor(newTotalDuration)}s.`);
    }

    // Extend the timer
    const newEndsAt = room.timer.endsAt + extensionMs;
    const newDuration = room.timer.duration + extensionMs / 1000;

    const timerRef = ref(this.db, `focusRooms/${roomId}/timer`);
    await update(timerRef, {
      endsAt: newEndsAt,
      duration: newDuration,
      extendedAt: Date.now()
    });

    console.log(`Room ${roomId} timer extended by ${extensionMs}ms to ${new Date(newEndsAt).toISOString()}`);
  }

  /**
   * Delete a room manually. Only allowed for the creator when there are no other joiners.
   * @param {string} roomId
   * @param {string} requesterId
   */
  async deleteFocusRoom(roomId, requesterId = this.currentUserId) {
    if (!this.db) throw new Error('Service not initialized');
    const { ref, get, update } = this.firebase;
    const roomRef = ref(this.db, `focusRooms/${roomId}`);
    const snap = await get(roomRef);
    if (!snap.exists()) throw new Error('Room not found');
    const room = snap.val();
    const participants = room.participants || {};
    const participantCount = Object.keys(participants).length;

    // Allow deletion only if requester is creator and there are no other joiners
    if (room.createdBy !== requesterId) {
      throw new Error('Only the room creator can delete this room');
    }
    // If only creator is present or no participants, allow deletion
    if (participantCount <= 1 && (!participants || Object.keys(participants).every(id => id === requesterId))) {
      const rootRef = ref(this.db, '/');
      const updates = {};
      updates[`focusRooms/${roomId}`] = null;
      // Clean up userRooms mapping for all participants (not just creator)
      Object.keys(participants).forEach(uid => {
        updates[`userRooms/${uid}`] = null;
      });
      updates[`userRooms/${requesterId}`] = null;
      await update(rootRef, updates);
      // clear any scheduled cleanup
      if (this.cleanupTimers.has(roomId)) {
        clearTimeout(this.cleanupTimers.get(roomId));
        this.cleanupTimers.delete(roomId);
      }
      return true;
    }

    throw new Error('Cannot delete room: there are other participants');
  }

  /**
   * Update room settings (partial update). Caller should be authorized (creator typically).
   * @param {string} roomId
   * @param {Object} updates - partial fields to update under focusRooms/{roomId}
   */
  async updateRoomSettings(roomId, updates = {}) {
    if (!this.db) throw new Error('Service not initialized');
    const { ref, update } = this.firebase;
    try {
      const roomRef = ref(this.db, `focusRooms/${roomId}`);
      // update at the room ref to apply partial updates
      await update(roomRef, updates);
      return true;
    } catch (err) {
      if (err && err.code && (err.code === 'PERMISSION_DENIED' || (err.message && err.message.toLowerCase().includes('permission_denied')))) {
        throw new Error('Permission denied when updating room settings: ensure your Realtime DB rules allow the room creator to update room metadata.');
      }
      throw err;
    }
  }

  /**
   * Fetch a user's profile (displayName etc.)
   * @param {string} uid
   */
  async getUserProfile(uid) {
    if (!this.db) throw new Error('Service not initialized');
    const { ref, get } = this.firebase;
    const userRef = ref(this.db, `users/${uid}`);
    const snap = await get(userRef);
    return snap.exists() ? snap.val() : null;
  }

  /**
   * Generate and set a DiceBear avatar URL for the user. If isSession is true,
   * mark avatarSession=true so it can be removed when the user leaves.
   * Returns the avatarUrl string.
   */
  async setUserAvatarFromSeed(seed, isSession = false) {
    if (!this.db) throw new Error('Service not initialized');
    const { ref, set, get } = this.firebase;
    const uid = this.currentUserId || seed;

    // Use the seed (prefer numeric uid, fallback to provided string)
    const avatarSeed = encodeURIComponent(String(seed || uid));
    // DiceBear identicon SVG URL (public service) - SVG is fine for <img>
    const avatarUrl = `https://api.dicebear.com/8.x/identicon/svg?seed=${avatarSeed}`;

    const userRef = ref(this.db, `users/${uid}`);
    // Write avatar url and optional session flag
    const payload = { avatarUrl };
    if (isSession) payload.avatarSession = true;

    await set(userRef, { ...((await get(userRef)).val() || {}), ...payload });
    return avatarUrl;
  }

  /**
   * If the user's profile has avatarSession === true, remove avatarUrl and avatarSession.
   */
  async removeSessionAvatar(uid = this.currentUserId) {
    if (!this.db) throw new Error('Service not initialized');
    const { ref, get, set } = this.firebase;
    const userRef = ref(this.db, `users/${uid}`);
    const snap = await get(userRef);
    if (!snap.exists()) return false;
    const profile = snap.val();
    if (profile.avatarSession) {
      const newProfile = { ...profile };
      delete newProfile.avatarUrl;
      delete newProfile.avatarSession;
      await set(userRef, newProfile);
      return true;
    }
    return false;
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
