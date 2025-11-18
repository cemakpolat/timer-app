import { useState, useEffect, useCallback } from 'react';
import RealtimeServiceFactory from '../services/RealtimeServiceFactory';

/**
 * Hook for managing user presence and active users count
 *
 * Usage:
 *   const { activeUsers, updatePresence, isOnline } = usePresence();
 *
 * Features:
 * - Efficient polling (not continuous connection)
 * - Automatic heartbeat
 * - Cleanup on unmount
 */
const usePresence = ({ enableHeartbeat = true, heartbeatInterval = 60000, pollInterval = 30000 } = {}) => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch active users count (single read)
   */
  const fetchActiveUsers = useCallback(async () => {
    try {
      const service = RealtimeServiceFactory.getService();
      const count = await service.getActiveUsersCount();
      setActiveUsers(count);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch active users:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Update user presence manually
   */
  const updatePresence = useCallback(async (metadata = {}) => {
    try {
      const service = RealtimeServiceFactory.getService();
      await service.updatePresence(undefined, metadata);
      setIsOnline(true);
      setError(null);
    } catch (err) {
      console.error('Failed to update presence:', err);
      setError(err.message);
      setIsOnline(false);
    }
  }, []);

  /**
   * Remove user presence
   */
  const removePresence = useCallback(async () => {
    try {
      const service = RealtimeServiceFactory.getService();
      await service.removePresence();
      setIsOnline(false);
    } catch (err) {
      console.error('Failed to remove presence:', err);
    }
  }, []);

  useEffect(() => {
    let heartbeatIntervalId;
    let pollIntervalId;

    const initialize = async () => {
      try {
        // Check if service is initialized
        let service;
        try {
          service = RealtimeServiceFactory.getService();
        } catch (err) {
          // Service not initialized yet, skip
          return;
        }

        // Start heartbeat if enabled
        if (enableHeartbeat) {
          service.startPresenceHeartbeat(heartbeatInterval);
          setIsOnline(true);
        }

        // Initial fetch
        await fetchActiveUsers();

        // Setup polling for active users count
        pollIntervalId = setInterval(fetchActiveUsers, pollInterval);

      } catch (err) {
        console.error('Failed to initialize presence:', err);
        setError(err.message);
      }
    };

    initialize();

    // If the factory initializes later, run initialize again
    const onInit = () => {
      initialize().catch(console.error);
    };
    RealtimeServiceFactory.onInit(onInit);

    // Cleanup on unmount
    return () => {
      if (heartbeatIntervalId) clearInterval(heartbeatIntervalId);
      if (pollIntervalId) clearInterval(pollIntervalId);

      // Remove presence when component unmounts
      try {
        const service = RealtimeServiceFactory.getService();
        service.stopPresenceHeartbeat();
        service.removePresence().catch(console.error);
      } catch (err) {
        // Service already cleaned up
      }

      RealtimeServiceFactory.offInit(onInit);
    };
  }, [enableHeartbeat, heartbeatInterval, pollInterval, fetchActiveUsers]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        removePresence();
      } else if (enableHeartbeat) {
        updatePresence();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableHeartbeat, updatePresence, removePresence]);

  return {
    activeUsers,
    isOnline,
    error,
    updatePresence,
    removePresence,
    refresh: fetchActiveUsers
  };
};

export default usePresence;
