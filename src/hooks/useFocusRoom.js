import { useState, useEffect, useCallback } from 'react';
import RealtimeServiceFactory from '../services/RealtimeServiceFactory';

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

  /**
   * Fetch available focus rooms
   */
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      let service;
      try {
        service = RealtimeServiceFactory.getService();
      } catch (err) {
        // Service not initialized yet
        setLoading(false);
        return;
      }
      const fetchedRooms = await service.getFocusRooms();
      setRooms(fetchedRooms);
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
    try {
      setLoading(true);
      let service;
      try {
        service = RealtimeServiceFactory.getService();
      } catch (err) {
        setError('Service not ready');
        setLoading(false);
        return;
      }
      const room = await service.joinFocusRoom(roomId, undefined, userInfo);

      setCurrentRoom(room);
      setError(null);

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
  }, []);

  /**
   * Create a new focus room
   */
  const createRoom = useCallback(async (roomData) => {
    try {
      setLoading(true);
      let service;
      try {
        service = RealtimeServiceFactory.getService();
      } catch (err) {
        // Service not initialized yet
        setError('Service not ready. Please wait a moment and try again.');
        setLoading(false);
        return;
      }

      const room = await service.createFocusRoom(roomData);

      // Auto-join the created room
      await joinRoom(room.id, { displayName: roomData.creatorName || 'You' });

      setError(null);
      return room;
    } catch (err) {
      console.error('Failed to create room:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [joinRoom]);

  /**
   * Leave current room
   */
  const leaveRoom = useCallback(async () => {
    if (!currentRoom) return;

    try {
      const service = RealtimeServiceFactory.getService();
      await service.leaveFocusRoom(currentRoom.id);

      // Unsubscribe from updates
      if (currentRoom._unsubscribe) {
        currentRoom._unsubscribe();
      }

      setCurrentRoom(null);
      setMessages([]);
      setRoomTimer(null);
      setError(null);
    } catch (err) {
      console.error('Failed to leave room:', err);
      setError(err.message);
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
  const startTimer = useCallback(async (duration) => {
    if (!currentRoom) return;

    try {
      const service = RealtimeServiceFactory.getService();
      await service.startRoomTimer(currentRoom.id, duration);
      setError(null);
    } catch (err) {
      console.error('Failed to start timer:', err);
      setError(err.message);
    }
  }, [currentRoom]);

  /**
   * Initial room list fetch
   */
  useEffect(() => {
    fetchRooms();

    // Refresh rooms every 30 seconds
    const interval = setInterval(fetchRooms, 30000);

    return () => clearInterval(interval);
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

    // Helpers
    getParticipantCount,
    isRoomFull,
    getRemainingTime
  };
};

export default useFocusRoom;
