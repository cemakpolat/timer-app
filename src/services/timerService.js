// Lightweight timer service - merges template timers with custom timers stored in localStorage
// Provides simple CRUD operations for custom timers and helpers to migrate old sequences.

import { WORKOUT_TEMPLATES } from './workoutTemplates';

const CUSTOM_KEY = 'customTimers';

const safeParse = (s, fallback) => {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

export const getCustomTimers = () => {
  const raw = localStorage.getItem(CUSTOM_KEY) || '[]';
  return safeParse(raw, []);
};

export const setCustomTimers = (arr) => {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(arr));
};

export const getAllTimers = () => {
  // Map templates to ensure they have metadata fields
  const templates = (Array.isArray(WORKOUT_TEMPLATES) ? WORKOUT_TEMPLATES : []).map(t => ({
    ...t,
    metadata: {
      ...(t.metadata || {}),
      source: 'template',
      isEditable: false,
      isTemplate: true
    }
  }));

  const custom = getCustomTimers().map(t => ({
    ...t,
    metadata: {
      ...(t.metadata || {}),
      source: 'custom',
      isEditable: true,
      isTemplate: false
    }
  }));

  return [...templates, ...custom];
};

export const getTimerById = (id) => {
  if (!id) return null;
  const all = getAllTimers();
  return all.find(t => t.id === id) || null;
};

export const saveCustomTimer = (timer) => {
  if (!timer || typeof timer !== 'object') throw new Error('Invalid timer');
  const custom = getCustomTimers();

  const now = Date.now();
  const newTimer = {
    ...timer,
    id: timer.id || `custom-${now}`,
    metadata: {
      ...(timer.metadata || {}),
      source: 'custom',
      isEditable: true,
      isTemplate: false,
      createdAt: timer.metadata?.createdAt || now
    }
  };

  const idx = custom.findIndex(t => t.id === newTimer.id);
  if (idx >= 0) custom[idx] = newTimer; else custom.push(newTimer);
  setCustomTimers(custom);
  return newTimer;
};

export const deleteCustomTimer = (id) => {
  if (!id) return false;
  const custom = getCustomTimers();
  const filtered = custom.filter(t => t.id !== id);
  if (filtered.length === custom.length) return false;
  setCustomTimers(filtered);
  return true;
};

export const getTemplatesByType = (type) => {
  const all = getAllTimers();
  if (!type || type === 'all') return all;
  return all.filter(t => t.templateType === type || (t.metadata && t.metadata.templateType === type));
};

export const createRoomPayloadFromTemplate = (templateId, { roomName, privacy, ownerName, ownerDisplayName }) => {
  const template = getTimerById(templateId);
  if (!template) throw new Error('Template not found');
  if (!template.metadata || !template.metadata.isRoomCompatible) {
    throw new Error('Template is not compatible with focus rooms');
  }

  const totalDuration = template.metadata.totalDuration || template.duration || 0;
  const payload = {
    name: roomName || `${ownerDisplayName || 'User'}'s ${template.name} session`,
    privacy: privacy || 'public',
    attachedTemplate: {
      id: template.id,
      name: template.name,
      emoji: template.emoji,
      category: template.category,
      difficulty: template.difficulty,
      metadata: template.metadata
    },
    timerState: {
      templateId: template.id,
      currentIndex: 0,
      exerciseCount: template.exercises ? template.exercises.length : 0,
      totalDuration,
      running: false,
      remaining: template.exercises && template.exercises[0] ? (template.exercises[0].duration || 0) * (template.exercises[0].unit === 'min' ? 60 : 1) : 0
    }
  };

  return payload;
};

export const migrateOldSequences = () => {
  // Attempt to migrate legacy saved sequences (varies by app versions)
  // This implementation is conservative: it only migrates if `savedSequences` key exists
  const legacyKey = 'saved';
  const raw = localStorage.getItem(legacyKey);
  if (!raw) return { migrated: 0 };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { migrated: 0 };
  }

  if (!Array.isArray(parsed)) return { migrated: 0 };

  const existingCustom = getCustomTimers();
  let migrated = 0;
  parsed.forEach(item => {
    // Heuristic: items with `sequence` or `exercises` are sequences
    const seq = item.sequence || item.exercises;
    if (!seq || !Array.isArray(seq)) return;

    const newTimer = {
      id: `migrated-${Date.now()}-${Math.floor(Math.random()*10000)}`,
      name: item.name || item.title || 'Migrated Workout',
      description: item.description || '',
      exercises: seq,
      metadata: {
        source: 'custom',
        isEditable: true,
        isTemplate: false,
        createdAt: Date.now(),
        totalDuration: seq.reduce((acc, ex) => acc + (ex.duration || 0) * (ex.unit === 'min' ? 60 : 1), 0),
        exerciseCount: seq.length
      }
    };

    existingCustom.push(newTimer);
    migrated += 1;
  });

  if (migrated > 0) setCustomTimers(existingCustom);
  return { migrated };
};

export default {
  getAllTimers,
  getTimerById,
  saveCustomTimer,
  deleteCustomTimer,
  migrateOldSequences,
  getCustomTimers,
  setCustomTimers
};
