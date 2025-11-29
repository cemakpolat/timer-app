import { useState, useCallback } from 'react';

/**
 * Custom hook to manage all modal states in the application
 * Consolidates 15+ boolean modal flags into a centralized state management system
 */
const useModals = () => {
  // Modal visibility states
  const [modals, setModals] = useState({
    // Settings and configuration
    settings: false,
    roomSettings: false,
    clearCache: false,
    
    // Timer creation and management
    createTimer: false,
    createRoom: false,
    builder: false,
    templateSelector: false,
    
    // Sharing and display
    share: false,
    info: false,
    feedback: false,
    
    // Deletion confirmations
    deleteTimer: false,
    deleteTheme: false,
    
    // Theme management
    colorPicker: false,
    
    // Room management
    roomExpiration: false,
    
    // Gamification and features
    capsuleInput: false,
    capsuleNotification: false,
  });

  // Generic modal opener
  const openModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  // Generic modal closer
  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);

  // Toggle modal state
  const toggleModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }));
  }, []);

  // Close all modals
  const closeAllModals = useCallback(() => {
    setModals({
      settings: false,
      roomSettings: false,
      clearCache: false,
      createTimer: false,
      createRoom: false,
      builder: false,
      templateSelector: false,
      share: false,
      info: false,
      feedback: false,
      deleteTimer: false,
      deleteTheme: false,
      colorPicker: false,
      roomExpiration: false,
      capsuleInput: false,
      capsuleNotification: false,
    });
  }, []);

  // Specific modal handlers for backwards compatibility and convenience
  const modalHandlers = {
    // Settings
    showSettings: modals.settings,
    setShowSettings: (value) => typeof value === 'function' 
      ? setModals(prev => ({ ...prev, settings: value(prev.settings) }))
      : setModals(prev => ({ ...prev, settings: value })),
    
    // Room settings
    showRoomSettings: modals.roomSettings,
    setShowRoomSettings: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, roomSettings: value(prev.roomSettings) }))
      : setModals(prev => ({ ...prev, roomSettings: value })),
    
    // Clear cache
    showClearCacheModal: modals.clearCache,
    setShowClearCacheModal: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, clearCache: value(prev.clearCache) }))
      : setModals(prev => ({ ...prev, clearCache: value })),
    
    // Create timer
    showCreateTimer: modals.createTimer,
    setShowCreateTimer: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, createTimer: value(prev.createTimer) }))
      : setModals(prev => ({ ...prev, createTimer: value })),
    
    // Create room
    showCreateRoomModal: modals.createRoom,
    setShowCreateRoomModal: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, createRoom: value(prev.createRoom) }))
      : setModals(prev => ({ ...prev, createRoom: value })),
    
    // Builder
    showBuilder: modals.builder,
    setShowBuilder: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, builder: value(prev.builder) }))
      : setModals(prev => ({ ...prev, builder: value })),
    
    // Template selector
    showTemplateSelector: modals.templateSelector,
    setShowTemplateSelector: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, templateSelector: value(prev.templateSelector) }))
      : setModals(prev => ({ ...prev, templateSelector: value })),
    
    // Share
    showShareModal: modals.share,
    setShowShareModal: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, share: value(prev.share) }))
      : setModals(prev => ({ ...prev, share: value })),
    
    // Info
    showInfoModal: modals.info,
    setShowInfoModal: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, info: value(prev.info) }))
      : setModals(prev => ({ ...prev, info: value })),
    
    // Feedback
    showFeedbackModal: modals.feedback,
    setShowFeedbackModal: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, feedback: value(prev.feedback) }))
      : setModals(prev => ({ ...prev, feedback: value })),
    
    // Delete timer
    showDeleteModal: modals.deleteTimer,
    setShowDeleteModal: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, deleteTimer: value(prev.deleteTimer) }))
      : setModals(prev => ({ ...prev, deleteTimer: value })),
    
    // Delete theme
    showDeleteThemeModal: modals.deleteTheme,
    setShowDeleteThemeModal: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, deleteTheme: value(prev.deleteTheme) }))
      : setModals(prev => ({ ...prev, deleteTheme: value })),
    
    // Color picker
    showColorPicker: modals.colorPicker,
    setShowColorPicker: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, colorPicker: value(prev.colorPicker) }))
      : setModals(prev => ({ ...prev, colorPicker: value })),
    
    // Room expiration
    showRoomExpirationModal: modals.roomExpiration,
    setShowRoomExpirationModal: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, roomExpiration: value(prev.roomExpiration) }))
      : setModals(prev => ({ ...prev, roomExpiration: value })),
    
    // Capsule input
    showCapsuleInput: modals.capsuleInput,
    setShowCapsuleInput: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, capsuleInput: value(prev.capsuleInput) }))
      : setModals(prev => ({ ...prev, capsuleInput: value })),
    
    // Capsule notification
    showCapsuleNotification: modals.capsuleNotification,
    setShowCapsuleNotification: (value) => typeof value === 'function'
      ? setModals(prev => ({ ...prev, capsuleNotification: value(prev.capsuleNotification) }))
      : setModals(prev => ({ ...prev, capsuleNotification: value })),
  };

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    ...modalHandlers,
  };
};

export default useModals;
