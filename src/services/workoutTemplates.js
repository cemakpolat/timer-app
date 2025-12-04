/**
 * Workout Templates
 *
 * Pre-configured workout templates for various fitness activities.
 * Each workout is a sequence of exercises with durations and types.
 */

/**
 * Helper function to generate Tabata intervals (20s work, 10s rest)
 */
const generateTabata = (exerciseName, rounds = 8) => {
  const exercises = [
    { name: 'Get Ready!', duration: 10, unit: 'sec', type: 'warmup', color: '#10b981' }
  ];

  for (let i = 1; i <= rounds; i++) {
    exercises.push(
      { name: `${exerciseName} - Round ${i}`, duration: 20, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 10, unit: 'sec', type: 'rest', color: '#3b82f6' }
    );
  }

  exercises.push(
    { name: 'Cool Down', duration: 30, unit: 'sec', type: 'cooldown', color: '#8b5cf6' }
  );

  return exercises;
};

/**
 * Helper function to generate AMRAP (As Many Rounds As Possible)
 * Currently not used but available for future workout templates
 */
// eslint-disable-next-line no-unused-vars
const generateAMRAP = (exercises, totalMinutes) => {
  const sequence = [
    { name: 'Warm-up', duration: 120, unit: 'sec', type: 'warmup', color: '#10b981' }
  ];

  const workTime = (totalMinutes * 60) - 120 - 60; // Minus warmup and cooldown
  const roundDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);
  const rounds = Math.floor(workTime / roundDuration);

  for (let i = 1; i <= rounds; i++) {
    exercises.forEach(ex => {
      sequence.push({
        ...ex,
        name: `${ex.name} (Round ${i})`,
        type: 'work',
        color: '#f59e0b'
      });
    });
  }

  sequence.push(
    { name: 'Cool Down', duration: 60, unit: 'sec', type: 'cooldown', color: '#8b5cf6' }
  );

  return sequence;
};

export const WORKOUT_CATEGORIES = {
  cardio: { name: 'Cardio', color: '#ef4444', icon: '🏃', description: 'Get your heart pumping' },
  strength: { name: 'Strength', color: '#f59e0b', icon: '💪', description: 'Build muscle and power' },
  flexibility: { name: 'Flexibility', color: '#8b5cf6', icon: '🧘', description: 'Stretch and mobility' },
  sports: { name: 'Sports', color: '#10b981', icon: '⚽', description: 'Sport-specific training' },
  mixed: { name: 'Mixed', color: '#6366f1', icon: '🔥', description: 'Combination workouts' }
};

export const WORKOUT_DIFFICULTIES = {
  beginner: { name: 'Beginner', color: '#10b981', icon: '⭐' },
  intermediate: { name: 'Intermediate', color: '#f59e0b', icon: '⭐⭐' },
  advanced: { name: 'Advanced', color: '#ef4444', icon: '⭐⭐⭐' }
};

export const WORKOUT_TEMPLATES = [
  {
    id: 'hiit-beginner',
    name: 'HIIT Beginner',
    description: '20-minute high-intensity interval training perfect for getting started',
    category: 'cardio',
    duration: 1200,
    difficulty: 'beginner',
    templateType: 'workout',
    exercises: [
      { name: 'Warm-up Jog', duration: 180, unit: 'sec', type: 'warmup', color: '#10b981' },
      { name: 'Jumping Jacks', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'High Knees', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Butt Kicks', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Mountain Climbers', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Jumping Jacks', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'High Knees', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Butt Kicks', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Mountain Climbers', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Cool Down Stretch', duration: 180, unit: 'sec', type: 'cooldown', color: '#8b5cf6' }
    ],
    emoji: '🔥',
    tags: ['beginner-friendly', 'no-equipment', 'fat-burning'],
    metadata: {
      source: 'template',
      isTemplate: true,
      isEditable: false,
      totalDuration: 1200,
      exerciseCount: 17,
      isRoomCompatible: true,
      recommendedParticipants: 4
    }
  },

  {
    id: 'strength-fullbody',
    name: 'Full Body Strength',
    description: '30-minute strength training targeting all major muscle groups',
    category: 'strength',
    duration: 1800,
    difficulty: 'intermediate',
    templateType: 'workout',
    exercises: [
      { name: 'Dynamic Warm-up', duration: 300, unit: 'sec', type: 'warmup', color: '#10b981' },
      { name: 'Push-ups', duration: 45, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Squats', duration: 45, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Lunges', duration: 45, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Plank Hold', duration: 45, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Dips', duration: 45, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Jump Squats', duration: 45, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Pike Push-ups', duration: 45, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Bulgarian Split Squats', duration: 45, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Bicycle Crunches', duration: 45, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Rest', duration: 30, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Superman Holds', duration: 45, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Cool Down & Stretch', duration: 240, unit: 'sec', type: 'cooldown', color: '#8b5cf6' }
    ],
    emoji: '💪',
    tags: ['no-equipment', 'muscle-building', 'full-body'],
    metadata: {
      source: 'template',
      isTemplate: true,
      isEditable: false,
      totalDuration: 1800,
      exerciseCount: 21,
      isRoomCompatible: true,
      recommendedParticipants: 4
    }
  },

  {
    id: 'yoga-flow',
    name: 'Morning Yoga Flow',
    description: '25-minute energizing yoga sequence for flexibility and mindfulness',
    category: 'flexibility',
    duration: 1500,
    difficulty: 'beginner',
    templateType: 'workout',
    exercises: [
      { name: 'Breathing Exercise', duration: 120, unit: 'sec', type: 'warmup', color: '#8b5cf6' },
      { name: 'Cat-Cow Stretch', duration: 90, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Downward Dog', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Sun Salutation A', duration: 180, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Warrior I', duration: 60, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Warrior II', duration: 60, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Triangle Pose', duration: 60, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Sun Salutation B', duration: 180, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Tree Pose', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Seated Forward Fold', duration: 90, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Pigeon Pose', duration: 90, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Child\'s Pose', duration: 90, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Savasana (Rest)', duration: 300, unit: 'sec', type: 'cooldown', color: '#8b5cf6' }
    ],
    emoji: '🧘',
    tags: ['flexibility', 'mindfulness', 'morning-routine'],
    metadata: {
      source: 'template',
      isTemplate: true,
      isEditable: false,
      totalDuration: 1500,
      exerciseCount: 13,
      isRoomCompatible: true,
      recommendedParticipants: 3
    }
  },

  {
    id: 'tabata-burpees',
    name: 'Tabata Burpees',
    description: '4-minute intense Tabata protocol with burpees (20s work, 10s rest)',
    category: 'cardio',
    duration: 240,
    difficulty: 'advanced',
    templateType: 'workout',
    exercises: generateTabata('Burpees', 8),
    emoji: '⚡',
    tags: ['quick-workout', 'high-intensity', 'fat-burning'],
    metadata: {
      source: 'template',
      isTemplate: true,
      isEditable: false,
      totalDuration: 240,
      exerciseCount: 10,
      isRoomCompatible: true,
      recommendedParticipants: 2
    }
  },

  {
    id: 'core-crusher',
    name: 'Core Crusher',
    description: '15-minute focused core strengthening workout',
    category: 'strength',
    duration: 900,
    difficulty: 'intermediate',
    exercises: [
      { name: 'Core Activation', duration: 120, unit: 'sec', type: 'warmup', color: '#10b981' },
      { name: 'Plank Hold', duration: 45, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 15, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Russian Twists', duration: 45, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 15, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Bicycle Crunches', duration: 45, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 15, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Mountain Climbers', duration: 45, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 15, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Leg Raises', duration: 45, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 15, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Side Plank Right', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 15, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Side Plank Left', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 15, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Flutter Kicks', duration: 45, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 15, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Plank to Down Dog', duration: 45, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 15, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Hollow Body Hold', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Cool Down Stretch', duration: 90, unit: 'sec', type: 'cooldown', color: '#8b5cf6' }
    ],
    emoji: '🎯',
    tags: ['core', 'abs', 'no-equipment'],
    templateType: 'workout',
    metadata: {
      source: 'template',
      isTemplate: true,
      isEditable: false,
      totalDuration: 900,
      exerciseCount: 21,
      isRoomCompatible: true,
      recommendedParticipants: 3
    }
  },

  {
    id: 'stretch-mobility',
    name: 'Full Body Stretch',
    description: '20-minute full-body stretching and mobility routine for recovery',
    category: 'flexibility',
    duration: 1200,
    difficulty: 'beginner',
    exercises: [
      { name: 'Breathing & Centering', duration: 60, unit: 'sec', type: 'warmup', color: '#8b5cf6' },
      { name: 'Neck Rolls', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Shoulder Circles', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Arm Crossover Stretch', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Tricep Stretch', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Side Bends', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Torso Twists', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Cat-Cow Stretch', duration: 90, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Hip Circles', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Standing Quad Stretch', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Hamstring Stretch', duration: 90, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Hip Flexor Stretch', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Butterfly Stretch', duration: 90, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Pigeon Pose', duration: 90, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Calf Stretch', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Ankle Rolls', duration: 60, unit: 'sec', type: 'work', color: '#8b5cf6' },
      { name: 'Final Relaxation', duration: 180, unit: 'sec', type: 'cooldown', color: '#8b5cf6' }
    ],
    emoji: '🤸',
    tags: ['recovery', 'flexibility', 'relaxation'],
    templateType: 'workout',
    metadata: {
      source: 'template',
      isTemplate: true,
      isEditable: false,
      totalDuration: 1200,
      exerciseCount: 17,
      isRoomCompatible: true,
      recommendedParticipants: 2
    }
  },

  {
    id: 'boxing-cardio',
    name: 'Boxing Cardio',
    description: '25-minute boxing-inspired cardio workout for endurance and power',
    category: 'sports',
    duration: 1500,
    difficulty: 'intermediate',
    exercises: [
      { name: 'Jump Rope Warm-up', duration: 180, unit: 'sec', type: 'warmup', color: '#10b981' },
      { name: 'Jab-Cross Combo', duration: 60, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 20, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Hooks', duration: 60, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 20, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Uppercuts', duration: 60, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 20, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Speed Bag', duration: 60, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 20, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Jab-Cross-Hook', duration: 60, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 20, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Slip & Counter', duration: 60, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 20, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Body Shots', duration: 60, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 20, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Combo Drill', duration: 60, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 20, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Burpees', duration: 45, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Rest', duration: 20, unit: 'sec', type: 'rest', color: '#3b82f6' },
      { name: 'Mountain Climbers', duration: 45, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Cool Down Shadow Boxing', duration: 180, unit: 'sec', type: 'cooldown', color: '#8b5cf6' }
    ],
    emoji: '🥊',
    tags: ['boxing', 'cardio', 'coordination'],
    templateType: 'workout',
    metadata: {
      source: 'template',
      isTemplate: true,
      isEditable: false,
      totalDuration: 1500,
      exerciseCount: 21,
      isRoomCompatible: true,
      recommendedParticipants: 4
    }
  },

  {
    id: 'quick-morning',
    name: '7-Minute Energizer',
    description: 'Quick morning workout to wake up and energize for the day',
    category: 'mixed',
    duration: 420,
    difficulty: 'beginner',
    exercises: [
      { name: 'Wake-up Stretch', duration: 30, unit: 'sec', type: 'warmup', color: '#10b981' },
      { name: 'Jumping Jacks', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Wall Sit', duration: 30, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Push-ups', duration: 30, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Crunches', duration: 30, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Step-ups', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Squats', duration: 30, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Tricep Dips', duration: 30, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Plank', duration: 30, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'High Knees', duration: 30, unit: 'sec', type: 'work', color: '#ef4444' },
      { name: 'Lunges', duration: 30, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Push-up with Rotation', duration: 30, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Side Plank', duration: 30, unit: 'sec', type: 'work', color: '#f59e0b' },
      { name: 'Cool Down', duration: 30, unit: 'sec', type: 'cooldown', color: '#8b5cf6' }
    ],
    emoji: '☀️',
    tags: ['quick-workout', 'morning', 'no-equipment'],
    templateType: 'workout',
    metadata: {
      source: 'template',
      isTemplate: true,
      isEditable: false,
      totalDuration: 420,
      exerciseCount: 14,
      isRoomCompatible: true,
      recommendedParticipants: 2
    }
  }
];

/**
 * Get workout template by ID
 */
export const getWorkoutTemplate = (templateId) => {
  return WORKOUT_TEMPLATES.find(t => t.id === templateId);
};

/**
 * Get templates by category
 */
export const getWorkoutsByCategory = (category) => {
  if (category === 'all') return WORKOUT_TEMPLATES;
  return WORKOUT_TEMPLATES.filter(t => t.category === category);
};

/**
 * Get templates by difficulty
 */
export const getWorkoutsByDifficulty = (difficulty) => {
  if (difficulty === 'all') return WORKOUT_TEMPLATES;
  return WORKOUT_TEMPLATES.filter(t => t.difficulty === difficulty);
};

/**
 * Filter workouts by category and difficulty
 */
export const filterWorkouts = (category = 'all', difficulty = 'all', searchTerm = '') => {
  let filtered = WORKOUT_TEMPLATES;

  if (category !== 'all') {
    filtered = filtered.filter(t => t.category === category);
  }

  if (difficulty !== 'all') {
    filtered = filtered.filter(t => t.difficulty === difficulty);
  }

  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(search) ||
      t.description.toLowerCase().includes(search) ||
      t.tags.some(tag => tag.toLowerCase().includes(search))
    );
  }

  return filtered;
};

/**
 * Calculate total workout duration from exercises
 */
export const calculateWorkoutDuration = (exercises) => {
  return exercises.reduce((total, ex) => total + ex.duration, 0);
};

/**
 * Format duration in seconds to readable string
 */
export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

/**
 * Get exercise count by type
 */
export const getExerciseStats = (exercises) => {
  const stats = {
    total: exercises.length,
    work: exercises.filter(e => e.type === 'work').length,
    rest: exercises.filter(e => e.type === 'rest').length,
    warmup: exercises.filter(e => e.type === 'warmup').length,
    cooldown: exercises.filter(e => e.type === 'cooldown').length
  };
  return stats;
};

/**
 * Create custom workout template
 */
export const createCustomWorkout = (name, description, exercises, category = 'mixed', difficulty = 'beginner') => {
  return {
    id: `custom-${Date.now()}`,
    name,
    description,
    category,
    difficulty,
    duration: calculateWorkoutDuration(exercises),
    exercises,
    emoji: '⭐',
    tags: ['custom'],
    isCustom: true,
    createdAt: Date.now()
  };
};
