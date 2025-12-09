import { useState, useEffect, useCallback, useRef } from 'react';
import RealtimeServiceFactory, { ServiceType } from '../services/RealtimeServiceFactory';
import firebaseConfig from '../config/firebase.config';

/**
 * Hook for managing focus rooms
 *
 * Usage:
 *   const {
 *     rooms, currentRoom, messages,
 *     createRoom, joinRoom, leaveRoom,
 *     sendMessage, startTimer
 *   } = useFocusRoom();
 */
const useFocusRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [roomTimer, setRoomTimer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Track room IDs that we're already subscribed to (avoid duplicate subscriptions)
  const subscribedRoomIdsRef = useRef(new Set());
  // Track unsub functions per room so we can clean them up
  const subscriptionsRef = useRef(new Map());

  /**
   * Initial fetch to get room list, then subscribe to each room for real-time updates
   */
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      let service;
      try {
        service = RealtimeServiceFactory.getService();
      } catch (err) {
        // Service not initialized yet — initialize for read-only room list (allowFallback=true)
        try {
          await RealtimeServiceFactory.createService(ServiceType.FIREBASE, firebaseConfig, { allowFallback: true });
          service = RealtimeServiceFactory.getService();
        } catch (e) {
          console.error('Failed to initialize realtime service for fetching rooms:', e);
          setLoading(false);
          return;
        }
      }
      const fetchedRooms = await service.getFocusRooms();

      // Merge fetched rooms with existing state to preserve unchanged object references
      // Additionally: for any room that exists in previous state but not in fetchedRooms,
      // check whether the room still exists on the backend (subscribe once). Only remove
      // the room from UI/state if it truly does not exist anymore. If it exists (even
      // if not in the fetched list due to completion/filters), keep it to avoid churn.
      setRooms((prevRooms) => {
        if (!prevRooms || prevRooms.length === 0) return fetchedRooms;
        const prevMap = new Map(prevRooms.map(r => [r.id, r]));
        const fetchedMap = new Map(fetchedRooms.map(r => [r.id, r]));

        // Start with the merged list for rooms returned by the backend
        const merged = fetchedRooms.map((r) => {
          const existing = prevMap.get(r.id);
          if (!existing) return r;
          // Deep-compare serialized form to decide if we can reuse the existing object reference.
          // This avoids churn caused by new object references for nested fields like participants/messages.
          try {
            const a = JSON.stringify(existing);
            const b = JSON.stringify(r);
            if (a === b) return existing;
          } catch (e) {
            // If serialization fails for any reason, fall back to shallow compare
            const keys = Object.keys(r);
            let changed = false;
            for (let i = 0; i < keys.length; i++) {
              const k = keys[i];
              if (existing[k] !== r[k]) { changed = true; break; }
            }
            if (!changed) return existing;
          }
          return r;
        });

        // For rooms that were in prevRooms but not in fetchedRooms, keep them for now.
        // We'll asynchronously validate their existence and prune those that truly vanished.
        const missing = prevRooms.filter(r => !fetchedMap.has(r.id));
        missing.forEach(m => merged.push(m));

        return merged;
      });

      // After optimistic merge, validate missing rooms: if a room no longer exists on the backend,
      // remove it from state. We do this outside of setRooms to avoid blocking the UI.
      (async () => {
        try {
          // Identify which rooms are currently in state but not in fetchedRooms
          // We need a fresh snapshot of current rooms state to operate on.
          setRooms((current) => {
            const fetchedMap = new Map(fetchedRooms.map(r => [r.id, r]));
            const candidates = [];
            current.forEach((room) => {
              if (!fetchedMap.has(room.id)) candidates.push(room);
            });

            // For each candidate, perform a one-time subscribe to check existence and presence.
            // Remove the room only if the room no longer exists OR all participants are offline > 2 minutes.
            const INACTIVE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes
            candidates.forEach((candidate) => {
              try {
                const unsub = service.subscribeToFocusRoom(candidate.id, async (val) => {
                  try {
                    // If backend reports null (room truly removed), prune it from state
                    if (!val) {
                      setRooms((cur) => cur.filter(r => r.id !== candidate.id));
                      return;
                    }

                    // If room exists, check participants' presence
                    const participantIds = val && val.participants ? Object.keys(val.participants) : [];
                    if (participantIds.length === 0) {
                      // No participants — treat as inactive and remove
                      setRooms((cur) => cur.filter(r => r.id !== candidate.id));
                      return;
                    }

                    // Ask service for presence info for these participant IDs
                    if (typeof service.getPresenceForUserIds !== 'function') {
                      // If service doesn't support presence lookup, keep the room to avoid false removals
                      return;
                    }

                    let presenceMap = {};
                    try {
                      presenceMap = await service.getPresenceForUserIds(participantIds);
                    } catch (e) {
                      // If presence lookup fails, keep the room (safer)
                      console.warn('Presence lookup failed for', candidate.id, e);
                      return;
                    }

                    const now = Date.now();
                    const anyOnline = participantIds.some((pid) => {
                      const p = presenceMap && presenceMap[pid] ? presenceMap[pid] : null;
                      return p && p.lastSeen && (now - p.lastSeen) < INACTIVE_THRESHOLD_MS;
                    });

                    if (!anyOnline) {
                      // All participants are offline beyond threshold — remove room from UI
                      setRooms((cur) => cur.filter(r => r.id !== candidate.id));
                    }
                  } finally {
                    // cleanup listener immediately
                    try { if (typeof unsub === 'function') unsub(); } catch (e) {}
                  }
                });
              } catch (err) {
                // If subscribe fails, do nothing — safer to keep room in UI than to remove it wrongly
                console.warn('One-time room existence/presence check failed for', candidate.id, err);
              }
            });

            return current;
          });
        } catch (err) {
          // ignore validation errors
        }
      })();
      setError(null);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Join a focus room
   */
  const joinRoom = useCallback(async (roomId, userInfo = {}) => {
    // Prevent joining multiple rooms
    if (currentRoom && currentRoom.id && currentRoom.id !== roomId) {
      const errMsg = 'You are already in a room. Please leave the current room before joining another.';
      setError(errMsg);
      throw new Error(errMsg);
    }
    try {
      setLoading(true);
      let service;
      try {
        // Ensure a realtime service is initialized. For joining a room we require a real backend (no mock fallback).
        service = RealtimeServiceFactory.getServiceSafe();
        if (!service) {
          await RealtimeServiceFactory.createService(ServiceType.FIREBASE, firebaseConfig, { allowFallback: false });
          service = RealtimeServiceFactory.getService();
        }
      } catch (err) {
        setError('Service not ready');
        setLoading(false);
        return;
      }
      const room = await service.joinFocusRoom(roomId, undefined, userInfo);

      setCurrentRoom(room);
      setError(null);

      // Start presence heartbeat for this user when they join a room
      try {
        if (service && service.startPresenceHeartbeat) {
          service.startPresenceHeartbeat();
          // Also perform an immediate presence update
          service.updatePresence().catch(() => {});
        }
      } catch (e) {
        // ignore heartbeat errors
      }

      // Subscribe to room updates
      const unsubscribeRoom = service.subscribeToFocusRoom(roomId, (updatedRoom) => {
        if (updatedRoom) {
          setCurrentRoom(updatedRoom);
        } else {
          // Room was deleted
          setCurrentRoom(null);
        }
      });

      // Subscribe to messages
      const unsubscribeMessages = service.subscribeToMessages(roomId, (msgs) => {
        setMessages(msgs);
      });

      // Subscribe to timer
      const unsubscribeTimer = service.subscribeToRoomTimer(roomId, (timer) => {
        setRoomTimer(timer);
      });

      // Store unsubscribe functions
      room._unsubscribe = () => {
        unsubscribeRoom();
        unsubscribeMessages();
        unsubscribeTimer();
      };

      return room;
    } catch (err) {
      console.error('Failed to join room:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentRoom]);

  /**
   * Create a new focus room
   */
  const createRoom = useCallback(async (roomData) => {
    // Prevent creating/joining new room when already in one
    if (currentRoom && currentRoom.id) {
      const errMsg = 'You are already in a room. Leave it before creating a new one.';
      setError(errMsg);
      throw new Error(errMsg);
    }
    try {
      setLoading(true);
      let service;
      try {
        // Creating rooms requires real Firebase backend (allowFallback=false)
        service = RealtimeServiceFactory.getServiceSafe();
        if (!service) {
          // Service not initialized yet, create it
          await RealtimeServiceFactory.createService(ServiceType.FIREBASE, firebaseConfig, { allowFallback: false });
          service = RealtimeServiceFactory.getService();
        }
      } catch (err) {
        // Service not initialized yet
        console.error('Service initialization error:', err);
        setError('Service not ready. Please wait a moment and try again.');
        setLoading(false);
        throw err;
      }

      const room = await service.createFocusRoom(roomData);

      // Auto-join the created room only if it's not scheduled
      if (room.status !== 'scheduled') {
        // Get or generate display name for the creator
        let displayName = localStorage.getItem('userDisplayName');
        if (!displayName || roomData.creatorName) {
          // Use the creatorName from roomData if provided, otherwise generate one
          if (roomData.creatorName) {
            displayName = roomData.creatorName;
          } else {
            const service = RealtimeServiceFactory.getServiceSafe();
            const userId = service?.currentUserId || 'anonymous';
            displayName = `User ${userId.substring(0, 5)}`;
          }
          localStorage.setItem('userDisplayName', displayName);
        }
        
        await joinRoom(room.id, { displayName });
      }

      // Refresh the room list to include the newly created room
      fetchRooms().catch(err => console.error('Failed to refresh rooms after creation:', err));

      setError(null);
      return room;
    } catch (err) {
      console.error('Failed to create room:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [joinRoom, currentRoom, fetchRooms]);

  /**
   * Leave current room
   */
  const leaveRoom = useCallback(async () => {
    if (!currentRoom) return;

    try {
      const service = RealtimeServiceFactory.getService();
      await service.leaveFocusRoom(currentRoom.id);

      // Stop presence heartbeat and remove presence when leaving
      try {
        if (service && service.stopPresenceHeartbeat) {
          service.stopPresenceHeartbeat();
        }
        if (service && service.removePresence) {
          await service.removePresence();
        }
      } catch (e) {
        // ignore
      }

      // Unsubscribe from all room subscriptions (timer, room, messages)
      subscriptionsRef.current.forEach((unsub, roomId) => {
        try { unsub(); } catch (e) {}
      });
      subscriptionsRef.current.clear();
      subscribedRoomIdsRef.current.clear();

      // Also call currentRoom._unsubscribe if present (legacy)
      if (currentRoom._unsubscribe) {
        try { currentRoom._unsubscribe(); } catch (e) {}
      }

      // Remove the left room from rooms list to prevent re-subscription and ghost updates
      setRooms((cur) => cur.filter(r => r.id !== currentRoom.id));

      setCurrentRoom(null);
      setMessages([]);
      setRoomTimer(null);
      setError(null);
    } catch (err) {
      console.error('Failed to leave room:', err);
      setError(err.message);
    }
  }, [currentRoom]);

  const deleteRoom = useCallback(async (roomId) => {
    try {
      const service = RealtimeServiceFactory.getService();
      const result = await service.deleteFocusRoom(roomId, service.currentUserId);
      return result;
    } catch (err) {
      console.error('Failed to delete room:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Update room settings (partial update)
   */
  const updateRoomSettings = useCallback(async (roomId, updates) => {
    try {
      const service = RealtimeServiceFactory.getService();
      await service.updateRoomSettings(roomId, updates);
      // Optimistically update currentRoom in state if it matches
      if (currentRoom && currentRoom.id === roomId) {
        setCurrentRoom({ ...currentRoom, ...updates });
      }
      setError(null);
      return true;
    } catch (err) {
      console.error('Failed to update room settings:', err);
      setError(err.message);
      throw err;
    }
  }, [currentRoom]);

  /**
   * Send a message in current room
   */
  const sendMessage = useCallback(async (text) => {
    if (!currentRoom) return;

    try {
      const service = RealtimeServiceFactory.getService();
      await service.sendMessage(currentRoom.id, undefined, text);
      setError(null);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.message);
    }
  }, [currentRoom]);

  /**
   * Start timer in current room
   */
  const startTimer = useCallback(async (duration, timerType = 'timer', timerData = null) => {
    if (!currentRoom) return;

    try {
      const service = RealtimeServiceFactory.getService();
      await service.startRoomTimer(currentRoom.id, duration, timerType, timerData);
      setError(null);
    } catch (err) {
      console.error('Failed to start timer:', err);
      setError(err.message);
    }
  }, [currentRoom]);

  /**
   * Extend timer in current room by extensionMs (max 30 min = 1800000 ms)
   */
  const extendTimer = useCallback(async (extensionMs) => {
    if (!currentRoom) return;

    try {
      const service = RealtimeServiceFactory.getService();
      await service.extendRoomTimer(currentRoom.id, extensionMs);
      setError(null);
    } catch (err) {
      console.error('Failed to extend timer:', err);
      setError(err.message);
      throw err;
    }
  }, [currentRoom]);

  /**
   * Initial room list fetch
   */
  useEffect(() => {
    fetchRooms();
    // No periodic refresh — rooms update via subscriptions instead
  }, [fetchRooms]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (currentRoom && currentRoom._unsubscribe) {
        currentRoom._unsubscribe();
      }
    };
  }, [currentRoom]);

  /**
   * Subscribe to room updates as the rooms list changes
   */
  useEffect(() => {
    const subscribeToRoom = async (roomId) => {
      // Skip if already subscribed
      if (subscribedRoomIdsRef.current.has(roomId)) {
        return;
      }

      try {
        let service;
        try {
          service = RealtimeServiceFactory.getService();
        } catch (err) {
          try {
            await RealtimeServiceFactory.createService(ServiceType.FIREBASE, firebaseConfig, { allowFallback: true });
            service = RealtimeServiceFactory.getService();
          } catch (e) {
            return;
          }
        }

        const unsub = service.subscribeToFocusRoom(roomId, (updatedRoom) => {
          if (!updatedRoom) {
            // Room was deleted
            setRooms((cur) => cur.filter(r => r.id !== roomId));
            // Clean up subscription
            subscribedRoomIdsRef.current.delete(roomId);
            subscriptionsRef.current.delete(roomId);
          } else {
            // Room was updated — replace with new data
            setRooms((cur) => {
              const idx = cur.findIndex(r => r.id === roomId);
              if (idx === -1) {
                return [...cur, updatedRoom];
              }
              const updated = [...cur];
              updated[idx] = updatedRoom;
              return updated;
            });
          }
        });

        // Mark as subscribed and store unsub function
        subscribedRoomIdsRef.current.add(roomId);
        subscriptionsRef.current.set(roomId, unsub);
      } catch (err) {
        console.warn('Failed to subscribe to room', roomId, err);
      }
    };

    // Get current room IDs from state and subscribe to new ones
    const currentRoomIds = new Set(rooms.map(r => r.id));

    // Subscribe to rooms that are in state but not yet subscribed
    currentRoomIds.forEach((roomId) => {
      if (!subscribedRoomIdsRef.current.has(roomId)) {
        subscribeToRoom(roomId);
      }
    });

    // Unsubscribe from rooms no longer in the state
    subscribedRoomIdsRef.current.forEach((roomId) => {
      if (!currentRoomIds.has(roomId)) {
        const unsub = subscriptionsRef.current.get(roomId);
        if (unsub) {
          try { unsub(); } catch (e) {}
        }
        subscribedRoomIdsRef.current.delete(roomId);
        subscriptionsRef.current.delete(roomId);
      }
    });

    // Cleanup on unmount: copy refs into local variables to avoid stale ref warnings
    const subs = subscriptionsRef.current;
    return () => {
      subs.forEach((unsub) => {
        try { unsub(); } catch (e) {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  /**
   * Get participant count
   */
  const getParticipantCount = useCallback((room) => {
    return Object.keys(room?.participants || {}).length;
  }, []);

  /**
   * Check if room is full
   */
  const isRoomFull = useCallback((room) => {
    const count = getParticipantCount(room);
    return count >= (room?.maxParticipants || 10);
  }, [getParticipantCount]);

  /**
   * Get remaining time for timer
   */
  const getRemainingTime = useCallback(() => {
    if (!roomTimer || !roomTimer.endsAt) return 0;

    const remaining = Math.max(0, Math.floor((roomTimer.endsAt - Date.now()) / 1000));
    return remaining;
  }, [roomTimer]);

  return {
    // State
    rooms,
    currentRoom,
    messages,
    roomTimer,
    loading,
    error,

    // Actions
    fetchRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTimer,
    extendTimer,
    deleteRoom,

    // Helpers
    getParticipantCount,
    isRoomFull,
    getRemainingTime,
    updateRoomSettings
  };
};

export default useFocusRoom;
