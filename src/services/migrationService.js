/**
 * Sequence Migration Utility
 *
 * Handles migration of legacy saved sequences from the old storage format
 * to the new unified timerService format.
 *
 * Legacy format (in savedSequences):
 * {
 *   name, description, steps, duration, emoji, category, difficulty, tags,
 *   exerciseCount, totalSeconds, createdAt
 * }
 *
 * New format (customTimers in localStorage):
 * {
 *   id, name, description, exercises, duration, emoji, category, difficulty,
 *   tags, templateType, metadata { source, isTemplate, isCustom, ... }
 * }
 */



/**
 * Migrate a single legacy sequence to new format
 */
export const migrateSequence = (legacySequence) => {
  if (!legacySequence || !legacySequence.name) {
    return null;
  }

  // Generate unique ID based on name and timestamp
  const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Convert legacy exercises (steps) to new format
  const exercises = (legacySequence.steps || []).map(step => ({
    name: step.name || 'Exercise',
    duration: step.duration || step.seconds || 30,
    unit: step.unit || 'sec',
    type: step.type || 'work',
    color: step.color || '#ef4444'
  }));

  // Create new custom timer
  const newTimer = {
    id,
    name: legacySequence.name,
    description: legacySequence.description || '',
    exercises: exercises.length > 0 ? exercises : [],
    duration: legacySequence.duration || legacySequence.totalSeconds || 0,
    emoji: legacySequence.emoji || '⭐',
    category: legacySequence.category || 'mixed',
    difficulty: legacySequence.difficulty || 'intermediate',
    tags: legacySequence.tags || ['migrated'],
    templateType: 'workout',
    metadata: {
      source: 'custom',
      isTemplate: false,
      isCustom: true,
      isEditable: true,
      totalDuration: legacySequence.duration || legacySequence.totalSeconds || 0,
      exerciseCount: exercises.length,
      isRoomCompatible: true,
      recommendedParticipants: 2,
      migratedAt: Date.now(),
      originalCreatedAt: legacySequence.createdAt || Date.now()
    }
  };

  return newTimer;
};

/**
 * Migrate all legacy sequences from savedSequences
 */
export const migrateAllSequences = (savedSequences = []) => {
  if (!Array.isArray(savedSequences) || savedSequences.length === 0) {
    return [];
  }

  const migratedTimers = [];

  for (const sequence of savedSequences) {
    try {
      const newTimer = migrateSequence(sequence);
      if (newTimer) {
        migratedTimers.push(newTimer);
      }
    } catch (err) {
      console.error('Error migrating sequence:', sequence, err);
    }
  }

  return migratedTimers;
};

/**
 * Check if migration is needed
 * Returns true if there are savedSequences but no customTimers in localStorage
 */
export const isMigrationNeeded = (savedSequences = []) => {
  if (!Array.isArray(savedSequences) || savedSequences.length === 0) {
    return false;
  }

  // Check if customTimers already exist
  const customTimersStr = localStorage.getItem('customTimers');
  const existingCustomTimers = customTimersStr ? JSON.parse(customTimersStr) : [];

  return existingCustomTimers.length === 0;
};

/**
 * Perform full migration from savedSequences to customTimers
 * Should be called once on app initialization
 */
export const performMigration = (savedSequences = []) => {
  try {
    // Check if already migrated
    if (!isMigrationNeeded(savedSequences)) {
      return { success: false, message: 'Migration not needed', migratedCount: 0 };
    }

    // Migrate all sequences
    const migratedTimers = migrateAllSequences(savedSequences);

    if (migratedTimers.length === 0) {
      return { success: false, message: 'No sequences to migrate', migratedCount: 0 };
    }

    // Save migrated timers to localStorage
    const customTimersStr = localStorage.getItem('customTimers') || '[]';
    const existingCustomTimers = JSON.parse(customTimersStr);
    const combinedTimers = [...existingCustomTimers, ...migratedTimers];

    localStorage.setItem('customTimers', JSON.stringify(combinedTimers));

    console.log(`Migration complete: ${migratedTimers.length} sequences migrated to customTimers`);

    return {
      success: true,
      message: `Successfully migrated ${migratedTimers.length} sequences`,
      migratedCount: migratedTimers.length,
      migratedTimers
    };
  } catch (err) {
    console.error('Migration failed:', err);
    return {
      success: false,
      message: `Migration failed: ${err.message}`,
      migratedCount: 0,
      error: err
    };
  }
};

const migrationUtils = {
  migrateSequence,
  migrateAllSequences,
  isMigrationNeeded,
  performMigration
};

export default migrationUtils;
