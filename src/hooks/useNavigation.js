import { useState, useCallback } from 'react';

/**
 * Custom hook to manage navigation state
 * Handles tab navigation and view switching in the application
 */
const useNavigation = (initialMainTab = 'rooms', initialFeatureTab = null) => {
  // Primary navigation (rooms, timer, stats)
  const [activeMainTab, setActiveMainTab] = useState(initialMainTab);
  
  // Secondary feature navigation (timer, interval, stopwatch, composite, achievements, scenes)
  const [activeFeatureTab, setActiveFeatureTab] = useState(initialFeatureTab);
  
  // Navigate to a main tab
  const navigateToMainTab = useCallback((tabName) => {
    setActiveMainTab(tabName);
  }, []);
  
  // Navigate to a feature tab
  const navigateToFeatureTab = useCallback((tabName) => {
    setActiveFeatureTab(tabName);
  }, []);
  
  // Reset to initial navigation state
  const resetNavigation = useCallback(() => {
    setActiveMainTab(initialMainTab);
    setActiveFeatureTab(initialFeatureTab);
  }, [initialMainTab, initialFeatureTab]);
  
  // Check if a specific main tab is active
  const isMainTabActive = useCallback((tabName) => {
    return activeMainTab === tabName;
  }, [activeMainTab]);
  
  // Check if a specific feature tab is active
  const isFeatureTabActive = useCallback((tabName) => {
    return activeFeatureTab === tabName;
  }, [activeFeatureTab]);

  return {
    // State
    activeMainTab,
    activeFeatureTab,
    
    // Setters (for backwards compatibility)
    setActiveMainTab,
    setActiveFeatureTab,
    
    // Actions
    navigateToMainTab,
    navigateToFeatureTab,
    resetNavigation,
    
    // Utilities
    isMainTabActive,
    isFeatureTabActive,
  };
};

export default useNavigation;
