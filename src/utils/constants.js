// Theme configurations
export const THEMES = [
  { name: "Midnight", bg: "#000000", card: "#1a1a1a", accent: "#3b82f6" },
  { name: "Ocean", bg: "#0a1929", card: "#1e3a5f", accent: "#06b6d4" },
  { name: "Forest", bg: "#064e3b", card: "#065f46", accent: "#10b981" },
  { name: "Purple", bg: "#1e1b4b", card: "#312e81", accent: "#8b5cf6" },
  { name: "Warm Grey", bg: "#262626", card: "#3f3f46", accent: "#fde047" },
  { name: "Crimson Sunset", bg: "#220000", card: "#4d0000", accent: "#ff4500" },
  { name: "Easter", bg: "#fdf2f8", card: "#fce7f3", accent: "#f472b6", text: "#831843" }, // Pink/Pastel
  { name: "Christmas", bg: "#022c22", card: "#064e3b", accent: "#ef4444" }, // Dark Green/Red
  { name: "Summer", bg: "#fff7ed", card: "#ffedd5", accent: "#f97316", text: "#7c2d12" }, // Orange/Warm
  { name: "Holiday", bg: "#422006", card: "#713f12", accent: "#eab308" }, // Brown/Gold
  { name: "Winter Holiday", bg: "#172554", card: "#1e3a8a", accent: "#60a5fa" }, // Deep Blue/Ice
  { name: "Spring", bg: "#f0fdf4", card: "#dcfce7", accent: "#22c55e", text: "#14532d" }, // Light Green
  { name: "Autumn", bg: "#451a03", card: "#78350f", accent: "#d97706" }, // Brown/Orange
  
  // Professional/Business Themes
  { name: "Corporate Blue", bg: "#f8fafc", card: "#ffffff", accent: "#1e40af", text: "#1e293b" }, // Clean blue & white - sharp corners for professional look
  { name: "Executive Grey", bg: "#f1f5f9", card: "#ffffff", accent: "#334155", text: "#0f172a" }, // Professional grey scale - slightly rounded
  
  // Cultural Themes
  { name: "Japanese", bg: "#1a0808", card: "#2d0f0f", accent: "#dc2626", text: "#fef2f2",    }, // Deep red & black
  { name: "Sakura", bg: "#fdf2f8", card: "#fce7f3", accent: "#ec4899", text: "#831843" }, // Cherry blossom pink
  { name: "Indian Festival", bg: "#451a03", card: "#78350f", accent: "#f59e0b", text: "#fef3c7" }, // Saffron & gold
  { name: "Turkish", bg: "#7f1d1d", card: "#991b1b", accent: "#fef3c7", text: "#fef3c7" }, // Turkish red & gold
  { name: "Arabian Nights", bg: "#1e1b4b", card: "#312e81", accent: "#fbbf24", text: "#fef3c7" }, // Deep blue & gold
  { name: "Mediterranean", bg: "#0c4a6e", card: "#075985", accent: "#fcd34d", text: "#fef3c7" }, // Aegean blue
  { name: "African Sunset", bg: "#450a0a", card: "#7f1d1d", accent: "#fb923c", text: "#fed7aa" }, // Warm earth tones
  { name: "Nordic Ice", bg: "#0c4a6e", card: "#075985", accent: "#67e8f9", text: "#cffafe" }, // Ice blue
  { name: "Celtic Green", bg: "#14532d", card: "#166534", accent: "#86efac", text: "#f0fdf4" }, // Irish green
  { name: "Mexican Fiesta", bg: "#7c2d12", card: "#9a3412", accent: "#fbbf24", text: "#fef3c7" }, // Terracotta & gold
  { name: "Brazilian Carnival", bg: "#4d0f4d", card: "#6b216b", accent: "#fcd34d", text: "#fef3c7" }, // Purple & gold
  { name: "Chinese Red", bg: "#450a0a", card: "#7f1d1d", accent: "#fbbf24", text: "#fef3c7" }, // Lucky red & gold
  { name: "Korean Hanbok", bg: "#fdf2f8", card: "#fce7f3", accent: "#ec4899", text: "#831843" }, // Pastel pink
  { name: "Thai Temple", bg: "#451a03", card: "#78350f", accent: "#fbbf24", text: "#fef3c7" }, // Gold & brown
  { name: "Indonesian Batik", bg: "#422006", card: "#713f12", accent: "#0891b2", text: "#cffafe" }, // Brown & teal
  { name: "Moroccan Spice", bg: "#7c2d12", card: "#9a3412", accent: "#fb923c", text: "#fed7aa" }, // Spice colors
  { name: "Egyptian Gold", bg: "#1e1b4b", card: "#312e81", accent: "#fbbf24", text: "#fef3c7"  }, // Royal blue & gold
  { name: "Greek Island", bg: "#f0f9ff", card: "#e0f2fe", accent: "#0284c7", text: "#075985" }, // White & blue
  
  // City-Inspired Themes
  { name: "Tokyo Neon", bg: "#0a0a0a", card: "#1a1a1a", accent: "#ff0080", text: "#f0f0f0"  }, // Cyberpunk neon pink
  { name: "New York City", bg: "#1a1a1a", card: "#2d2d2d", accent: "#fbbf24", text: "#f5f5f5" }, // Urban yellow taxi - sharp corners
  { name: "Paris Elegance", bg: "#f8f6f0", card: "#ffffff", accent: "#1e3a8a", text: "#1e293b" }, // French blue elegance
  { name: "London Fog", bg: "#3f3f46", card: "#52525b", accent: "#dc2626", text: "#f5f5f5"  }, // British grey & red
  { name: "Dubai Gold", bg: "#7c2d12", card: "#9a3412", accent: "#fbbf24", text: "#fef3c7" }, // Luxurious gold
  { name: "Amsterdam Canal", bg: "#0c4a6e", card: "#075985", accent: "#fb923c", text: "#f0f9ff" }, // Canal blue & orange
  { name: "Singapore Garden", bg: "#14532d", card: "#166534", accent: "#86efac", text: "#f0fdf4" }, // Garden city green
  { name: "Sydney Beach", bg: "#0ea5e9", card: "#38bdf8", accent: "#fbbf24", text: "#0c4a6e" }, // Beach blue & sand
  { name: "Rio Colors", bg: "#fef3c7", card: "#fde68a", accent: "#16a34a", text: "#14532d" }, // Brazilian yellow & green
  { name: "Mumbai Spice", bg: "#7c2d12", card: "#9a3412", accent: "#fb923c", text: "#fed7aa"  }, // Spice market colors
  { name: "Moscow Winter", bg: "#f0f9ff", card: "#e0f2fe", accent: "#dc2626", text: "#1e293b" }, // Snow white & Russian red
  { name: "Istanbul Bazaar", bg: "#450a0a", card: "#7f1d1d", accent: "#fbbf24", text: "#fef3c7" }, // Bazaar red & gold
  { name: "Barcelona Gaudi", bg: "#fef2f8", card: "#fce7f3", accent: "#0891b2", text: "#831843"  }, // Colorful mosaic - very rounded
  { name: "Cape Town Sunset", bg: "#450a0a", card: "#7f1d1d", accent: "#fb923c", text: "#fed7aa"    }, // Sunset colors
  { name: "Stockholm Minimal", bg: "#f8fafc", card: "#ffffff", accent: "#64748b", text: "#0f172a"  }, // Scandinavian minimalism
  { name: "Seoul Modern", bg: "#fafafa", card: "#ffffff", accent: "#ec4899", text: "#1f2937"  }, // Modern K-style
  { name: "Venice Canal", bg: "#0c4a6e", card: "#075985", accent: "#fbbf24", text: "#f0f9ff"  }, // Water & gold
  
  // Artist-Inspired Themes
  { name: "Van Gogh - Starry Night", bg: "#0f1419", card: "#1e293b", accent: "#fbbf24", text: "#f1f5f9"  }, // Deep blue night sky with yellow stars - very rounded for swirling effect
  { name: "Dali - Surreal Desert", bg: "#fef7ed", card: "#fed7aa", accent: "#ea580c", text: "#9a3412" }, // Warm desert tones, melting clocks - extremely rounded for surreal effect
  { name: "Monet - Water Lilies", bg: "#f0fdf4", card: "#dcfce7", accent: "#22c55e", text: "#14532d"  }, // Soft greens and pastels - very rounded for impressionist softness
  { name: "Picasso - Cubist Blue", bg: "#f0f9ff", card: "#e0f2fe", accent: "#1e40af", text: "#1e293b" }, // Blue period colors - sharp corners for geometric cubism
  { name: "Frida Kahlo - Mexican Folk", bg: "#fef2f8", card: "#fce7f3", accent: "#dc2626", text: "#831843" }, // Bright Mexican colors - moderately rounded
  
  // Special Themes
  { name: "Minimal Light", bg: "#ffffff", card: null, accent: "#000000", text: "#000000", isMinimal: true, isLight: true }, // Transparent mode - no background, no cards
  { name: "Clean Mode", bg: "#000000", card: "#1a1a1a", accent: "#3b82f6", text: "#ffffff", isCleanMode: true },  // Clean mode - only header and focus

  // New theme additions (from feature brainstorming)
  { name: "Aurora", bg: "linear-gradient(135deg,#062743 0%,#0b3954 40%,#2a7aa1 100%)", card: "rgba(10,25,40,0.4)", accent: "#6dd3ff", text: "#e6f7ff", description: "Dynamic aurora gradient with soft particles", previewConfig: { animation: 'aurora' } },
  { name: "Paper Notebook", bg: "#fbf6ee", card: "#fffaf5", accent: "#c75b39", text: "#2b2b2b", description: "Warm paper texture with hand-drawn accents", previewConfig: { texture: true } },
  { name: "Cinematic", bg: "#070707", card: "#0f0f0f", accent: "#ffd166", text: "#f8f7f3", description: "Vignette and spotlight with letterbox option" },
  { name: "Synthwave", bg: "#0a0a0f", card: "#151522", accent: "#ff3cac", text: "#f0f0f0", description: "Neon grid and retro glow" },
  { name: "Nebula", bg: "#08020a", card: "#1a0b2f", accent: "#ff6fd8", text: "#e6e6ff", description: "Starfield with drifting nebula bands", previewConfig: { animation: 'nebula' } },
  { name: "Frosted Glass", bg: "#0f172a", card: "rgba(255,255,255,0.06)", accent: "#60a5fa", text: "#e6eef8", description: "Translucent frosted panels with soft blur", previewConfig: { blur: true } },
  { name: "Seasons (Auto)", bg: "#f8fafc", card: "#ffffff", accent: "#22c55e", text: "#1f2937", description: "Material base with seasonal overlays (petals, leaves, snow)", previewConfig: { seasonal: true } },
  { name: "High Contrast", bg: "#000000", card: "#000000", accent: "#ffffff", text: "#ffffff", description: "Accessibility-first high-contrast palette" },
  { name: "Focus Mode", bg: "#071027", card: "rgba(10,25,40,0.3)", accent: "#60a5fa", text: "#e6eef8", description: "Low-distraction muted UI for concentration" },
  { name: "Energy Mode", bg: "#fff7ed", card: "#ffedd5", accent: "#f97316", text: "#7c2d12", description: "Bright, energetic colors and lively motion" },
  { name: "Calm Mode", bg: "#f0fdf4", card: "#dcfce7", accent: "#22c55e", text: "#14532d", description: "Pastel tones and slow, calming motion" },
  { name: "Arcade", bg: "#020617", card: "#091226", accent: "#00ff9d", text: "#eafff0", description: "Game-like HUD with badges and celebratory particles" },
  { name: "Audio Reactive", bg: "#0b0f1a", card: "#111322", accent: "#7c3aed", text: "#e6e6ff", description: "Visuals that react subtly to ambient audio", previewConfig: { audioReactive: true } },
  { name: "Developer", bg: "#0f172a", card: "#111827", accent: "#10b981", text: "#cce7d6", description: "Developer overlay with FPS and particle counts", previewConfig: { debug: true } },
  { name: "Colorblind Safe", bg: "#f8fafc", card: "#ffffff", accent: "#0072b2", text: "#0f172a", description: "Palette optimized for common color vision deficiencies" },
  { name: "Snowfall", bg: "#f3f8ff", card: "#eef6ff", accent: "#a7d8ff", text: "#0f172a", description: "Subtle layered snowfall with depth and soft blur", previewConfig: { particle: 'snow' } }
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
  { name: "Violin - Sad Loop", file: "/sounds/violin-sad-loop.wav" },
  { name: "Therapy - Deep Sleep (30min)", file: "/sounds/healing-meditation-30min.wav" },
  { name: "Therapy - Relaxation Music", file: "/sounds/relaxation-music-zhro.wav" },
  { name: "Therapy - Native Flute", file: "/sounds/native-flute-meditation.wav" },
  { name: "Therapy - Atmospheric", file: "/sounds/silentium-atmospheric.wav" },
  { name: "Deep Work - Piano Focus", file: "/sounds/focus-piano-noir.wav" },
  { name: "Pomodoro - Atmospheric Focus", file: "/sounds/pomodoro-focus-atmospheric.wav" },
  { name: "Coffee Break - Romantic Chill", file: "/sounds/coffee-break-romantic.wav" },
  { name: "Workout - Energetic Loop", file: "/sounds/workout-energetic-loop.wav" },
  { name: "Nature - Forest Rain", file: "/sounds/nature-rain-forest.wav" },
  { name: "Nature - Gentle Stream", file: "/sounds/nature-stream-gentle.wav" },
  { name: "Nature - Birds & Rain", file: "/sounds/nature-birds-rain.wav" },
  { name: "Nature - Ocean Waves", file: "/sounds/nature-ocean-waves.wav" },
  { name: "Nature - Strong Wind", file: "/sounds/nature-wind-strong.wav" },
  { name: "Season - Spring Bees", file: "/sounds/season-spring-bees.wav" },
  { name: "Season - Summer Cicadas", file: "/sounds/season-summer-cicadas.wav" },
  { name: "Season - Autumn Leaves", file: "/sounds/season-autumn-leaves.wav" },
  { name: "Season - Winter Snow", file: "/sounds/season-winter-snow.wav" }
];

// Sound file paths
export const COUNTDOWN_NOISE_SOUND = "/sounds/beep.mp3";

// Default saved timers (single countdowns only; for multi-step routines, see routineTemplates.js)
export const DEFAULT_SAVED_TIMERS = [
  // Work/Pomodoro timers
  { name: "Pomodoro", duration: 25, unit: "min", min: 25, color: "#ef4444", group: "Work" },
  { name: "Pomodoro Short", duration: 15, unit: "min", min: 15, color: "#f97316", group: "Work" },
  { name: "Pomodoro Long", duration: 45, unit: "min", min: 45, color: "#dc2626", group: "Work" },

  // Deep Work sessions
  { name: "Deep Work", duration: 50, unit: "min", min: 50, color: "#8b5cf6", group: "Work" },
  { name: "Deep Focus", duration: 90, unit: "min", min: 90, color: "#7c3aed", group: "Work" },
  { name: "Flow State", duration: 120, unit: "min", min: 120, color: "#6d28d9", group: "Work" },

  // Coffee Breaks
  { name: "Coffee Break", duration: 10, unit: "min", min: 10, color: "#92400e", group: "Break" },
  { name: "Quick Coffee", duration: 5, unit: "min", min: 5, color: "#a16207", group: "Break" },
  { name: "Extended Break", duration: 15, unit: "min", min: 15, color: "#78350f", group: "Break" },

  // Workout sessions
  { name: "Workout", duration: 30, unit: "min", min: 30, color: "#f59e0b", group: "Fitness" },
  { name: "HIIT Session", duration: 20, unit: "min", min: 20, color: "#d97706", group: "Fitness" },
  { name: "Long Workout", duration: 60, unit: "min", min: 60, color: "#b45309", group: "Fitness" },

  // Additional breaks
  { name: "Short Break", duration: 5, unit: "min", min: 5, color: "#10b981", group: "Work" },
  { name: "Lunch Break", duration: 60, unit: "min", min: 60, color: "#059669", group: "Break" }
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
  STORAGE_VERSION: 'storageVersion',
  CUSTOM_BORDER_RADIUS: 'customBorderRadius',
  THEME_OPACITY: 'themeOpacity'
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

// Background images configurations (built-in images)
export const BUILT_IN_BACKGROUND_IMAGES = [
  { id: 'mountain-sunset', name: 'Mountain Sunset', path: '/background-images/mountain-sunset.jpg' },
  { id: 'ocean-waves', name: 'Ocean Waves', path: '/background-images/ocean-waves.jpg' },
  { id: 'forest-trees', name: 'Forest Trees', path: '/background-images/forest-trees.jpg' },
  { id: 'night-stars', name: 'Night Stars', path: '/background-images/night-stars.jpg' },
  { id: 'city-lights', name: 'City Lights', path: '/background-images/city-lights.jpg' },
];