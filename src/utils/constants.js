// Theme configurations
export const THEMES = [
  { name: "Midnight", bg: "#000000", card: "#1a1a1a", accent: "#3b82f6" },
  { name: "Ocean", bg: "#0a1929", card: "#1e3a5f", accent: "#06b6d4" },
  { name: "Forest", bg: "#064e3b", card: "#065f46", accent: "#10b981" },
  { name: "Purple", bg: "#1e1b4b", card: "#312e81", accent: "#8b5cf6" },
  { name: "Warm Grey", bg: "#262626", card: "#3f3f46", accent: "#fde047" },
  { name: "Crimson Sunset", bg: "#220000", card: "#4d0000", accent: "#ff4500" }
];

// Ambient sound configurations
export const AMBIENT_SOUNDS = [
  { name: "None", file: null },
  { name: "Jazz Guitar - Ambient", file: "/sounds/jazz-guitar-ambient.wav" },
  { name: "Jazz Guitar - Smooth", file: "/sounds/jazz-guitar-smooth.wav" },
  { name: "Jazz Guitar - Blues", file: "/sounds/jazz-guitar-blues.wav" },
  { name: "Jazz Piano - Chords", file: "/sounds/jazz-piano-chords.wav" },
  { name: "Jazz Piano - Relaxing", file: "/sounds/jazz-piano-relaxing.wav" },
  { name: "Jazz Piano - Lo-fi", file: "/sounds/jazz-piano-lofi.wav" },
  { name: "Violin - Ambient Strings", file: "/sounds/violin-strings-ambient.wav" },
  { name: "Violin - Sad Loop", file: "/sounds/violin-sad-loop.wav" }
];

// Sound file paths
export const COUNTDOWN_NOISE_SOUND = "/sounds/beep.mp3";

// Default saved timers
export const DEFAULT_SAVED_TIMERS = [
  { name: "Pomodoro", duration: 25, unit: "min", min: 25, color: "#ef4444", group: "Work" },
  { name: "Short Break", duration: 5, unit: "min", min: 5, color: "#10b981", group: "Work" },
  { name: "Deep Work", duration: 50, unit: "min", min: 50, color: "#8b5cf6", group: "Work" },
  { name: "Workout", duration: 30, unit: "min", min: 30, color: "#f59e0b", group: "Fitness" }
];

// Color options for timer creation
export const COLOR_OPTIONS = [
  '#ef4444', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'
];

// Timer modes
export const TIMER_MODES = {
  TIMER: 'timer',
  STOPWATCH: 'stopwatch',
  INTERVAL: 'interval',
  SEQUENCE: 'sequence'
};

// Storage keys
export const STORAGE_KEYS = {
  THEME: 'selectedThemeName',
  SAVED_TIMERS: 'savedTimers',
  HISTORY: 'timerHistory',
  REPEAT_ENABLED: 'repeatEnabled',
  ALARM_SOUND_TYPE: 'alarmSoundType',
  ALARM_VOLUME: 'alarmVolume',
  AMBIENT_SOUND_TYPE: 'ambientSoundType',
  AMBIENT_VOLUME: 'ambientVolume',
  COUNTDOWN_NOISE: 'playCountdownNoise',
  WORK_LABEL: 'intervalWorkLabel',
  REST_LABEL: 'intervalRestLabel',
  CURRENT_STREAK: 'currentStreak',
  LAST_COMPLETION_DATE: 'lastCompletionDate',
  ACHIEVEMENTS: 'achievements',
  STORAGE_VERSION: 'storageVersion'
};

// Data version for migrations
export const STORAGE_VERSION = '2.0';

// Timer limits
export const LIMITS = {
  MAX_HISTORY: 10,
  MAX_RECENT_TIMERS: 5,
  MAX_SEQUENCE_STEPS: 20,
  MIN_TIMER_SECONDS: 1,
  MAX_TIMER_HOURS: 24,
  COUNTDOWN_START: 10,
  WARNING_THRESHOLD: 10,
  CRITICAL_THRESHOLD: 5
};

// Haptic patterns
export const HAPTIC_PATTERNS = {
  LIGHT: 20,
  MEDIUM: 50,
  HEAVY: 100,
  SUCCESS: [100, 50, 100]
};

// Animation durations (seconds)
export const ANIMATION_DURATIONS = {
  CONFETTI_DEFAULT: 5,
  CONFETTI_SEQUENCE: 8,
  TOAST: 3000,
  MODAL_TRANSITION: 300
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440
};

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_COMPLETION: {
    id: 'firstCompletion',
    name: 'First Completion',
    description: 'Complete your first timer'
  },
  WEEK_STREAK: {
    id: 'weekStreak',
    name: '7-Day Streak',
    description: 'Complete timers for 7 consecutive days'
  },
  MONTH_STREAK: {
    id: 'monthStreak',
    name: '30-Day Streak',
    description: 'Complete timers for 30 consecutive days'
  },
  CENTURY: {
    id: 'century',
    name: 'Century',
    description: 'Complete 100 timers'
  }
};