import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { Play, Pause, RotateCcw, Clock, Zap, Palette, Plus, X, Save, ChevronRight, ChevronLeft, Trash2, Share, Repeat, Volume2, VolumeX, ChevronUp, ChevronDown, Award, Users, Lightbulb, Settings, Download, Trash, Upload, Info, Edit } from 'lucide-react';
import './styles/global.css';
import { ModalProvider } from './context/ModalContext';
import { ToastProvider } from './context/ToastContext';
import RealtimeServiceFactory from './services/RealtimeServiceFactory';
import usePresence from './hooks/usePresence';
import useFocusRoom from './hooks/useFocusRoom';
import CreateRoomModal from './components/FocusRooms/CreateRoomModal';
import FeedbackModal from './components/FeedbackModal';
import InfoModal from './components/InfoModal';
import LazyLoadingFallback from './components/LazyLoadingFallback';
import TimerPanel from './components/panels/TimerPanel';
import IntervalPanel from './components/panels/IntervalPanel';
import CompositePanel from './components/panels/CompositePanel';
import { downloadICSFile, generateGoogleCalendarURL } from './services/calendar/calendarService';
import { formatDate } from './utils/formatters';
import { AMBIENT_SOUNDS } from './utils/constants';
import { useSound } from './hooks/useSound';
import shareService from './services/shareService';

// Lazy-loaded components
const FocusRoomsPanel = lazy(() => import('./components/panels/FocusRoomsPanel'));
const AchievementsPanel = lazy(() => import('./components/panels/AchievementsPanel'));
const RoomTemplateSelector = lazy(() => import('./components/panels/RoomTemplateSelector'));

// Utility function to calculate relative luminance of a color
const getLuminance = (hexColor) => {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Apply gamma correction
  const [rs, gs, bs] = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  // Calculate relative luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Determine if a color is light (returns true for light colors)
const isLightColor = (hexColor) => {
  return getLuminance(hexColor) > 0.5;
};

// Get contrasting text color for a given background
const getContrastColor = (bgColor) => {
  return isLightColor(bgColor) ? '#000000' : '#ffffff';
};

// Get semi-transparent text color based on theme
const getTextOpacity = (theme, opacity = 0.7) => {
  const baseColor = theme.text;
  // Convert hex to rgba
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const DEFAULT_THEMES = [
  { name: "Midnight", bg: "#000000", card: "#1a1a1a", accent: "#3b82f6", text: "#ffffff", isDefault: true },
  { name: "Ocean", bg: "#0a1929", card: "#1e3a5f", accent: "#06b6d4", text: "#ffffff", isDefault: true },
  { name: "Forest", bg: "#064e3b", card: "#065f46", accent: "#10b981", text: "#ffffff", isDefault: true },
  { name: "Purple", bg: "#1e1b4b", card: "#312e81", accent: "#8b5cf6", text: "#ffffff", isDefault: true },
  { name: "Warm Grey", bg: "#262626", card: "#3f3f46", accent: "#fde047", text: "#ffffff", isDefault: true },
  { name: "Clean", bg: "#ffffff", card: "#f3f4f6", accent: "#1f2937", text: "#000000", isDefault: true },
  { name: "Pure Black", bg: "#000000", card: "#111111", accent: "#ffffff", text: "#ffffff", isDefault: true },
  // Fitness-inspired themes
  { name: "Energy Boost", bg: "#1e40af", card: "#3b82f6", accent: "#fbbf24", text: "#ffffff", isDefault: true },
  { name: "Sunrise Run", bg: "#ea580c", card: "#fb923c", accent: "#fef3c7", text: "#ffffff", isDefault: true },
  { name: "Zen Garden", bg: "#166534", card: "#22c55e", accent: "#86efac", text: "#ffffff", isDefault: true },
  { name: "Power Lift", bg: "#7c2d12", card: "#dc2626", accent: "#fca5a5", text: "#ffffff", isDefault: true }
];

// Immersive scenes for different timer types
const SCENES = {
  none: { name: "None", bg: null, card: null, emoji: "🚫" },
  coffee: {
    name: "Coffee Break",
    bg: "linear-gradient(135deg, #6F4E37 0%, #4A342B 50%, #2D1F1A 100%)",
    card: "rgba(111, 78, 55, 0.3)",
    accent: "#D2691E",
    emoji: "☕",
    description: "Warm brown tones for your coffee break"
  },
  deepWork: {
    name: "Deep Work",
    bg: "linear-gradient(135deg, #1a0033 0%, #0a001a 50%, #000000 100%)",
    card: "rgba(74, 0, 128, 0.3)",
    accent: "#9333ea",
    emoji: "🧠",
    description: "Deep purple focus environment"
  },
  exercise: {
    name: "Exercise",
    bg: "linear-gradient(135deg, #DC143C 0%, #8B0000 50%, #4B0000 100%)",
    card: "rgba(220, 20, 60, 0.3)",
    accent: "#FF6B6B",
    emoji: "💪",
    description: "Energizing red for physical activity"
  },
  reading: {
    name: "Reading",
    bg: "linear-gradient(135deg, #2C5F2D 0%, #1B4332 50%, #081C15 100%)",
    card: "rgba(44, 95, 45, 0.3)",
    accent: "#52B788",
    emoji: "📚",
    description: "Calm green for focused reading"
  },
  meditation: {
    name: "Meditation",
    bg: "linear-gradient(135deg, #4A5568 0%, #2D3748 50%, #1A202C 100%)",
    card: "rgba(74, 85, 104, 0.3)",
    accent: "#90CDF4",
    emoji: "🧘",
    description: "Peaceful grey for mindfulness"
  },
  creative: {
    name: "Creative Work",
    bg: "linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FDC830 100%)",
    card: "rgba(255, 107, 53, 0.3)",
    accent: "#F7931E",
    emoji: "🎨",
    description: "Vibrant orange for creativity"
  },
  study: {
    name: "Study Session",
    bg: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #3B82F6 100%)",
    card: "rgba(30, 58, 138, 0.3)",
    accent: "#60A5FA",
    emoji: "📖",
    description: "Blue tones for concentration"
  },
  meeting: {
    name: "Meeting",
    bg: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)",
    card: "rgba(124, 58, 237, 0.3)",
    accent: "#A78BFA",
    emoji: "👥",
    description: "Professional purple for meetings"
  }
};

// Initial default timers for local storage
const defaultSavedTimers = [
  { name: "Pomodoro", duration: 25, unit: "min", min: 25, color: "#ef4444", group: "Work", scene: "deepWork" },
  { name: "Short Break", duration: 5, unit: "min", min: 5, color: "#10b981", group: "Work", scene: "coffee" },
  { name: "Deep Work", duration: 50, unit: "min", min: 50, color: "#8b5cf6", group: "Work", scene: "deepWork" },
  { name: "Workout", duration: 30, unit: "min", min: 30, color: "#f59e0b", group: "Fitness", scene: "exercise" }
];

// Centralized styles for inputs for consistency and easier modification
const inputStyle = (accentColor, textColor = '#ffffff', borderColor = 'rgba(255,255,255,0.1)') => ({
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    padding: 12,
    color: textColor,
    fontSize: 14,
    boxSizing: 'border-box', // Ensure padding doesn't add to total width
});

// accentInputStyle removed (unused) to satisfy lint rules


export default function TimerApp() {
  // Track if service is ready
  const [serviceReady, setServiceReady] = useState(false);

  // Do not initialize realtime service on page load.
  // Firebase connection will be created on-demand when the user creates or joins a focus room.
  useEffect(() => {
    // Subscribe to factory init events so we know when the realtime service becomes available
    if (RealtimeServiceFactory.getServiceSafe()) {
      setServiceReady(true);
    }

    const onInit = () => setServiceReady(true);
    RealtimeServiceFactory.onInit(onInit);
    // Show a toast when the realtime factory reports an error during init
    const onError = (err) => {
      const msg = err && err.message ? `Realtime init failed: ${err.message}` : 'Realtime init failed';
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: msg, type: 'error', ttl: 5000 } }));
    };
    RealtimeServiceFactory.onError(onError);

    return () => {
      RealtimeServiceFactory.offInit(onInit);
      RealtimeServiceFactory.offError(onError);
      RealtimeServiceFactory.resetService();
      setServiceReady(false);
    };
  }, []);

  // Use real presence hook (only when service is ready)
  const { activeUsers: realActiveUsers } = usePresence({
    enableHeartbeat: serviceReady,
    heartbeatInterval: 60000,
    pollInterval: 30000
  });

  // Use focus room hook
  const {
    rooms,
    currentRoom,
    messages,
    loading: roomsLoading,
    fetchRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    updateRoomSettings,
    sendMessage,
    startTimer: startRoomTimer,
    extendTimer: extendRoomTimer,
    getParticipantCount,
    isRoomFull
  } = useFocusRoom();

  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const handleSaveRoomSettings = async (updates) => {
    if (!currentRoom) return;
    try {
      await updateRoomSettings(currentRoom.id, updates);
      // Refresh room list so list view reflects settings change
      await fetchRooms();
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Room settings saved', type: 'success', ttl: 3000 } }));
    } catch (err) {
      showRealtimeErrorToast(err, 'Save settings');
      throw err;
    } finally {
      setShowRoomSettings(false);
    }
  };
  


  // Force re-render for room timer countdown
  const [, forceUpdate] = useState(0);
  const [showRoomExpirationModal, setShowRoomExpirationModal] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    if (currentRoom?.timer) {
      const interval = setInterval(() => {
        // Check if timer has expired
        const timeRemainingSec = Math.max(0, Math.floor((currentRoom.timer.endsAt - Date.now()) / 1000));
        if (timeRemainingSec === 0 && !timerExpired) {
          setTimerExpired(true);
          setShowRoomExpirationModal(true);
        }
        forceUpdate(n => n + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimerExpired(false);
      setShowRoomExpirationModal(false);
    }
  }, [currentRoom?.timer, timerExpired]);

  // Handle timer extension
  const handleExtendTimer = async (extensionMs) => {
    try {
      await extendRoomTimer(extensionMs);
      setTimerExpired(false); // Reset expiration state
      setShowRoomExpirationModal(false);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Timer extended successfully', type: 'success', ttl: 3000 } }));
    } catch (err) {
      console.error('Failed to extend timer:', err);
      showRealtimeErrorToast(err, 'Extend timer');
    }
  };

  // Handle room close (from expiration modal)
  const handleCloseRoom = async () => {
    try {
      setShowRoomExpirationModal(false);
      await leaveRoom();
      setTimerExpired(false);
    } catch (err) {
      console.error('Failed to close room:', err);
      showRealtimeErrorToast(err, 'Close room');
    }
  };

  // Load deleted default themes from localStorage
  const [deletedDefaultThemes, setDeletedDefaultThemes] = useState(() => {
    try {
      const stored = localStorage.getItem('deletedDefaultThemes');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load deleted default themes:", error);
      return [];
    }
  });

  // Load themes from localStorage (default + custom)
  const [themes, setThemes] = useState(() => {
    try {
      const storedCustomThemes = localStorage.getItem('customThemes');
      const customThemes = storedCustomThemes ? JSON.parse(storedCustomThemes) : [];
      const availableDefaultThemes = DEFAULT_THEMES.filter(t => !deletedDefaultThemes.includes(t.name));
      return [...availableDefaultThemes, ...customThemes];
    } catch (error) {
      console.error("Failed to load custom themes:", error);
      return DEFAULT_THEMES;
    }
  });

  // Load initial theme from localStorage
  const [theme, setTheme] = useState(() => {
    try {
      const storedThemeName = localStorage.getItem('selectedThemeName');
      return storedThemeName ? themes.find(t => t.name === storedThemeName) || themes[0] : themes[0];
    } catch (error) {
      console.error("Failed to load theme from localStorage:", error);
      return themes[0];
    }
  });
  const [, setShowThemes] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [previewTheme, setPreviewTheme] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Save custom theme function
  const saveCustomTheme = () => {
    if (!newThemeName.trim()) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Please enter a theme name', type: 'error', ttl: 3000 } }));
      return;
    }

    const themeData = {
      name: newThemeName.trim(),
      bg: newThemeBg,
      card: newThemeCard,
      accent: newThemeAccent,
      text: newThemeText,
      isDefault: false
    };

    try {
      const storedCustomThemes = localStorage.getItem('customThemes');
      const customThemes = storedCustomThemes ? JSON.parse(storedCustomThemes) : [];

      if (editingTheme) {
        // Editing existing theme
        const index = customThemes.findIndex(t => t.name === editingTheme.name);
        if (index !== -1) {
          // If name changed, check for duplicates
          if (editingTheme.name !== themeData.name && customThemes.some(t => t.name.toLowerCase() === themeData.name.toLowerCase())) {
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Theme name already exists', type: 'error', ttl: 3000 } }));
            return;
          }
          customThemes[index] = themeData;
          localStorage.setItem('customThemes', JSON.stringify(customThemes));

          // Update themes state
          setThemes(prev => prev.map(t => t.name === editingTheme.name ? themeData : t));

          // If currently selected theme was edited, update it
          if (theme.name === editingTheme.name) {
            setTheme(themeData);
            localStorage.setItem('selectedThemeName', themeData.name);
          }

          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Theme updated!', type: 'success', ttl: 3000 } }));
        }
      } else {
        // Creating new theme
        // Check if theme name already exists
        if (customThemes.some(t => t.name.toLowerCase() === themeData.name.toLowerCase())) {
          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Theme name already exists', type: 'error', ttl: 3000 } }));
          return;
        }

        customThemes.push(themeData);
        localStorage.setItem('customThemes', JSON.stringify(customThemes));

        // Update themes state
        setThemes(prev => [...prev, themeData]);

        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Custom theme saved!', type: 'success', ttl: 3000 } }));
      }

      // Reset form
      setNewThemeName('');
      setNewThemeBg('#000000');
      setNewThemeCard('#1a1a1a');
      setNewThemeAccent('#3b82f6');
      setNewThemeText('#ffffff');
      setShowColorPicker(false);
      setEditingTheme(null);
    } catch (error) {
      console.error('Error saving custom theme:', error);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Failed to save theme', type: 'error', ttl: 3000 } }));
    }
  };

  // Delete theme function
  const deleteTheme = (themeToDelete) => {
    try {
      if (themeToDelete.isDefault) {
        // For default themes, add to deleted list
        const updatedDeleted = [...deletedDefaultThemes, themeToDelete.name];
        setDeletedDefaultThemes(updatedDeleted);
        localStorage.setItem('deletedDefaultThemes', JSON.stringify(updatedDeleted));

        // Update themes state to remove the deleted default theme
        setThemes(prev => prev.filter(t => t.name !== themeToDelete.name));
      } else {
        // For custom themes, remove from localStorage
        const storedCustomThemes = localStorage.getItem('customThemes');
        const customThemes = storedCustomThemes ? JSON.parse(storedCustomThemes) : [];

        const updatedThemes = customThemes.filter(t => t.name !== themeToDelete.name);
        localStorage.setItem('customThemes', JSON.stringify(updatedThemes));

        // Update themes state
        setThemes(prev => prev.filter(t => t.name !== themeToDelete.name));
      }

      // If the deleted theme was the current theme, switch to Midnight
      if (theme.name === themeToDelete.name) {
        const midnight = themes.find(t => t.name === 'Midnight') || DEFAULT_THEMES[0];
        setTheme(midnight);
        localStorage.setItem('selectedThemeName', midnight.name);
      }

      setShowDeleteThemeModal(false);
      setThemeToDelete(null);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Theme deleted!', type: 'success', ttl: 3000 } }));
    } catch (error) {
      console.error('Error deleting theme:', error);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Failed to delete theme', type: 'error', ttl: 3000 } }));
    }
  };

  const [showInfoModal, setShowInfoModal] = useState(false);

  // Settings states
  const [showSettings, setShowSettings] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [settingsView, setSettingsView] = useState('main'); // 'main', 'themes', 'sound', 'animations'

  // Color picker states
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeBg, setNewThemeBg] = useState('#000000');
  const [newThemeCard, setNewThemeCard] = useState('#1a1a1a');
  const [newThemeAccent, setNewThemeAccent] = useState('#3b82f6');
  const [newThemeText, setNewThemeText] = useState('#ffffff');
  const [showDeleteThemeModal, setShowDeleteThemeModal] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState(null);

  // Accordion state for timer groups
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Navigation states - RESTRUCTURED: Focus Rooms is now primary
  const [activeMainTab, setActiveMainTab] = useState('rooms'); // rooms, timer, stats (elevated focus rooms to primary)
  const [activeFeatureTab, setActiveFeatureTab] = useState(null); // timer, interval, stopwatch, composite, achievements, scenes
  const [showTemplateSelector, setShowTemplateSelector] = useState(false); // Show room template selector
  const [selectedTemplate, setSelectedTemplate] = useState(null); // Selected template for room creation

  const [mode, setMode] = useState('timer');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  // HH:MM:SS input states
  const [inputHours, setInputHours] = useState('');
  const [inputMinutes, setInputMinutes] = useState('');
  const [inputSeconds, setInputSeconds] = useState('');

  const [initialTime, setInitialTime] = useState(0);
  const [work, setWork] = useState(40);
  const [rest, setRest] = useState(20);
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(1);
  const [isWork, setIsWork] = useState(true);
  const [sequence, setSequence] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showBuilder, setShowBuilder] = useState(false);
  const [seqName, setSeqName] = useState('');

  // Load saved timers from localStorage
  const [saved, setSaved] = useState(() => {
    try {
      const storedSaved = localStorage.getItem('savedTimers');
      return storedSaved ? JSON.parse(storedSaved) : defaultSavedTimers;
    } catch (error) {
      console.error("Failed to load saved timers from localStorage:", error);
      return defaultSavedTimers;
    }
  });

  // Load history from localStorage
  const [history, setHistory] = useState(() => {
      try {
          const storedHistory = localStorage.getItem('timerHistory');
          return storedHistory ? JSON.parse(storedHistory) : [];
      } catch (error) {
          console.error("Failed to load history from localStorage:", error);
          return [];
      }
  });

  const [showCreateTimer, setShowCreateTimer] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerMin, setNewTimerMin] = useState('');
  const [newTimerUnit, setNewTimerUnit] = useState('min');
  const [newTimerColor, setNewTimerColor] = useState('#3b82f6');
  const [newTimerGroup, setNewTimerGroup] = useState('');
  const [newTimerScene, setNewTimerScene] = useState('none');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [timerToDelete, setTimerToDelete] = useState(null);
  const [calendarExportRoom, setCalendarExportRoom] = useState(null); // Task 5: Calendar export modal state
  

  // Helper to show friendly toasts for realtime permission/init errors
  const showRealtimeErrorToast = (err, action = 'Operation') => {
    const raw = err && err.message ? err.message : String(err || 'Unknown error');
    let msg = raw;
    // Specific user-friendly messages
    if (/already in (another )?room|you are already in a room/i.test(raw)) {
      msg = `You are already in a room. Leave your current room before joining another.`;
    } else if (/room name already in use|duplicate|already exists/i.test(raw)) {
      msg = `Room name already in use. Please choose a different name.`;
    } else if (/permission_denied|permission denied/i.test(raw)) {
      msg = `${action} failed: permission denied. Please enable Anonymous Auth and update your Realtime DB rules (see FIREBASE-SETUP.md).`;
    } else if (/auth|not-authorized/i.test(raw)) {
      msg = `${action} failed: authentication error. Check Firebase Auth settings and authorized domains.`;
    } else {
      msg = `${action} failed: ${raw}`;
    }

    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: msg, type: 'error', ttl: 6000 } }));
  };

  // NOTE: handleComplete is defined later; we'll update the ref after it's created

  // Wrapped join/create handlers so we can show toasts on failure
  const handleJoinRoom = useCallback(async (roomId) => {
    try {
      // Get or generate display name
      let displayName = localStorage.getItem('userDisplayName');
      if (!displayName) {
        const service = RealtimeServiceFactory.getServiceSafe();
        const userId = service?.currentUserId || 'anonymous';
        displayName = `User ${userId.substring(0, 5)}`;
        localStorage.setItem('userDisplayName', displayName);
      }
      
      await joinRoom(roomId, { displayName });
    } catch (err) {
      console.error('Join room error (UI):', err);
      showRealtimeErrorToast(err, 'Joining room');
    }
  }, [joinRoom]);

  const handleCreateRoom = async (roomData) => {
    // Validate unique room name (case-insensitive)
    if (rooms.some(r => r.name && roomData.name && r.name.trim().toLowerCase() === roomData.name.trim().toLowerCase())) {
      const msg = 'Room name already in use. Please choose a different name.';
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: msg, type: 'error', ttl: 4000 } }));
      // Throw to let callers know it failed
      throw new Error(msg);
    }
    try {
      await createRoom(roomData);
      // Feedback on success
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Room created', type: 'success', ttl: 3000 } }));
    } catch (err) {
      console.error('Create room error (UI):', err);
      showRealtimeErrorToast(err, 'Creating room');
      throw err; // rethrow if callers expect it
    }
  };

  // Task 5: Calendar export handlers
  const handleExportToICS = (room) => {
    console.log('handleExportToICS called with room:', room?.name);
    try {
      downloadICSFile(room);
      console.log('downloadICSFile completed successfully');
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Calendar file downloaded', type: 'success', ttl: 3000 } }));
      setCalendarExportRoom(null);
    } catch (err) {
      console.error('Error exporting to ICS:', err);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Failed to export calendar file: ' + err.message, type: 'error', ttl: 5000 } }));
    }
  };

  const handleExportToGoogleCalendar = (room) => {
    try {
      const url = generateGoogleCalendarURL(room);
      window.open(url, '_blank');
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Opening Google Calendar', type: 'info', ttl: 3000 } }));
      setCalendarExportRoom(null);
    } catch (err) {
      console.error('Error exporting to Google Calendar:', err);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Failed to open Google Calendar', type: 'error', ttl: 3000 } }));
    }
  };

  const handleShareRoomLink = (room) => {
    try {
      const link = shareService.generateRoomShareLink(room.id);
      navigator.clipboard.writeText(link);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Room link copied to clipboard', type: 'success', ttl: 3000 } }));
      setCalendarExportRoom(null);
    } catch (err) {
      console.error('Error sharing room link:', err);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Failed to copy link', type: 'error', ttl: 3000 } }));
    }
  };

  // Room template handlers
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Selected template: ${template.name}`, type: 'info', ttl: 2000 } }));
  };

  const handleCreateRoomFromTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      // Create room data from template
      const roomData = {
        name: selectedTemplate.name,
        duration: selectedTemplate.duration,
        maxParticipants: selectedTemplate.maxParticipants,
        goal: selectedTemplate.goal,
        breakDuration: selectedTemplate.breakDuration,
        cycles: selectedTemplate.cycles,
        tag: selectedTemplate.tag,
        template: selectedTemplate.id,
        creatorName: 'You'
      };

      await handleCreateRoom(roomData);
      setShowTemplateSelector(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Template room creation error:', err);
      // Error handling is done in handleCreateRoom
    }
  };

  // Load repeat preference from localStorage
  const [repeatEnabled, setRepeatEnabled] = useState(() => {
      try {
          return localStorage.getItem('repeatEnabled') === 'true';
      } catch (error) {
          console.error("Failed to load repeatEnabled from localStorage:", error);
          return false;
      }
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);

  // Sync mode with activeMainTab when not running (but NOT during transitions)
  useEffect(() => {
    if (!isRunning && time === 0 && !isTransitioning) {
      if (activeMainTab === 'composite') {
        setMode('sequence');
      } else if (activeMainTab !== 'stopwatch') {
        setMode(activeMainTab);
      }
    }
  }, [activeMainTab, isRunning, time, isTransitioning]);

  const [alarmSoundType, setAlarmSoundType] = useState(() => {
    try { return localStorage.getItem('alarmSoundType') || 'bell'; }
    catch (error) { return 'bell'; }
  });
  const [alarmVolume, setAlarmVolume] = useState(() => {
    try { return parseFloat(localStorage.getItem('alarmVolume')) || 0.5; }
    catch (error) { return 0.5; }
  });
  const [ambientSoundType, setAmbientSoundType] = useState(() => {
    try { return localStorage.getItem('ambientSoundType') || 'None'; }
    catch (error) { return 'None'; }
  });
  const [ambientVolume, setAmbientVolume] = useState(() => {
    try { return parseFloat(localStorage.getItem('ambientVolume')) || 0.3; }
    catch (error) { return 0.3; }
  });

  // Use sound hook
  const {
    playAlarm,
    startAmbient,
    stopAmbient
  } = useSound({
    alarmType: alarmSoundType,
    alarmVolume,
    ambientType: ambientSoundType,
    ambientVolume
  });

  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    try { return localStorage.getItem('animationsEnabled') !== 'false'; }
    catch (error) { return true; }
  });

  const [confettiActiveDuration, setConfettiActiveDuration] = useState(0); // in seconds, controls how long confetti animation plays

  // Use real active users from presence hook
  const activeUsers = realActiveUsers;

  // Gamification states
  const [currentStreak, setCurrentStreak] = useState(() => parseInt(localStorage.getItem('currentStreak')) || 0);
  const [lastCompletionDate, setLastCompletionDate] = useState(() => localStorage.getItem('lastCompletionDate') || null);
  const [totalCompletions, setTotalCompletions] = useState(() => parseInt(localStorage.getItem('totalCompletions')) || 0);
  const [achievements, setAchievements] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('achievements')) || [];
    } catch { return []; }
  });
  const [showAchievement, setShowAchievement] = useState(null);
  const [firstTimerDate, setFirstTimerDate] = useState(() => localStorage.getItem('firstTimerDate') || null);
  const [monthlyStats, setMonthlyStats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('monthlyStats')) || {};
    } catch { return {}; }
  });

  // Daily challenges
  const [dailyChallenge, setDailyChallenge] = useState(() => {
    try {
      const stored = localStorage.getItem('dailyChallenge');
      if (stored) {
        const challenge = JSON.parse(stored);
        const today = new Date().toDateString();
        if (challenge.date === today) return challenge;
      }
    } catch {}

    // Generate new daily challenge
    const challenges = [
      { type: 'completions', target: 5, text: 'Complete 5 timers today', icon: '🎯' },
      { type: 'time', target: 120, text: 'Focus for 2 hours total', icon: '⏱️' },
      { type: 'streak', target: 1, text: 'Maintain your streak', icon: '🔥' },
      { type: 'morning', target: 1, text: 'Complete a timer before 10 AM', icon: '🌅' },
      { type: 'pomodoro', target: 4, text: 'Complete 4 Pomodoros (25min each)', icon: '🍅' },
    ];
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    return { ...randomChallenge, date: new Date().toDateString(), progress: 0 };
  });

  // Time capsule messages
  const [timeCapsules, setTimeCapsules] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('timeCapsules')) || [];
    } catch { return []; }
  });
  const [showCapsuleInput, setShowCapsuleInput] = useState(false);
  const [capsuleMessage, setCapsuleMessage] = useState('');
  const [showCapsuleNotification, setShowCapsuleNotification] = useState(null);

  // Active scene state
  const [activeScene, setActiveScene] = useState('none');
  // We only use the setter for currentTimerScene in several places; omit the unused value to satisfy lint
  const [, setCurrentTimerScene] = useState('none');

  const colorOptions = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'];
  const groups = [...new Set(saved.map(t => t.group).filter(Boolean))];
  // When creating new timers, exclude "Sequences" from the dropdown since sequences are special
  const filteredGroups = groups
    .filter(g => g !== 'Sequences')
    .filter(g => g.toLowerCase().includes(newTimerGroup.toLowerCase()));
  const intervalRef = useRef(null);
  const lastActiveTimeRef = useRef(null);
  const handleCompleteRef = useRef(null);
  const chatInputRef = useRef(null);
  const currentStepRef = useRef(0);
  const sequenceRef = useRef([]);

  // Persistence Effects
  useEffect(() => localStorage.setItem('selectedThemeName', theme.name), [theme]);
  useEffect(() => localStorage.setItem('savedTimers', JSON.stringify(saved)), [saved]);
  useEffect(() => localStorage.setItem('timerHistory', JSON.stringify(history)), [history]);
  useEffect(() => localStorage.setItem('repeatEnabled', repeatEnabled), [repeatEnabled]);
  useEffect(() => localStorage.setItem('alarmSoundType', alarmSoundType), [alarmSoundType]);
  useEffect(() => localStorage.setItem('alarmVolume', alarmVolume.toString()), [alarmVolume]);
  useEffect(() => localStorage.setItem('ambientSoundType', ambientSoundType), [ambientSoundType]);
  useEffect(() => localStorage.setItem('ambientVolume', ambientVolume.toString()), [ambientVolume]);
  useEffect(() => localStorage.setItem('animationsEnabled', animationsEnabled.toString()), [animationsEnabled]);
  useEffect(() => localStorage.setItem('currentStreak', currentStreak.toString()), [currentStreak]);
  useEffect(() => localStorage.setItem('lastCompletionDate', lastCompletionDate), [lastCompletionDate]);
  useEffect(() => localStorage.setItem('totalCompletions', totalCompletions.toString()), [totalCompletions]);
  useEffect(() => localStorage.setItem('achievements', JSON.stringify(achievements)), [achievements]);
  useEffect(() => localStorage.setItem('monthlyStats', JSON.stringify(monthlyStats)), [monthlyStats]);
  useEffect(() => { if (firstTimerDate) localStorage.setItem('firstTimerDate', firstTimerDate); }, [firstTimerDate]);
  useEffect(() => localStorage.setItem('dailyChallenge', JSON.stringify(dailyChallenge)), [dailyChallenge]);
  useEffect(() => localStorage.setItem('timeCapsules', JSON.stringify(timeCapsules)), [timeCapsules]);

  // Update active users count every 30 seconds with realistic variation
  // Active users now managed by usePresence hook

  // Parse URL parameters for shared timers and rooms (run once)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedTimer = params.get('timer');
    const joinRoomParam = params.get('joinRoom');

    if (sharedTimer) {
      try {
        const decoded = JSON.parse(atob(sharedTimer));
        if (decoded.type === 'quick') {
          // Quick timer from URL
          setMode('timer');
          const totalSeconds = (decoded.h || 0) * 3600 + (decoded.m || 0) * 60 + (decoded.s || 0);
            if (totalSeconds > 0) {
            setTime(totalSeconds);
            setInitialTime(totalSeconds);
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Timer loaded: ${formatTime(totalSeconds)}`, type: 'info', ttl: 3000 } }));
          }
        } else if (decoded.type === 'interval') {
          // Interval timer from URL
          setMode('interval');
          setWork(decoded.work || 40);
          setRest(decoded.rest || 20);
          setRounds(decoded.rounds || 8);
          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Interval loaded: ${decoded.work}s / ${decoded.rest}s × ${decoded.rounds}`, type: 'info', ttl: 3000 } }));
        }
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to parse shared timer:', error);
      }
    }

    if (joinRoomParam) {
      try {
        // Switch to rooms tab
        setActiveMainTab('rooms');
        // Join the room
        handleJoinRoom(joinRoomParam);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to join room from URL:', error);
      }
    }
  }, [handleJoinRoom]);

  // Check for ready time capsules whenever timeCapsules changes
  useEffect(() => {
    const now = Date.now();
    timeCapsules.forEach(capsule => {
      if (capsule.openAt <= now && !capsule.opened) {
        setShowCapsuleNotification(capsule);
        setTimeCapsules(prev => prev.map(c => c.id === capsule.id ? { ...c, opened: true } : c));
      }
    });
  }, [timeCapsules]);

  // Page Visibility API - Handle tab switching correctly
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Store timestamp when tab becomes hidden
        lastActiveTimeRef.current = Date.now();
      } else if (isRunning && lastActiveTimeRef.current) {
        // Calculate elapsed time while tab was hidden
        const elapsed = Math.floor((Date.now() - lastActiveTimeRef.current) / 1000);

        if (mode === 'stopwatch') {
          // For stopwatch, add elapsed time
          setTime(prev => prev + elapsed);
        } else {
          // For countdown timers, subtract elapsed time
          setTime(prev => Math.max(0, prev - elapsed));
        }

        lastActiveTimeRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, mode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (mode === 'stopwatch') return prev + 1;
          if (prev <= 0) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode]);

  useEffect(() => {
    if (time === 0 && isRunning && mode !== 'stopwatch') {
      // Call the latest handleComplete via ref to avoid adding the function to deps
      if (handleCompleteRef.current) handleCompleteRef.current();
    }
  }, [time, isRunning, mode]);

  // useEffect to manage confetti visibility based on duration
  useEffect(() => {
    if (showCelebration && confettiActiveDuration > 0) {
        const timer = setTimeout(() => {
            setConfettiActiveDuration(0); // Stop confetti after its duration
        }, confettiActiveDuration * 1000);
        return () => clearTimeout(timer);
    }
  }, [showCelebration, confettiActiveDuration]);

  // Handle scene changes for Focus Room composite timers
  useEffect(() => {
    if (currentRoom && currentRoom.timerType === 'composite' && currentRoom.compositeTimer?.steps) {
      const currentStepData = currentRoom.compositeTimer.steps[currentRoom.currentStep || 0];
      if (currentStepData && currentStepData.scene && currentStepData.scene !== 'none') {
        setActiveScene(currentStepData.scene);
        setCurrentTimerScene(currentStepData.scene);
      } else {
        setActiveScene('none');
        setCurrentTimerScene('none');
      }
    }
  }, [currentRoom, currentRoom?.currentStep, currentRoom?.timerType]);

  // Achievement definitions (memoized so checkAchievements can be stable)
  const ACHIEVEMENTS = React.useMemo(() => ([
    { id: 'first_timer', name: 'First Steps', description: 'Complete your first timer', icon: '🎯', requirement: 1 },
    { id: 'early_bird', name: 'Early Bird', description: 'Complete a timer before 7 AM', icon: '🌅', checkTime: true },
    { id: 'night_owl', name: 'Night Owl', description: 'Complete a timer after 10 PM', icon: '🦉', checkTime: true },
    { id: 'century_club', name: 'Century Club', description: 'Complete 100 timers', icon: '💯', requirement: 100 },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: '🔥', streak: 7 },
    { id: 'streak_30', name: 'Month Master', description: '30-day streak', icon: '👑', streak: 30 },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Complete 10 timers in one day', icon: '⚡', dailyCount: 10 },
    { id: 'dedicated', name: 'Dedicated', description: 'Complete 500 timers', icon: '🏆', requirement: 500 },
  ]), []);

  const checkAchievements = useCallback((completionData) => {
    const newAchievements = [];
    const currentHour = new Date().getHours();

    // Check each achievement
    ACHIEVEMENTS.forEach(ach => {
      if (achievements.includes(ach.id)) return; // Already unlocked

      let unlocked = false;

      if (ach.requirement && totalCompletions + 1 >= ach.requirement) {
        unlocked = true;
      }

      if (ach.streak && currentStreak >= ach.streak) {
        unlocked = true;
      }

      if (ach.checkTime) {
        if (ach.id === 'early_bird' && currentHour < 7) unlocked = true;
        if (ach.id === 'night_owl' && currentHour >= 22) unlocked = true;
      }

      if (ach.dailyCount) {
        const today = new Date().toDateString();
        const todayCompletions = history.filter(h => new Date(h.completedAt).toDateString() === today).length + 1;
        if (todayCompletions >= ach.dailyCount) unlocked = true;
      }

      if (unlocked) {
        newAchievements.push(ach.id);
        setShowAchievement(ach);
        setTimeout(() => setShowAchievement(null), 5000);
      }
    });

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [achievements, totalCompletions, currentStreak, history, ACHIEVEMENTS]);

  const playAlarmSound = useCallback(() => {
    playAlarm();
  }, [playAlarm]);

  const addToHistory = React.useCallback((entry) => {
    setHistory(prev => [
      { ...entry, completedAt: new Date().toISOString(), id: Date.now() },
      ...prev
    ].slice(0, 10)); // Keep only last 10 entries

        // Track first timer date
        if (!firstTimerDate) {
            setFirstTimerDate(new Date().toISOString());
        }

        // Update monthly stats
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        setMonthlyStats(prev => ({
            ...prev,
            [currentMonth]: {
                completions: (prev[currentMonth]?.completions || 0) + 1,
                totalSeconds: (prev[currentMonth]?.totalSeconds || 0) + (entry.totalSeconds || 0),
                bestStreak: Math.max(prev[currentMonth]?.bestStreak || 0, currentStreak),
            }
        }));

        // Update streak and completions
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();

        setTotalCompletions(prev => {
            const newTotal = prev + 1;
            // Check achievements after updating total
            setTimeout(() => checkAchievements(entry), 100);
            return newTotal;
        });

    if (lastCompletionDate === today) {
            // Already completed today, no streak change
        } else if (lastCompletionDate === yesterdayString) {
            // Consecutive day
            setCurrentStreak(prev => prev + 1);
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `🔥 ${currentStreak + 1} day streak!`, type: 'success', ttl: 3000 } }));
        } else if (!lastCompletionDate) {
            // First ever completion
            setCurrentStreak(1);
        } else {
            // Streak broken
            setCurrentStreak(1);
        }
        setLastCompletionDate(today);

        // Update daily challenge progress
        if (dailyChallenge && dailyChallenge.date === today) {
            let newProgress = dailyChallenge.progress;

            if (dailyChallenge.type === 'completions') {
                newProgress = dailyChallenge.progress + 1;
            } else if (dailyChallenge.type === 'time') {
                newProgress = dailyChallenge.progress + Math.floor((entry.totalSeconds || 0) / 60);
            } else if (dailyChallenge.type === 'morning') {
                const hour = new Date().getHours();
                if (hour < 10) newProgress = 1;
            } else if (dailyChallenge.type === 'pomodoro') {
                // Check if this was a ~25 min timer
                if (entry.totalSeconds >= 1400 && entry.totalSeconds <= 1600) {
                    newProgress = dailyChallenge.progress + 1;
                }
            }

            setDailyChallenge(prev => ({ ...prev, progress: newProgress }));

            // Check if challenge completed
            if (newProgress >= dailyChallenge.target && dailyChallenge.progress < dailyChallenge.target) {
                window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `🎯 Daily Challenge Complete!`, type: 'success', ttl: 3000 } }));
            }
    }
  }, [firstTimerDate, currentStreak, lastCompletionDate, dailyChallenge, checkAchievements]);

  const handleComplete = React.useCallback(() => {
    setIsTransitioning(true);
    setIsRunning(false);
    // Stop ambient sound when timer completes
    stopAmbient();

    playAlarmSound();

    let sessionConfettiDuration = 5; // Default for Timer/Interval
    if (mode === 'sequence') {
        sessionConfettiDuration = 8; // Longer for sequences
    }
    setConfettiActiveDuration(sessionConfettiDuration);

    // Capture mode and other state for use in timeout
    const localMode = mode;
    const localIsWork = isWork;
    const localCurrentRound = currentRound;

    setTimeout(() => {
      if (localMode === 'interval') {
        if (localIsWork) {
          setIsWork(false);
          setTime(rest);
          setIsRunning(true);
          setIsTransitioning(false);
        } else if (localCurrentRound < rounds) {
          setCurrentRound(prev => prev + 1);
          setIsWork(true);
          setTime(work);
          setIsRunning(true);
          setIsTransitioning(false);
        } else {
            // Interval Session Completed
            const totalTime = work * rounds + rest * rounds;
            const completionData = {
                type: 'Interval',
                name: `Interval: ${work}s work / ${rest}s rest`, // More descriptive name
                totalSeconds: totalTime,
                details: `${rounds} rounds (${work}s work / ${rest}s rest})`
            };
            addToHistory(completionData);

          if (repeatEnabled) {
            setCurrentRound(1);
            setIsWork(true);
            setTime(work);
            setIsRunning(true);
            setIsTransitioning(false);
          } else {
            setActiveScene('none');
            setCompletedSession(completionData);
            setShowCelebration(true);
            setIsTransitioning(false);
          }
        }
      } else if (localMode === 'sequence') {
        // Use refs for sequence logic to ensure we have latest values
        const currentSeq = sequenceRef.current;
        const currStep = currentStepRef.current;

        if (currStep < currentSeq.length - 1) {
          const nextStep = currStep + 1;
          const nextTimer = currentSeq[nextStep];
          const nextDuration = nextTimer.unit === 'sec' ? nextTimer.duration : nextTimer.duration * 60;
          
          // Apply scene for next step in sequence
          if (nextTimer.scene) {
            setActiveScene(nextTimer.scene);
            setCurrentTimerScene(nextTimer.scene);
          }

          setCurrentStep(nextStep);
          setTime(nextDuration);
          setIsRunning(true);
          
          // Small delay to ensure state updates propagate before hiding transition overlay
          setTimeout(() => setIsTransitioning(false), 50);
        } else {
            // Sequence Completed
            const totalSeconds = currentSeq.reduce((sum, t) => {
              return sum + (t.unit === 'sec' ? t.duration : t.duration * 60);
            }, 0);
            const sequenceName = seqName || 'Unnamed Sequence'; // Use actual sequence name if available
            const completionData = {
                type: 'Sequence',
                name: sequenceName,
                totalSeconds: totalSeconds,
                details: `${currentSeq.length} steps`
            };
            addToHistory(completionData);

          if (repeatEnabled) {
            setCurrentStep(0);
            const firstTimer = currentSeq[0];
            const firstDuration = firstTimer.unit === 'sec' ? firstTimer.duration : firstTimer.duration * 60;
            setTime(firstDuration);
            setIsRunning(true);
            setIsTransitioning(false);
          } else {
            setActiveScene('none');
            setCompletedSession(completionData);
            setShowCelebration(true);
            setIsTransitioning(false);
          }
        }
      } else if (localMode === 'timer') {
          // Timer Completed
          const timerName = saved.find(t => t.isSequence === false && t.duration * (t.unit === 'min' ? 60 : 1) === initialTime)?.name || `Quick Timer`; // Try to find name if it was a saved timer
          const completionData = {
              type: 'Timer',
              name: timerName,
              totalSeconds: initialTime,
              details: formatTime(initialTime)
          };
          addToHistory(completionData);
          
        if (repeatEnabled) {
          setTime(initialTime);
          setIsRunning(true);
          setIsTransitioning(false);
        } else {
          setActiveScene('none');
          setCompletedSession(completionData);
          setShowCelebration(true);
          setIsTransitioning(false);
        }
      } else {
        setActiveScene('none');
        setIsTransitioning(false);
      }
    }, 500);
  }, [
    mode,
    isWork,
    currentRound,
    rounds,
    work,
    rest,
    repeatEnabled,
    initialTime,
    saved,
    addToHistory,
    playAlarmSound,
    stopAmbient,
    seqName,
  ]);

  // Keep ref updated with the latest handleComplete function so effects can call it
  useEffect(() => {
    handleCompleteRef.current = handleComplete;
  }, [handleComplete]);

  // Keep refs in sync with state
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);

  const startTimer = (totalSeconds, scene = 'none') => {
    setMode('timer');
    setTime(totalSeconds);
    setInitialTime(totalSeconds);
    setIsRunning(true);
    setCurrentTimerScene(scene);
    setActiveScene(scene);
    if (inputHours || inputMinutes || inputSeconds) {
      setInputHours('');
      setInputMinutes('');
      setInputSeconds('');
    }
    // Start ambient sound if configured
    if (ambientSoundType !== 'None') {
      const soundConfig = AMBIENT_SOUNDS.find(s => s.name === ambientSoundType);
      if (soundConfig) {
        startAmbient(soundConfig.file);
      }
    }
  };

  const startStopwatch = () => {
    setMode('stopwatch');
    setTime(0);
    setIsRunning(true);
    setActiveScene('none');
    setCurrentTimerScene('none');
  };
  const startInterval = () => { setMode('interval'); setTime(work); setCurrentRound(1); setIsWork(true); setIsRunning(true); };

  const pauseTimer = () => { 
    setIsRunning(false); 
    // Stop ambient sound when paused
    stopAmbient();
  };
  const resetTimer = () => { 
    setIsRunning(false); 
    setTime(initialTime);
    // Stop ambient sound when reset
    stopAmbient();
  };
  const pauseStopwatch = () => { setIsRunning(false); };
  const resetStopwatch = () => { setIsRunning(false); setTime(0); };

  // Theme management: Theme UI handled in settings; setters remain for compatibility
  const startSequence = () => {
    if (sequence.length === 0) return;
    setMode('sequence');
    setCurrentStep(0);
    const firstDuration = sequence[0].unit === 'sec' ? sequence[0].duration : sequence[0].duration * 60;
    setTime(firstDuration);
    setIsRunning(true);
    // Apply scene from first step
    if (sequence[0].scene) {
      setActiveScene(sequence[0].scene);
      setCurrentTimerScene(sequence[0].scene);
    }
  };

    const moveSequenceStep = (index, direction) => {
        const newSequence = [...sequence];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newSequence.length) return;
        
        [newSequence[index], newSequence[targetIndex]] = [newSequence[targetIndex], newSequence[index]];
        setSequence(newSequence);
    };

  const saveSequence = () => {
    if (sequence.length > 0 && seqName) {
      const totalMinutes = sequence.reduce((sum, t) => {
        const mins = t.unit === 'sec' ? t.duration / 60 : t.duration;
        return sum + mins;
      }, 0);

      setSaved(prev => [{
        name: seqName,
        duration: Math.ceil(totalMinutes),
        unit: 'min',
        min: Math.ceil(totalMinutes),
        color: sequence[0].color,
        group: 'Sequences',
        isSequence: true,
        steps: sequence
      }, ...prev]);
      setSequence([]);
      setSeqName('');
      setShowBuilder(false);
    }
  };

  const createTimer = () => {
    if (newTimerName && newTimerMin) {
      const durationValue = parseInt(newTimerMin);
      if (isNaN(durationValue) || durationValue < 0) return;

      setSaved(prev => [{
        name: newTimerName,
        duration: durationValue,
        unit: newTimerUnit,
        min: newTimerUnit === 'min' ? durationValue : Math.ceil(durationValue / 60),
        color: newTimerColor,
        group: newTimerGroup || 'Custom',
        scene: newTimerScene
      }, ...prev]);
      setNewTimerName('');
      setNewTimerMin('');
      setNewTimerUnit('min');
      setNewTimerColor('#3b82f6');
      setNewTimerGroup('');
      setNewTimerScene('none');
      setShowCreateTimer(false);
    }
  };

  const cancelCreateTimer = () => {
    // Reset all form fields
    setNewTimerName('');
    setNewTimerMin('');
    setNewTimerUnit('min');
    setNewTimerColor('#3b82f6');
    setNewTimerGroup('');
    setNewTimerScene('none');
    setShowGroupDropdown(false);
    // Close the form
    setShowCreateTimer(false);
  };

  // Export all data
  const exportData = () => {
    const allData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      saved,
      history,
      currentStreak,
      lastCompletionDate,
      totalCompletions,
      achievements,
      monthlyStats,
      firstTimerDate,
      timeCapsules: timeCapsules.filter(c => !c.opened), // Only export unopened capsules
      theme: theme.name
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: '✅ Data exported successfully!', type: 'success', ttl: 3000 } }));
  };

  // Import data
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Validate and import
        if (imported.version && imported.exportDate) {
          if (imported.saved) setSaved(imported.saved);
          if (imported.history) setHistory(imported.history);
          if (imported.currentStreak !== undefined) setCurrentStreak(imported.currentStreak);
          if (imported.lastCompletionDate) setLastCompletionDate(imported.lastCompletionDate);
          if (imported.totalCompletions !== undefined) setTotalCompletions(imported.totalCompletions);
          if (imported.achievements) setAchievements(imported.achievements);
          if (imported.monthlyStats) setMonthlyStats(imported.monthlyStats);
          if (imported.firstTimerDate) setFirstTimerDate(imported.firstTimerDate);
          if (imported.timeCapsules) setTimeCapsules(imported.timeCapsules);
          if (imported.theme) {
            const importedTheme = themes.find(t => t.name === imported.theme);
            if (importedTheme) setTheme(importedTheme);
          }

          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: '✅ Data imported successfully!', type: 'success', ttl: 3000 } }));
        } else {
          throw new Error('Invalid backup file');
        }
      } catch (error) {
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: '❌ Failed to import data', type: 'error', ttl: 3000 } }));
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Clear all cache and reset to default state
  const clearAllCache = () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Reset all state to defaults
      setSaved(defaultSavedTimers);
      setHistory([]);
      setTheme(themes[0]);
      setThemes([...DEFAULT_THEMES]);
      setCollapsedGroups({});
      setAchievements({});
      setMonthlyStats({});
      setCurrentStreak(0);
      setLastCompletionDate(null);
      setTotalCompletions(0);
      setFirstTimerDate(null);
      setTimeCapsules([]);
      
      // Reset timer states
      setMode('timer');
      setIsRunning(false);
      setTime(0);
      setInputHours('');
      setInputMinutes('');
      setInputSeconds('');
      setInitialTime(0);
      setWork(40);
      setRest(20);
      setRounds(8);
      setCurrentRound(1);
      setIsWork(true);
      setSequence([]);
      setCurrentStep(0);
      setSeqName('');
      
      // Reset UI states
      setActiveMainTab('rooms');
      setActiveFeatureTab(null);
      setShowCreateTimer(false);
      setShowThemes(false);
      setShowBuilder(false);
      setShowSettings(false);
      
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: '✅ Cache cleared! App reset to initial state.', type: 'success', ttl: 3000 } }));
      setShowClearCacheModal(false);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: '❌ Failed to clear cache', type: 'error', ttl: 3000 } }));
    }
  };

  const shareCurrentTimer = () => {
    let timerData = {};
    if (mode === 'timer' && (inputHours || inputMinutes || inputSeconds)) {
      timerData = {
        type: 'quick',
        h: parseInt(inputHours) || 0,
        m: parseInt(inputMinutes) || 0,
        s: parseInt(inputSeconds) || 0
      };
    } else if (mode === 'interval') {
      timerData = {
        type: 'interval',
        work: work,
        rest: rest,
        rounds: rounds
      };
    } else {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Set up a timer first to share it!', type: 'info', ttl: 3000 } }));
      return;
    }

    const encoded = btoa(JSON.stringify(timerData));
    const url = `${window.location.origin}${window.location.pathname}?timer=${encoded}`;
    navigator.clipboard.writeText(url);
    setShareLink(url);
    setShowShareModal(true);
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Timer link copied to clipboard!', type: 'success', ttl: 3000 } }));
  };

  const shareTimerGroup = (groupName) => {
    const groupTimers = saved.filter(t => t.group === groupName && !t.isSequence);
    const encoded = btoa(JSON.stringify({ group: groupName, timers: groupTimers }));
    const url = `${window.location.origin}${window.location.pathname}?import=${encoded}`;
    setShareLink(url); setShowShareModal(true); navigator.clipboard.writeText(url);
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Share link copied to clipboard!', type: 'success', ttl: 3000 } }));
  };

  // Time capsule functions
  const createTimeCapsule = () => {
    if (!capsuleMessage.trim()) return;

    const newCapsule = {
      id: Date.now(),
      message: capsuleMessage,
      createdAt: Date.now(),
      openAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
      opened: false
    };

    setTimeCapsules(prev => [...prev, newCapsule]);
    setCapsuleMessage('');
    setShowCapsuleInput(false);
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: '📩 Time capsule created! You\'ll see it in 30 days', type: 'success', ttl: 3000 } }));
  };

  const confirmDelete = (timer) => { setTimerToDelete(timer); setShowDeleteModal(true); };
  const executeDelete = () => { if (timerToDelete) { setSaved(prev => prev.filter(t => t !== timerToDelete)); setTimerToDelete(null); setShowDeleteModal(false); } };
  const formatTime = (sec) => { const m = Math.floor(sec / 60); const s = sec % 60; const h = Math.floor(m / 60); const remM = m % 60; return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`; };

    // Smart suggestions based on history
    const getSmartSuggestions = useCallback(() => {
        if (history.length < 3) return [];

        const suggestions = [];

        // Analyze completion times
        const morningCompletions = history.filter(h => {
            const hour = new Date(h.completedAt).getHours();
            return hour >= 6 && hour < 12;
        }).length;

        const afternoonCompletions = history.filter(h => {
            const hour = new Date(h.completedAt).getHours();
            return hour >= 12 && hour < 18;
        }).length;

        const eveningCompletions = history.filter(h => {
            const hour = new Date(h.completedAt).getHours();
            return hour >= 18 && hour < 24;
        }).length;

        // Time of day suggestion
        if (morningCompletions > afternoonCompletions && morningCompletions > eveningCompletions) {
            suggestions.push({ icon: '🌅', text: `You're ${Math.round((morningCompletions / history.length) * 100)}% more productive in the morning` });
        } else if (eveningCompletions > morningCompletions && eveningCompletions > afternoonCompletions) {
            suggestions.push({ icon: '🌙', text: `You focus best in the evening (${Math.round((eveningCompletions / history.length) * 100)}% of completions)` });
        }

        // Average session length
        const avgSeconds = history.reduce((sum, h) => sum + (h.totalSeconds || 0), 0) / history.length;
        const avgMins = Math.round(avgSeconds / 60);
        if (avgMins > 0) {
            suggestions.push({ icon: '⏱️', text: `Your average session is ${avgMins} minutes` });
        }

        // Day of week pattern
        const dayCompletions = {};
        history.forEach(h => {
            const day = new Date(h.completedAt).getDay();
            dayCompletions[day] = (dayCompletions[day] || 0) + 1;
        });
        const bestDay = Object.entries(dayCompletions).sort((a, b) => b[1] - a[1])[0];
        if (bestDay) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            suggestions.push({ icon: '📅', text: `${dayNames[bestDay[0]]} is your most productive day` });
        }

        // Motivational based on streak
        if (currentStreak >= 3) {
            suggestions.push({ icon: '🔥', text: `Keep it up! ${currentStreak} day streak is impressive` });
        }

        return suggestions.slice(0, 3); // Max 3 suggestions
    }, [history, currentStreak]);

    const calculateTotalRemaining = useCallback(() => {
        if (!isRunning && !isTransitioning && time === 0) return 0; // If not running and time is 0, nothing left

        if (mode === 'interval') {
            let total = 0;
            // Add current time
            total += time;
            // Add remaining rest for current round if currently working
            if (isWork) {
                 total += rest;
            }
            // Add full durations for remaining rounds
            const remainingRounds = rounds - currentRound - (isWork ? 0 : 1); // Subtract 1 if rest has finished but round not incremented
            total += Math.max(0, remainingRounds) * (work + rest);

            return total;
        } else if (mode === 'sequence') {
            let total = time;
            for (let i = currentStep + 1; i < sequence.length; i++) {
                 const step = sequence[i];
                 total += step.unit === 'min' ? step.duration * 60 : step.duration;
            }
            return total;
        }
        return 0;
      }, [mode, isRunning, isTransitioning, time, rounds, currentRound, work, rest, isWork, sequence, currentStep]);

  const showWarning = time <= 10 && time >= 0 && (isRunning || isTransitioning) && mode !== 'stopwatch';
  const showCritical = time <= 5 && time >= 0 && (isRunning || isTransitioning) && mode !== 'stopwatch';

  // Determine which background to use (scene takes priority when timer is running)
  // Determine if we should show a scene background
  const shouldShowScene = (isRunning || currentRoom?.timer) && activeScene !== 'none' && SCENES[activeScene]?.bg;
  const activeBackground = shouldShowScene
    ? SCENES[activeScene].bg
    : (previewTheme || theme).bg;

  return (
    <div
      className="app-container"
      style={{
        minHeight: '100vh',
        background: activeBackground,
        color: (previewTheme || theme).text || 'white',
        padding: '20px',
        fontFamily: 'system-ui',
        transition: 'background 1s ease-in-out, color 0.3s ease-in-out'
      }}
    >
      <ModalProvider theme={theme}>
      <ToastProvider theme={theme}>
      <style>{`
        @keyframes pulseTimer {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes slideDown {
          0% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .app-container { padding: 20px; }
        @media (max-width: 600px) { .app-container { padding: 10px; } }
        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          z-index: 9999;
          /* Use a dynamic animation duration via CSS variable */
          animation: confetti var(--confetti-animation-duration) ease-out forwards;
        }

        /* Basic responsive adjustments for inputs and buttons */
        @media (max-width: 480px) {
          input[type="number"], select, button {
            font-size: 14px !important;
            padding: 12px !important;
          }
          .flex-wrap-sm {
            flex-wrap: wrap;
          }
          .grid-col-sm-3-to-1 { /* For 3-column grids collapsing to 1 */
            grid-template-columns: 1fr !important;
            gap: 8px !important; /* Adjust gap for stacked elements */
          }
          .grid-col-sm-3-to-1 > div {
             grid-column: span 1 / span 1 !important;
             width: 100% !important;
             /* margin-bottom handled by gap */
          }
          /* Adjustments for the HH:MM:SS inputs, ensuring they stack but stay small */
          .hh-mm-ss-input-group > input {
            width: 70px !important; /* Slightly smaller for very small screens */
            padding: 10px 4px !important;
            font-size: 16px !important;
          }
           .hh-mm-ss-input-group {
             justify-content: space-between !important; /* Spread them out a bit */
             gap: 4px !important;
           }
        }
         /* Remove Arrows/Spinners from number input */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Global toasts rendered by ToastProvider (forwarded from legacy calls) */}

      {/* Achievement Unlock Popup */}
      {showAchievement && (
        <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px 32px', borderRadius: 16, zIndex: 1001, fontSize: 14, fontWeight: 600, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', border: '2px solid rgba(255,255,255,0.2)', animation: 'slideDown 0.5s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40 }}>{showAchievement.icon}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🎉 Achievement Unlocked!</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{showAchievement.name}</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{showAchievement.description}</div>
            </div>
          </div>
        </div>
      )}

      {/* Time Capsule Notification */}
      {showCapsuleNotification && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}>
          <div style={{ background: theme.card, borderRadius: 32, padding: 48, maxWidth: 500, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📬</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, margin: 0 }}>
              Time Capsule Opened!
            </h2>
            <p style={{ fontSize: 16, color: getTextOpacity(theme, 0.7), marginBottom: 32 }}>
              A message from your past self, {Math.floor((Date.now() - showCapsuleNotification.createdAt) / (1000 * 60 * 60 * 24))} days ago:
            </p>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 15, marginBottom: 32, fontSize: 16, lineHeight: 1.6, fontStyle: 'italic' }}>
              "{showCapsuleNotification.message}"
            </div>
            <button
              onClick={() => setShowCapsuleNotification(null)}
              style={{ width: '100%', background: theme.accent, border: 'none', borderRadius: 10, padding: 15, color: getContrastColor(theme.accent), cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Celebration Screen */}
      {showCelebration && confettiActiveDuration > 0 && (
        <>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                background: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 7)],
                animationDelay: `${Math.random() * 0.5}s`,
                '--confetti-animation-duration': `${confettiActiveDuration + Math.random() * 2}s`
              }}
            />
          ))}

          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
            <div style={{ background: theme.card, borderRadius: 32, padding: 48, maxWidth: 500, width: '90%', textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, margin: 0 }}>
                Well Done!
              </h2>
              <p style={{ fontSize: 18, color: getTextOpacity(theme, 0.7), marginBottom: 32 }}>
                You completed your {completedSession?.type}!
              </p>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, marginBottom: 32 }}>
                <div style={{ fontSize: 14, color: getTextOpacity(theme, 0.5), marginBottom: 8 }}>Total Time</div>
                <div style={{ fontSize: 48, fontWeight: 700, color: theme.accent }}>
                  {formatTime(completedSession?.totalSeconds || 0)}
                </div>
                {completedSession?.details && (
                  <div style={{ fontSize: 14, color: getTextOpacity(theme, 0.5), marginTop: 8 }}>
                    {completedSession.details}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    setCompletedSession(null);
                    setTime(0);
                    setCurrentStep(0);
                    setCurrentRound(1);
                    setMode('timer');
                  }}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 16, padding: '20px', color: theme.text, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    if (completedSession?.type === 'Sequence' && sequence.length > 0) {
                      startSequence();
                    } else if (completedSession?.type === 'Interval') {
                      startInterval();
                    } else if (completedSession?.type === 'Timer') {
                      startTimer(initialTime);
                    }
                  }}
                  style={{ flex: 1, background: theme.accent, border: 'none', borderRadius: 16, padding: '20px', color: getContrastColor(theme.accent), cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
                >
                  Start Again
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showShareModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowShareModal(false)}><div style={{ background: theme.card, borderRadius: 10, padding: 15, maxWidth: 500, width: '90%' }} onClick={(e) => e.stopPropagation()}><h3 style={{ margin: 0, marginBottom: 16 }}>Link Copied! 🎉</h3><div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, marginBottom: 24, wordBreak: 'break-all', fontSize: 13 }}>{shareLink}</div><button onClick={() => setShowShareModal(false)} style={{ width: '100%', background: theme.accent, border: 'none', borderRadius: 12, padding: 16, color: getContrastColor(theme.accent), cursor: 'pointer' }}>Close</button></div></div>}
      {showDeleteModal && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowDeleteModal(false)}><div style={{ background: theme.card, borderRadius: 10, padding: 15, maxWidth: 400, width: '90%' }} onClick={(e) => e.stopPropagation()}><h3 style={{ margin: 0, marginBottom: 16 }}>Delete "{timerToDelete?.name}"?</h3><div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: 16, color: theme.text, cursor: 'pointer' }}>Cancel</button><button onClick={executeDelete} style={{ flex: 1, background: '#ef4444', border: 'none', borderRadius: 12, padding: 16, color: 'white', cursor: 'pointer' }}>Delete</button></div></div></div>}
      {showCreateRoomModal && <CreateRoomModal theme={theme} onClose={() => setShowCreateRoomModal(false)} onCreateRoom={handleCreateRoom} savedTimers={saved} />}
      {showFeedbackModal && <FeedbackModal theme={theme} onClose={() => setShowFeedbackModal(false)} />}
      {showInfoModal && <InfoModal theme={theme} onClose={() => setShowInfoModal(false)} />}

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 20
          }}
          onClick={() => {
            setShowColorPicker(false);
            setEditingTheme(null);
          }}
        >
          <div
            style={{
              background: theme.card,
              borderRadius: 24,
              padding: '24px 20px',
              maxWidth: 500,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: 0, marginBottom: 20, fontSize: 18, fontWeight: 700 }}>
              {editingTheme ? '✏️ Edit Theme' : '🎨 Create Custom Theme'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Theme Name */}
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: theme.text }}>
                  Theme Name
                </label>
                <input
                  type="text"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="Enter theme name..."
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                    borderRadius: 8,
                    padding: 12,
                    color: theme.text,
                    fontSize: 14
                  }}
                />
              </div>

              {/* Color Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: theme.text }}>
                    Background
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={newThemeBg}
                      onChange={(e) => setNewThemeBg(e.target.value)}
                      style={{
                        width: 50,
                        height: 32,
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={newThemeBg}
                      onChange={(e) => setNewThemeBg(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                        borderRadius: 6,
                        padding: '6px 8px',
                        color: theme.text,
                        fontSize: 12,
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: theme.text }}>
                    Card
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={newThemeCard}
                      onChange={(e) => setNewThemeCard(e.target.value)}
                      style={{
                        width: 50,
                        height: 32,
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={newThemeCard}
                      onChange={(e) => setNewThemeCard(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                        borderRadius: 6,
                        padding: '6px 8px',
                        color: theme.text,
                        fontSize: 12,
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: theme.text }}>
                    Accent
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={newThemeAccent}
                      onChange={(e) => setNewThemeAccent(e.target.value)}
                      style={{
                        width: 50,
                        height: 32,
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={newThemeAccent}
                      onChange={(e) => setNewThemeAccent(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                        borderRadius: 6,
                        padding: '6px 8px',
                        color: theme.text,
                        fontSize: 12,
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 600, color: theme.text }}>
                    Text
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={newThemeText}
                      onChange={(e) => setNewThemeText(e.target.value)}
                      style={{
                        width: 50,
                        height: 32,
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={newThemeText}
                      onChange={(e) => setNewThemeText(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                        borderRadius: 6,
                        padding: '6px 8px',
                        color: theme.text,
                        fontSize: 12,
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: theme.text }}>
                  Preview
                </label>
                <div
                  style={{
                    background: newThemeBg,
                    border: `2px solid ${newThemeAccent}`,
                    borderRadius: 8,
                    padding: 16,
                    minHeight: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div
                    style={{
                      background: newThemeCard,
                      color: newThemeText,
                      padding: '8px 16px',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600
                    }}
                  >
                    Sample Text
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: window.innerWidth < 400 ? 'column' : 'row', gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => {
                    setShowColorPicker(false);
                    setEditingTheme(null);
                  }}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '14px',
                    color: theme.text,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveCustomTheme}
                  disabled={!newThemeName.trim()}
                  style={{
                    flex: 1,
                    background: newThemeName.trim() ? newThemeAccent : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '14px',
                    color: newThemeName.trim() ? getContrastColor(newThemeAccent) : theme.text,
                    cursor: newThemeName.trim() ? 'pointer' : 'not-allowed',
                    fontSize: 14,
                    fontWeight: 600,
                    opacity: newThemeName.trim() ? 1 : 0.5
                  }}
                >
                  {editingTheme ? 'Update Theme' : 'Save Theme'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cache Confirmation Modal */}
      {showClearCacheModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 20
          }}
          onClick={() => setShowClearCacheModal(false)}
        >
          <div
            style={{
              background: theme.card,
              borderRadius: 24,
              padding: 32,
              maxWidth: 450,
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 32 }}>⚠️</div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Clear All Cache?</h3>
            </div>
            <p style={{ color: getTextOpacity(theme, 0.7), marginBottom: 24, lineHeight: 1.6 }}>
              This action will permanently delete all your data, including:
            </p>
            <ul style={{ color: getTextOpacity(theme, 0.6), marginBottom: 24, marginLeft: 20, lineHeight: 1.8 }}>
              <li>All saved timers</li>
              <li>Timer history</li>
              <li>Custom themes</li>
              <li>Achievements and statistics</li>
              <li>All settings</li>
            </ul>
            <p style={{ color: getTextOpacity(theme, 0.7), marginBottom: 24, fontWeight: 500 }}>
              The app will reset to its initial state. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowClearCacheModal(false)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 12,
                  padding: 14,
                  color: theme.text,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                Cancel
              </button>
              <button
                onClick={clearAllCache}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 12,
                  padding: 14,
                  color: getContrastColor('#ef4444'),
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Theme Confirmation Modal */}
      {showDeleteThemeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 20
          }}
          onClick={() => setShowDeleteThemeModal(false)}
        >
          <div
            style={{
              background: theme.card,
              borderRadius: 20,
              padding: '24px',
              maxWidth: 400,
              width: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 28 }}>🗑️</div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Delete Theme?</h3>
            </div>
            <p style={{ color: getTextOpacity(theme, 0.7), marginBottom: 20, lineHeight: 1.5, fontSize: 14 }}>
              Are you sure you want to delete <strong style={{ color: theme.text }}>"{themeToDelete?.name}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  setShowDeleteThemeModal(false);
                  setThemeToDelete(null);
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px',
                  color: theme.text,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTheme(themeToDelete)}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px',
                  color: getContrastColor('#ef4444'),
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Delete Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container with Header and Content */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 12px' }}>
        
        {/* Top Header Bar with App Name and Icons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '20px 0 16px',
          position: 'sticky',
          top: 0,
          background: 'transparent',
          zIndex: 100
        }}>
          {/* App Name */}
          <h1 style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 600,
            color: theme.text,
            fontFamily: "'Courier New', 'Courier', monospace",
            letterSpacing: '0.05em'
          }}>
            Focus & Fit
          </h1>

          {/* Icon Buttons */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => setShowInfoModal(true)}
              style={{
                border: 'none',
                borderRadius: 10,
                padding: 10,
                color: theme.accent,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `${theme.accent}20`;
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'scale(1)';
              }}
              title="App Features"
            >
              <Info size={18} />
            </button>

            <button
              onClick={() => {
                setActiveMainTab('rooms');
                setActiveFeatureTab('achievements');
              }}
              style={{
                border: 'none',
                borderRadius: 10,
                padding: 10,
                color: theme.accent,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `${theme.accent}20`;
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'scale(1)';
              }}
              title="Achievements"
            >
              <Award size={18} />
            </button>

            <button
              onClick={() => setShowFeedbackModal(true)}
              style={{
                border: 'none',
                borderRadius: 10,
                padding: 10,
                color: theme.accent,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `${theme.accent}20`;
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'scale(1)';
              }}
              title="Send Feedback"
            >
              <Lightbulb size={18} />
            </button>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  padding: 10,
                  color: theme.text,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = `${theme.accent}20`;
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'scale(1)';
                }}
                title="Settings"
              >
                <Settings size={18} />
              </button>

              {/* Settings Dropdown */}
              {showSettings && (
                <div style={{
                  position: 'absolute',
                  top: 50,
                  right: 0,
              background: theme.card,
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 12,
              padding: settingsView === 'main' ? 4 : 8,
              minWidth: settingsView === 'main' ? 'auto' : 200,
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: settingsView === 'main' ? 2 : 4
            }} className={animationsEnabled ? 'animate-fade-in' : ''}>
              {settingsView === 'main' && (
                <>
                  {/* Theme Option */}
                  <button
                    onClick={() => setSettingsView('themes')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '40px',
                      minHeight: '40px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Themes"
                  >
                    <Palette size={18} />
                  </button>

                  {/* Sound Settings Option */}
                  <button
                    onClick={() => setSettingsView('sound')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '40px',
                      minHeight: '40px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Sound Settings"
                  >
                    {alarmVolume > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>

                  {/* Animation Settings Option */}
                  <button
                    onClick={() => setSettingsView('animations')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '40px',
                      minHeight: '40px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Animation Settings"
                  >
                    <Zap size={18} />
                  </button>

                  {/* Divider */}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '2px 0' }} />

                  {/* Export Data Option */}
                  <button
                    onClick={() => {
                      exportData();
                      setShowSettings(false);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '40px',
                      minHeight: '40px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    title="Export Data"
                  >
                    <Download size={18} />
                  </button>

                  {/* Import Data Option */}
                  <label style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 10px',
                    color: theme.text,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    margin: 0,
                    minWidth: '40px',
                    minHeight: '40px'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    title="Import Data"
                  >
                    <Upload size={18} />
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {/* Divider */}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '2px 0' }} />

                  {/* Clear Cache Option */}
                  <button
                    onClick={() => {
                      setShowClearCacheModal(true);
                      setShowSettings(false);
                      setSettingsView('main');
                    }}
                    style={{
                      background: 'rgba(255, 0, 0, 0.1)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: '#ff4444',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      minWidth: '40px',
                      minHeight: '40px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 0, 0, 0.15)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255, 0, 0, 0.1)'}
                    title="Clear Cache"
                  >
                    <Trash size={18} />
                  </button>
                </>
              )}

              {settingsView === 'themes' && (
                <>
                  {/* Header with Back, Edit, Delete, Add icons */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                    <button
                      onClick={() => setSettingsView('main')}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Back"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Edit Icon */}
                    <button
                      onClick={() => {
                        if (!theme.isDefault || theme.name !== 'Midnight') {
                          setEditingTheme(theme);
                          setNewThemeName(theme.name);
                          setNewThemeBg(theme.bg);
                          setNewThemeCard(theme.card);
                          setNewThemeAccent(theme.accent);
                          setNewThemeText(theme.text);
                          setShowColorPicker(true);
                          setShowSettings(false);
                        }
                      }}
                      disabled={theme.isDefault && theme.name === 'Midnight'}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: theme.isDefault && theme.name === 'Midnight' ? 'rgba(255,255,255,0.3)' : theme.text,
                        cursor: theme.isDefault && theme.name === 'Midnight' ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px',
                        opacity: theme.isDefault && theme.name === 'Midnight' ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => { if (!(theme.isDefault && theme.name === 'Midnight')) e.target.style.background = 'rgba(255,255,255,0.1)' }}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title={theme.isDefault && theme.name === 'Midnight' ? 'Midnight theme cannot be edited' : 'Edit Current Theme'}
                    >
                      <Edit size={18} />
                    </button>

                    {/* Delete Icon */}
                    <button
                      onClick={() => {
                        if (!(theme.isDefault && theme.name === 'Midnight')) {
                          setThemeToDelete(theme);
                          setShowDeleteThemeModal(true);
                        }
                      }}
                      disabled={theme.isDefault && theme.name === 'Midnight'}
                      style={{
                        background: (theme.isDefault && theme.name === 'Midnight') ? 'rgba(255,255,255,0.05)' : 'rgba(255, 0, 0, 0.1)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: (theme.isDefault && theme.name === 'Midnight') ? getTextOpacity(theme, 0.3) : '#ff4444',
                        cursor: (theme.isDefault && theme.name === 'Midnight') ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px',
                        opacity: (theme.isDefault && theme.name === 'Midnight') ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => { if (!(theme.isDefault && theme.name === 'Midnight')) e.target.style.background = 'rgba(255, 0, 0, 0.2)' }}
                      onMouseLeave={(e) => { if (!(theme.isDefault && theme.name === 'Midnight')) e.target.style.background = 'rgba(255, 0, 0, 0.1)' }}
                      title={(theme.isDefault && theme.name === 'Midnight') ? 'Midnight theme cannot be deleted' : 'Delete Current Theme'}
                    >
                      <Trash2 size={18} />
                    </button>

                    <div style={{ flex: 1 }} />

                    {/* Add New Theme Icon */}
                    <button
                      onClick={() => {
                        setEditingTheme(null);
                        setNewThemeName('');
                        setNewThemeBg('#000000');
                        setNewThemeCard('#1a1a1a');
                        setNewThemeAccent('#3b82f6');
                        setNewThemeText('#ffffff');
                        setShowColorPicker(true);
                        setShowSettings(false);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        color: theme.text,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '40px',
                        minHeight: '40px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                      title="Create New Theme"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Theme Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 6,
                    maxHeight: 300,
                    overflowY: 'auto',
                    padding: 4
                  }}>
                    {themes.map(t => (
                      <button
                        key={t.name}
                        onClick={() => {
                          setTheme(t);
                          setShowSettings(false);
                          setSettingsView('main');
                        }}
                        style={{
                          background: t.bg,
                          border: theme.name === t.name ? `2px solid ${t.accent}` : '2px solid transparent',
                          borderRadius: 8,
                          padding: 12,
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 600,
                          color: t.text,
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          position: 'relative',
                          minHeight: 48
                        }}
                      >
                        {t.name}
                        {theme.name === t.name && (
                          <div style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            color: t.accent,
                            fontSize: 14
                          }}>✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {settingsView === 'sound' && (
                <>
                  {/* Back Button */}
                  <button
                    onClick={() => setSettingsView('main')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 12px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      marginBottom: 8
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </button>

                  {/* Sound Type */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), display: 'block', marginBottom: 6 }}>Sound Type</label>
                    <select
                      value={alarmSoundType}
                      onChange={(e) => setAlarmSoundType(e.target.value)}
                      style={{ 
                        width: '100%', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: `1px solid ${getTextOpacity(theme, 0.1)}`, 
                        borderRadius: 8, 
                        padding: 8, 
                        color: theme.text, 
                        fontSize: 13, 
                        cursor: 'pointer' 
                      }}
                    >
                      <option value="bell" style={{ background: theme.card }}>🔔 Bell</option>
                      <option value="chime" style={{ background: theme.card }}>🎵 Chime</option>
                      <option value="silent" style={{ background: theme.card }}>🔇 Silent</option>
                    </select>
                  </div>

                  {/* Volume Control */}
                  <div>
                    <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), display: 'block', marginBottom: 6 }}>
                      Volume: {Math.round(alarmVolume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={alarmVolume}
                      onChange={(e) => setAlarmVolume(parseFloat(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Ambient Sound Type */}
                  <div style={{ marginTop: 16 }}>
                    <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), display: 'block', marginBottom: 6 }}>Ambient Sound</label>
                    <select
                      value={ambientSoundType}
                      onChange={(e) => setAmbientSoundType(e.target.value)}
                      style={{ 
                        width: '100%', 
                        background: 'rgba(255,255,255,0.05)', 
                        border: `1px solid ${getTextOpacity(theme, 0.1)}`, 
                        borderRadius: 8, 
                        padding: 8, 
                        color: theme.text, 
                        fontSize: 13, 
                        cursor: 'pointer' 
                      }}
                    >
                      {AMBIENT_SOUNDS.map(sound => (
                        <option key={sound.name} value={sound.name} style={{ background: theme.card }}>
                          {sound.name === 'AI Jazz' ? '🎷 AI Jazz' : sound.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ambient Volume Control */}
                  {ambientSoundType !== 'None' && (
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), display: 'block', marginBottom: 6 }}>
                        Ambient Volume: {Math.round(ambientVolume * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={ambientVolume}
                        onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer' }}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Animations Settings */}
              {settingsView === 'animations' && (
                <>
                  {/* Back Button */}
                  <button
                    onClick={() => setSettingsView('main')}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 12px',
                      color: theme.text,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 500,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      marginBottom: 4
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </button>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 11, color: getTextOpacity(theme, 0.5), display: 'block', marginBottom: 6 }}>Animations</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => setAnimationsEnabled(!animationsEnabled)}
                        style={{
                          background: animationsEnabled ? theme.accent : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                          borderRadius: 8,
                          padding: '8px 12px',
                          color: theme.text,
                          cursor: 'pointer',
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Zap size={14} color={animationsEnabled ? '#fff' : 'rgba(255,255,255,0.5)'} />
                        {animationsEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    <p style={{ fontSize: 11, color: getTextOpacity(theme, 0.4), marginTop: 6 }}>
                      Enable smooth animations for timer progress and transitions
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      </div>

      <div style={{ maxWidth: 600, margin: '20px auto 0', padding: '0' }}>

        {/* Primary Navigation Tabs - RESTRUCTURED */}
        {!isRunning && time === 0 && !isTransitioning && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: theme.card, borderRadius: 12, padding: 6 }}>
            {[
              { label: 'Focus Rooms', value: 'rooms', icon: Users },
              { label: 'Timer', value: 'timer', icon: Clock }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveMainTab(tab.value);
                  setActiveFeatureTab(null); // Clear feature tab when switching main tabs
                }}
                style={{
                  flex: 1,
                  background: activeMainTab === tab.value ? theme.accent : 'transparent',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 6px',
                  color: activeMainTab === tab.value ? getContrastColor(theme.accent) : theme.text,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.2s'
                }}
              >
                <tab.icon className="tab-icon" size={16} />
                <span className="tab-label" style={{ marginTop: 4, fontSize: 11 }}>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Secondary Navigation Tabs - Timer Sub-tabs */}
        {!isRunning && time === 0 && !isTransitioning && activeMainTab === 'timer' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
            {[
              { label: 'Interval', value: 'interval', icon: Zap },
              { label: 'TimerBlocks', value: 'timerblocks', icon: Clock },
              { label: 'Stopwatch', value: 'stopwatch', icon: RotateCcw },
              { label: 'Composite', value: 'composite', icon: ChevronRight }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveFeatureTab(tab.value);
                  if (tab.value === 'composite') {
                    setMode('sequence');
                    setShowBuilder(true);
                  } else {
                    setMode(tab.value);
                  }
                }}
                title={tab.label}
                style={{
                  background: activeFeatureTab === tab.value ? theme.accent : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                  borderRadius: 10,
                  padding: 10,
                  color: activeFeatureTab === tab.value ? getContrastColor(theme.accent) : getTextOpacity(theme, 0.6),
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <tab.icon className="tab-icon" size={18} />
                <span className="tab-label" style={{ marginLeft: 8, fontSize: 13 }}>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Secondary Navigation Tabs - Other Features */}
        {!isRunning && time === 0 && !isTransitioning && activeMainTab !== 'timer' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto' }}>
            {activeMainTab === 'rooms' && [].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveFeatureTab(activeFeatureTab === tab.value ? null : tab.value)}
                style={{
                  flex: 1,
                  background: activeFeatureTab === tab.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: `1px solid ${getTextOpacity(theme, 0.1)}`,
                  borderRadius: 10,
                  padding: '8px 10px',
                  color: activeFeatureTab === tab.value ? getContrastColor(theme.accent) : getTextOpacity(theme, 0.6),
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <tab.icon className="tab-icon" size={14} />
                <span className="tab-label" style={{ marginLeft: 8, fontSize: 11 }}>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Active Now Indicator - Only show in Focus Rooms tab */}
        {activeMainTab === 'rooms' && (
          <div style={{ textAlign: 'center', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s ease-in-out infinite' }} />
            <div style={{ fontSize: 14, color: getTextOpacity(theme, 0.7) }}>
              <span style={{ fontWeight: 600, color: theme.accent }}>{activeUsers}</span> people getting focused right now
            </div>
          </div>
        )}

        {(isRunning || time > 0 || isTransitioning) && (
          <>
            {activeScene !== 'none' && SCENES[activeScene] && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
                borderRadius: 12,
                padding: '12px 20px',
                marginBottom: 16,
                textAlign: 'center',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                margin: '0 auto 16px',
                border: `1px solid ${SCENES[activeScene].accent}40`,
                transition: 'all 0.5s ease-in-out',
                opacity: isTransitioning ? 0.5 : 1
              }}>
                <span style={{ fontSize: 24 }}>{SCENES[activeScene].emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: SCENES[activeScene].accent }}>
                    {SCENES[activeScene].name}
                  </div>
                  <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.5) }}>
                    Immersive scene active
                  </div>
                </div>
              </div>
            )}
            <div style={{ background: theme.card, borderRadius: 10, padding: '15px', marginBottom: 32, textAlign: 'center', position: 'relative', display: 'flex', gap: 32, alignItems: 'center', flexDirection: 'column' }}>
            {mode === 'sequence' && sequence.length > 0 && (
              <div style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {sequence.map((step, idx) => (
                  <React.Fragment key={idx}>
                    <div style={{ width: idx === currentStep ? 16 : 12, height: idx === currentStep ? 16 : 12, borderRadius: '50%', background: idx === currentStep ? step.color : idx < currentStep ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', border: idx === currentStep ? `3px solid ${step.color}40` : 'none', transition: 'all 0.3s', boxShadow: idx === currentStep ? `0 0 20px ${step.color}60` : 'none', margin: '0 auto' }} />
                    {idx < sequence.length - 1 && <div style={{ width: 2, height: 16, background: idx < currentStep ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)', margin: '0 auto' }} />}
                  </React.Fragment>
                ))}
              </div>
            )}
            <div style={{ flex: 1, marginLeft: mode === 'sequence' ? 40 : 0, marginRight: mode === 'sequence' ? 40 : 0, width: '100%' }}>
              {mode === 'sequence' && sequence[currentStep] && <div style={{ fontSize: 16, color: sequence[currentStep].color, marginBottom: 12, fontWeight: 600 }}>{sequence[currentStep].name}</div>}
              <div style={{ fontSize: 72, fontWeight: 700, marginBottom: (mode === 'interval' || mode === 'sequence') ? 0 : 24, color: showWarning ? '#ef4444' : 'white', animation: showWarning ? 'pulseTimer 1s ease-in-out infinite' : 'none', filter: showCritical ? 'drop-shadow(0 0 30px #ef4444)' : 'none' }}>{formatTime(time)}</div>
              
              {(mode === 'interval' || mode === 'sequence') && calculateTotalRemaining() > 0 && (
                  <div style={{ fontSize: 14, color: getTextOpacity(theme, 0.5), marginBottom: 24, marginTop: 4 }}>
                      Total Remaining: {formatTime(calculateTotalRemaining())}
                  </div>
              )}

              {mode === 'interval' && <div style={{ fontSize: 14, color: getTextOpacity(theme, 0.6), marginBottom: 24 }}>Round {currentRound}/{rounds} • {isWork ? '💪 Work' : '😌 Rest'}</div>}
              {mode === 'sequence' && <div style={{ fontSize: 14, color: getTextOpacity(theme, 0.6), marginBottom: 24 }}>Step {currentStep + 1} of {sequence.length}{currentStep < sequence.length - 1 && <div style={{ marginTop: 8 }}>Next: {sequence[currentStep + 1].name}</div>}</div>}
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => { 
                  const newRunningState = !isRunning;
                  setIsRunning(newRunningState); 
                  if (newRunningState && ambientSoundType !== 'None') {
                    // Start ambient sound when timer starts
                    const soundFile = AMBIENT_SOUNDS.find(s => s.name === ambientSoundType)?.file;
                    if (soundFile) startAmbient(soundFile);
                  } else if (!newRunningState) {
                    // Stop ambient sound when timer pauses
                    stopAmbient();
                  }
                }} style={{ background: theme.accent, border: 'none', borderRadius: 16, padding: '16px 32px', color: getContrastColor(theme.accent), cursor: 'pointer', fontSize: 16, fontWeight: 600, display: 'flex', gap: 8, transition: animationsEnabled ? 'all 0.1s ease' : 'none' }} className={animationsEnabled ? 'animate-button-press' : ''}><span style={{ display: 'flex', alignItems: 'center' }}>{isRunning ? <Pause size={20} /> : <Play size={20} />}{isRunning ? 'Pause' : 'Start'}</span></button>
                <button onClick={() => { 
                  setIsRunning(false); 
                  setTime(0); 
                  setCurrentStep(0);
                  // Stop ambient sound when timer resets
                  stopAmbient();
                }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 16, padding: '16px 24px', color: theme.text, cursor: 'pointer', fontSize: 16, fontWeight: 600, display: 'flex', gap: 8, transition: animationsEnabled ? 'all 0.1s ease' : 'none' }} className={animationsEnabled ? 'animate-button-press' : ''}><span style={{ display: 'flex', alignItems: 'center' }}><RotateCcw size={20} />Reset</span></button>
                {mode !== 'stopwatch' && (
                  <button onClick={() => setRepeatEnabled(!repeatEnabled)} style={{ background: repeatEnabled ? theme.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 16, padding: '16px 24px', color: repeatEnabled ? getContrastColor(theme.accent) : theme.text, cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', gap: 8, transition: animationsEnabled ? 'all 0.1s ease' : 'none' }} className={animationsEnabled ? 'animate-button-press' : ''}><span style={{ display: 'flex', alignItems: 'center' }}><Repeat size={18} />{repeatEnabled ? 'ON' : 'OFF'}</span></button>
                )}
              </div>
            </div>
            {mode === 'sequence' && sequence.length > 0 && (
              <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 120 }}>
                {sequence.map((step, idx) => <div key={idx} style={{ fontSize: 11, color: idx === currentStep ? step.color : idx < currentStep ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)', fontWeight: idx === currentStep ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{step.name}</div>)}
              </div>
            )}
          </div>
          </>
        )}

        {!isRunning && time === 0 && !isTransitioning && (
          <>
            {/* Interval Tab Content */}
            {activeMainTab === 'interval' && !activeFeatureTab && (
              <IntervalPanel
                theme={theme}
                work={work}
                rest={rest}
                rounds={rounds}
                setWork={setWork}
                setRest={setRest}
                setRounds={setRounds}
                startInterval={startInterval}
                shareCurrentTimer={shareCurrentTimer}
              />
            )}

            {/* Composite Tab Content */}
            {activeMainTab === 'composite' && !activeFeatureTab && (
              <CompositePanel
                theme={theme}
                showBuilder={showBuilder}
                setShowBuilder={setShowBuilder}
                seqName={seqName}
                setSeqName={setSeqName}
                sequence={sequence}
                setSequence={setSequence}
                moveSequenceStep={moveSequenceStep}
                startSequence={startSequence}
                saveSequence={saveSequence}
                inputStyle={inputStyle}
              />
            )}

            {/* Composite Panel for Composite tab - moved upwards */}
            {activeMainTab === 'timer' && activeFeatureTab === 'composite' && (
              <CompositePanel
                theme={theme}
                showBuilder={showBuilder}
                setShowBuilder={setShowBuilder}
                seqName={seqName}
                setSeqName={setSeqName}
                sequence={sequence}
                setSequence={setSequence}
                moveSequenceStep={moveSequenceStep}
                startSequence={startSequence}
                saveSequence={saveSequence}
                inputStyle={inputStyle}
              />
            )}

            {/* Your Timers Section - Shows only on TimerBlocks and Composite tabs */}
            {activeMainTab === 'timer' && (activeFeatureTab === 'timerblocks' || activeFeatureTab === 'composite') && (
              <div style={{ background: theme.card, borderRadius: 10, padding: 15, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <h2 style={{ fontSize: 18, margin: 0 }}>Your Timers</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setCollapsedGroups({})}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        color: getTextOpacity(theme, 0.6),
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                      title="Expand All"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      onClick={() => {
                        const allGroups = {};
                        groups.forEach(g => { allGroups[g] = true; });
                        setCollapsedGroups(allGroups);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        color: getTextOpacity(theme, 0.6),
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                      title="Collapse All"
                    >
                      <ChevronUp size={14} />
                    </button>
                    {activeMainTab === 'timer' && (
                      <button onClick={() => setShowCreateTimer(!showCreateTimer)} style={{ background: theme.accent, border: 'none', borderRadius: 8, padding: '8px 16px', color: getContrastColor(theme.accent), cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', gap: 6 }}><Plus size={16} />Create</button>
                    )}
                  </div>
                </div>

              {showCreateTimer && (
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                  <input type="text" placeholder="Timer name" value={newTimerName} onChange={(e) => setNewTimerName(e.target.value)} style={{ ...inputStyle(theme.accent, theme.text, getTextOpacity(theme, 0.1)), marginBottom: 12 }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }} className="grid-col-sm-3-to-1">
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="number"
                        placeholder={newTimerUnit === 'min' ? 'Minutes' : 'Seconds'}
                        value={newTimerMin}
                        onChange={(e) => setNewTimerMin(Math.max(0, parseInt(e.target.value) || 0))}
                        style={inputStyle(theme.accent, theme.text, getTextOpacity(theme, 0.1))}
                      />
                      <select
                        value={newTimerUnit}
                        onChange={(e) => setNewTimerUnit(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${getTextOpacity(theme, 0.1)}`, borderRadius: 8, padding: 12, color: theme.text, fontSize: 14, cursor: 'pointer' }}
                      >
                        <option value="min" style={{ background: theme.card }}>Min</option>
                        <option value="sec" style={{ background: theme.card }}>Sec</option>
                      </select>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input type="text" placeholder="Group" value={newTimerGroup} onChange={(e) => setNewTimerGroup(e.target.value)} onFocus={() => setShowGroupDropdown(true)} onBlur={() => setTimeout(() => setShowGroupDropdown(false), 200)} style={inputStyle(theme.accent, theme.text, getTextOpacity(theme, 0.1))} />
                      {showGroupDropdown && groups.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: theme.card, border: `1px solid ${getTextOpacity(theme, 0.1)}`, borderRadius: 8, maxHeight: 150, overflowY: 'auto', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                          {filteredGroups.map(g => (
                            <button key={g} onClick={() => { setNewTimerGroup(g); setShowGroupDropdown(false); }} style={{ width: '100%', background: 'transparent', border: 'none', padding: '10px 12px', color: theme.text, textAlign: 'left', cursor: 'pointer', fontSize: 14 }} onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>{g}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto', paddingBottom: 8 }}>
                    {colorOptions.map(color => <button key={color} onClick={() => setNewTimerColor(color)} style={{ minWidth: 40, height: 40, borderRadius: 8, background: color, border: newTimerColor === color ? '3px solid white' : 'none', cursor: 'pointer', flexShrink: 0 }} />)}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: getTextOpacity(theme, 0.6), marginBottom: 8, display: 'block' }}>Immersive Scene (Optional)</label>
                    <select value={newTimerScene} onChange={(e) => setNewTimerScene(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${getTextOpacity(theme, 0.1)}`, borderRadius: 8, padding: 12, color: theme.text, fontSize: 14, cursor: 'pointer' }}>
                      {Object.entries(SCENES).map(([key, scene]) => (
                        <option key={key} value={key} style={{ background: theme.card }}>
                          {scene.emoji} {scene.name}
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.4), marginTop: 6 }}>
                      {SCENES[newTimerScene].description || 'No immersive background'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={createTimer} disabled={!newTimerName || !newTimerMin} style={{ flex: 1, background: newTimerName && newTimerMin ? theme.accent : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 12, color: theme.text, cursor: newTimerName && newTimerMin ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600, opacity: newTimerName && newTimerMin ? 1 : 0.5 }}>
                      <Save size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Create Timer
                    </button>
                    <button onClick={cancelCreateTimer} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: `1px solid ${getTextOpacity(theme, 0.1)}`, borderRadius: 8, padding: 12, color: getTextOpacity(theme, 0.6), cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                      <X size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />Cancel
                    </button>
                  </div>
                </div>
              )}

              {groups.map(group => {
                const groupTimers = saved.filter(t => t.group === group);
                if (groupTimers.length === 0) return null;
                const isCollapsed = collapsedGroups[group];
                return (
                  <div key={group} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: isCollapsed ? 0 : 12,
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }))}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isCollapsed ? <ChevronRight size={16} color={theme.accent} /> : <ChevronDown size={16} color={theme.accent} />}
                        <div style={{ fontSize: 12, fontWeight: 600, color: getTextOpacity(theme, 0.7), textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {group} ({groupTimers.length})
                        </div>
                      </div>
                      {group !== 'Sequences' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            shareTimerGroup(group);
                          }}
                          style={{
                            border: 'none',
                            borderRadius: 10,
                            padding: 8,
                            color: theme.accent,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${theme.accent}20`;
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title="Share Group"
                        >
                          <Share size={16} />
                        </button>
                      )}
                    </div>
                    {!isCollapsed && groupTimers.map((timer) => (
                      <div key={timer.name} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${getTextOpacity(theme, 0.1)}`, borderRadius: 16, padding: 20, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ width: 6, height: 40, borderRadius: 3, background: timer.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {timer.name}
                            {timer.scene && timer.scene !== 'none' && SCENES[timer.scene] && (
                              <span style={{ fontSize: 16 }} title={SCENES[timer.scene].name}>{SCENES[timer.scene].emoji}</span>
                            )}
                          </div>
                          <div style={{ fontSize: 14, color: getTextOpacity(theme, 0.5) }}>
                            {timer.isSequence ? `${timer.min} min • ${timer.steps.length} steps` : `${timer.duration} ${timer.unit}`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginTop: window.innerWidth <= 480 ? 8 : 0 }}>
                          {activeFeatureTab === 'composite' && !timer.isSequence && <button onClick={() => setSequence(prev => [...prev, timer])} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '8px 12px', color: theme.text, cursor: 'pointer' }}><Plus size={16} /></button>}
                          <button onClick={() => timer.isSequence ? (setSequence(timer.steps), startSequence()) : startTimer(timer.duration * (timer.unit === 'min' ? 60 : 1), timer.scene || 'none')} style={{ background: theme.accent, border: 'none', borderRadius: 8, padding: '8px 12px', color: getContrastColor(theme.accent), cursor: 'pointer' }}><Play size={16} /></button>
                          <button onClick={() => confirmDelete(timer)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: '8px 12px', color: getTextOpacity(theme, 0.5), cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            )}

            {/* Main Content - Suspense Boundary for Lazy-Loaded Components */}
            <Suspense fallback={<LazyLoadingFallback theme={theme} />}>
              {/* Focus Rooms Main Tab */}
              {activeMainTab === 'rooms' && !activeFeatureTab && (
                <FocusRoomsPanel
                  theme={theme}
                  currentRoom={currentRoom}
                  rooms={rooms}
                  roomsLoading={roomsLoading}
                  messages={messages}
                  showRoomSettings={showRoomSettings}
                  showRoomExpirationModal={showRoomExpirationModal}
                  calendarExportRoom={calendarExportRoom}
                  chatInputRef={chatInputRef}
                  handleJoinRoom={handleJoinRoom}
                  leaveRoom={leaveRoom}
                  deleteRoom={deleteRoom}
                  setShowRoomSettings={setShowRoomSettings}
                  setCalendarExportRoom={setCalendarExportRoom}
                  handleSaveRoomSettings={handleSaveRoomSettings}
                  sendMessage={sendMessage}
                  startRoomTimer={startRoomTimer}
                  handleExtendTimer={handleExtendTimer}
                  handleCloseRoom={handleCloseRoom}
                  handleExportToICS={handleExportToICS}
                  handleExportToGoogleCalendar={handleExportToGoogleCalendar}
                  handleShareRoomLink={handleShareRoomLink}
                  formatTime={formatTime}
                  getParticipantCount={getParticipantCount}
                  isRoomFull={isRoomFull}
                  setShowCreateRoomModal={setShowCreateRoomModal}
                />
              )}

              {/* Timer Main Tab - Show selected timer type */}
              {activeMainTab === 'timer' && !activeFeatureTab && (
                <TimerPanel
                  theme={theme}
                  time={time}
                  initialTime={initialTime}
                  isRunning={isRunning}
                  mode={mode}
                  work={work}
                  rest={rest}
                  rounds={rounds}
                  inputHours={inputHours}
                  inputMinutes={inputMinutes}
                  inputSeconds={inputSeconds}
                  setInputHours={setInputHours}
                  setInputMinutes={setInputMinutes}
                  setInputSeconds={setInputSeconds}
                  setInitialTime={setInitialTime}
                  setWork={setWork}
                  setRest={setRest}
                  setRounds={setRounds}
                  startTimer={startTimer}
                  pauseTimer={pauseTimer}
                  resetTimer={resetTimer}
                  formatTime={formatTime}
                  savedTimers={saved}
                  setSavedTimers={setSaved}
                  collapsedGroups={collapsedGroups}
                  setCollapsedGroups={setCollapsedGroups}
                  confirmDelete={confirmDelete}
                  activeScene={activeScene}
                  setActiveScene={setActiveScene}
                  SCENES={SCENES}
                  showBuilder={showBuilder}
                  setShowBuilder={setShowBuilder}
                  sequence={sequence}
                  setSequence={setSequence}
                  startSequence={startSequence}
                  activeMainTab={activeMainTab}
                />
              )}

              {/* Timer Feature Tabs */}
              {activeMainTab === 'timer' && activeFeatureTab === 'interval' && (
                <IntervalPanel
                  theme={theme}
                  time={time}
                  isRunning={isRunning}
                  work={work}
                  rest={rest}
                  rounds={rounds}
                  setWork={setWork}
                  setRest={setRest}
                  setRounds={setRounds}
                  startInterval={startInterval}
                  pauseTimer={pauseTimer}
                  resetTimer={resetTimer}
                  formatTime={formatTime}
                  activeScene={activeScene}
                  setActiveScene={setActiveScene}
                  SCENES={SCENES}
                />
              )}

              {/* Feature Tabs for Rooms */}
              {activeMainTab === 'rooms' && activeFeatureTab === 'achievements' && (
                <AchievementsPanel
                  theme={theme}
                  ACHIEVEMENTS={ACHIEVEMENTS}
                  achievements={achievements}
                  getSmartSuggestions={getSmartSuggestions}
                  dailyChallenge={dailyChallenge}
                  timeCapsules={timeCapsules}
                  showCapsuleInput={showCapsuleInput}
                  capsuleMessage={capsuleMessage}
                  history={history}
                  setShowCapsuleInput={setShowCapsuleInput}
                  setCapsuleMessage={setCapsuleMessage}
                  createTimeCapsule={createTimeCapsule}
                  exportData={exportData}
                  importData={importData}
                  formatDate={formatDate}
                />
              )}

              {activeMainTab === 'timer' && activeFeatureTab === 'stopwatch' && (
                <div style={{ background: theme.card, borderRadius: 10, padding: 15, marginBottom: 24 }}>
                  <h2 style={{ fontSize: 18, margin: 0, marginBottom: 16 }}>Stopwatch</h2>
                  <div style={{ textAlign: 'center', fontSize: 48, fontWeight: 300, marginBottom: 24 }}>
                    {formatTime(time)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                    <button onClick={startStopwatch} disabled={isRunning} style={{ background: isRunning ? 'rgba(255,255,255,0.1)' : theme.accent, border: 'none', borderRadius: 12, padding: '16px 32px', color: isRunning ? theme.text : getContrastColor(theme.accent), cursor: isRunning ? 'not-allowed' : 'pointer', fontSize: 16 }}>
                      <Play size={20} />
                    </button>
                    <button onClick={pauseStopwatch} disabled={!isRunning} style={{ background: !isRunning ? 'rgba(255,255,255,0.1)' : '#f59e0b', border: 'none', borderRadius: 12, padding: '16px 32px', color: !isRunning ? theme.text : getContrastColor('#f59e0b'), cursor: !isRunning ? 'not-allowed' : 'pointer', fontSize: 16 }}>
                      <Pause size={20} />
                    </button>
                    <button onClick={resetStopwatch} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, padding: '16px 32px', color: theme.text, cursor: 'pointer', fontSize: 16 }}>
                      <RotateCcw size={20} />
                    </button>
                  </div>
                </div>
              )}

              {activeMainTab === 'timer' && activeFeatureTab === 'achievements' && (
                <AchievementsPanel theme={theme} formatDate={formatDate} />
              )}
            </Suspense>
          </>
        )}
{/* Room Template Selector Modal */}
        {showTemplateSelector && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: 20,
            overflowY: 'auto'
          }}>
            <div style={{
              background: theme.bg,
              borderRadius: 24,
              width: '100%',
              maxWidth: 1200,
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}>
              {/* Close Button */}
              <button
                onClick={() => setShowTemplateSelector(false)}
                style={{
                  position: 'sticky',
                  top: 20,
                  right: 20,
                  float: 'right',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 8,
                  padding: 8,
                  color: getTextOpacity(theme, 0.6),
                  cursor: 'pointer',
                  fontSize: 20,
                  zIndex: 10
                }}
              >
                ✕
              </button>

              <Suspense fallback={<LazyLoadingFallback theme={theme} />}>
                <RoomTemplateSelector
                  theme={theme}
                  onSelectTemplate={handleSelectTemplate}
                  onSkip={() => setShowTemplateSelector(false)}
                />
              </Suspense>

              <>
                {selectedTemplate && (
                  <div style={{ padding: 20, borderTop: `1px solid rgba(255,255,255,0.1)`, textAlign: 'center', background: theme.card }}>
                    <button
                      onClick={handleCreateRoomFromTemplate}
                      style={{
                        background: theme.accent,
                        color: '#000',
                        border: 'none',
                        borderRadius: 12,
                        padding: '12px 24px',
                        cursor: 'pointer',
                        fontSize: 16,
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      Create Room from {selectedTemplate.name}
                    </button>
                  </div>
                )}
              </>
            </div> {/* This div closes the main content container (the one with maxWidth: 600) */}
            </div>
        )}
        </div>
      </ToastProvider>
      </ModalProvider>
    </div>
  );
  
  }