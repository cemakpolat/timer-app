/**
 * Immersive scene configurations for different timer types
 * Each scene provides visual theming including backgrounds, cards, accents, and descriptions
 */

export const SCENES = {
  none: {
    name: "None",
    bg: null,
    card: null,
    emoji: "🚫"
  },
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

/**
 * Get scene by key
 * @param {string} sceneKey - Scene identifier
 * @returns {Object|null} Scene object or null if not found
 */
export const getScene = (sceneKey) => {
  return SCENES[sceneKey] || null;
};

/**
 * Get all available scenes as array
 * @returns {Array} Array of scene objects with keys
 */
export const getAllScenes = () => {
  return Object.entries(SCENES).map(([key, scene]) => ({
    key,
    ...scene
  }));
};

/**
 * Check if scene exists
 * @param {string} sceneKey - Scene identifier
 * @returns {boolean} True if scene exists
 */
export const hasScene = (sceneKey) => {
  return sceneKey in SCENES;
};
