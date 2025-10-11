import { useState, useEffect, useCallback } from 'react';
import { supportsFeature } from '../utils/helpers';

/**
 * Custom hook for managing browser notifications
 * @returns {Object} Notification state and controls
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState(() => {
    return supportsFeature('notifications') ? Notification.permission : 'unsupported';
  });

  // Update permission state when it changes
  useEffect(() => {
    if (!supportsFeature('notifications')) return;

    // Check permission periodically (some browsers don't fire events)
    const checkPermission = () => {
      if (Notification.permission !== permission) {
        setPermission(Notification.permission);
      }
    };

    const interval = setInterval(checkPermission, 1000);
    return () => clearInterval(interval);
  }, [permission]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!supportsFeature('notifications')) {
      return 'unsupported';
    }

    if (Notification.permission === 'default') {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
      }
    }

    return Notification.permission;
  }, []);

  // Send notification
  const sendNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }, [permission]);

  // Send completion notification
  const sendCompletionNotification = useCallback((sessionData) => {
    if (permission !== 'granted') return;

    const { name, type, totalSeconds } = sessionData;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeStr = minutes > 0
      ? `${minutes} minute${minutes !== 1 ? 's' : ''}${seconds > 0 ? ` ${seconds} seconds` : ''}`
      : `${seconds} second${seconds !== 1 ? 's' : ''}`;

    sendNotification('Timer Completed! 🎉', {
      body: `You finished your ${name || type} session. Total time: ${timeStr}.`,
      tag: 'timer-completion',
      requireInteraction: false
    });
  }, [permission, sendNotification]);

  return {
    permission,
    isSupported: supportsFeature('notifications'),
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    requestPermission,
    sendNotification,
    sendCompletionNotification
  };
};