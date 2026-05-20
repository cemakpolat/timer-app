import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Smart break reminders based on modern ergonomics best practices for computer users.
 * Reminders only fire when:
 *   – The page is visible (not a background tab)
 *   – No timer is actively running (isRunning === false)
 *   – The specific reminder is enabled globally
 *
 * Uses browser Notification API when available; falls back to in-app banner.
 */

export const BREAK_REMINDERS = [
  {
    id: 'eyes_20_20_20',
    label: '20-20-20 Eye Rule',
    description: 'Look at something 20 feet away for 20 seconds to reduce eye strain.',
    icon: '👁️',
    defaultIntervalMin: 20,
    category: 'eyes',
    tip: 'Look out a window or at a distant wall. This relaxes your ciliary muscles.',
  },
  {
    id: 'microbreak',
    label: 'Screen Microbreak',
    description: 'Fully close your eyes or look away from your screen for 1–2 minutes.',
    icon: '🫥',
    defaultIntervalMin: 25,
    category: 'eyes',
    tip: 'Blink rapidly a few times to re-moisten your eyes before closing them.',
  },
  {
    id: 'posture',
    label: 'Posture Reset',
    description: 'Sit back, straighten your spine, relax your shoulders away from ears.',
    icon: '🪑',
    defaultIntervalMin: 30,
    category: 'posture',
    tip: 'Your ears should be over your shoulders, shoulders over hips. Unclench your jaw.',
  },
  {
    id: 'wrist_stretch',
    label: 'Wrist & Hand Stretch',
    description: 'Extend arms, flex wrists gently, rotate them to prevent RSI.',
    icon: '🤲',
    defaultIntervalMin: 40,
    category: 'posture',
    tip: 'Spread your fingers wide, then make a fist. Repeat 5×. Rotate wrists clockwise.',
  },
  {
    id: 'hydration',
    label: 'Hydration Reminder',
    description: 'Drink a glass of water. Dehydration reduces focus and increases fatigue.',
    icon: '💧',
    defaultIntervalMin: 45,
    category: 'health',
    tip: 'Aim for 250 ml each time. Herbal tea and water-rich foods also count.',
  },
  {
    id: 'neck_shoulders',
    label: 'Neck & Shoulder Release',
    description: 'Slowly roll your neck side to side, then roll shoulders forward and back.',
    icon: '🔄',
    defaultIntervalMin: 50,
    category: 'posture',
    tip: 'Do 5 slow neck circles each direction. Drop chin to chest and hold 10 sec.',
  },
  {
    id: 'deep_breathing',
    label: 'Deep Breathing',
    description: 'Take 4 deep breaths: inhale 4 sec, hold 4 sec, exhale 6 sec.',
    icon: '🌬️',
    defaultIntervalMin: 55,
    category: 'mental',
    tip: 'Box breathing activates the parasympathetic system and resets focus.',
  },
  {
    id: 'movement',
    label: 'Move & Stretch',
    description: 'Stand up, walk around for 2+ minutes. Calf raises or standing stretches.',
    icon: '🚶',
    defaultIntervalMin: 60,
    category: 'movement',
    tip: 'Prolonged sitting raises cardiovascular risk. Even 2 min of movement helps.',
  },
  {
    id: 'back_stretch',
    label: 'Back & Hip Stretch',
    description: 'Stand and do a gentle backbend, then forward fold or seated twist.',
    icon: '🧘',
    defaultIntervalMin: 75,
    category: 'movement',
    tip: 'Hip flexors shorten from sitting — a standing lunge stretch helps open them.',
  },
  {
    id: 'mental_reset',
    label: 'Mental Reset',
    description: 'Step away from your screen for 5–10 minutes. No phone. Let your mind wander.',
    icon: '🧠',
    defaultIntervalMin: 90,
    category: 'mental',
    tip: 'Diffuse-mode thinking (daydreaming) consolidates memory and sparks creativity.',
  },
];

const DEFAULT_SETTINGS = {
  enabled: false,
  suppressDuringTimer: true,
  reminders: BREAK_REMINDERS.map(r => ({
    id: r.id,
    active: true,
    intervalMin: r.defaultIntervalMin,
  })),
};

function loadSettings() {
  try {
    const raw = localStorage.getItem('breakReminderSettings');
    if (!raw) return DEFAULT_SETTINGS;
    const saved = JSON.parse(raw);
    // Merge saved reminders with any new reminder definitions (forward compat)
    const merged = DEFAULT_SETTINGS.reminders.map(def => {
      const found = saved.reminders?.find(r => r.id === def.id);
      return found ? { ...def, ...found } : def;
    });
    return { ...DEFAULT_SETTINGS, ...saved, reminders: merged };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * @param {boolean} isTimerRunning — suppress reminders while a focus timer is active
 * @param {Function} sendNotification — from useNotifications hook (or null)
 */
const useBreakReminders = (isTimerRunning = false, sendNotification = null) => {
  const [settings, setSettings] = useState(loadSettings);
  const [pendingReminder, setPendingReminder] = useState(null); // { id, label, description, icon, tip }

  // Track when each reminder last fired — stored in a ref to avoid re-render triggers
  const lastFiredRef = useRef(() => {
    const now = Date.now();
    return Object.fromEntries(BREAK_REMINDERS.map(r => [r.id, now]));
  });

  // Lazy-initialise lastFiredRef on first render
  useEffect(() => {
    const now = Date.now();
    lastFiredRef.current = Object.fromEntries(BREAK_REMINDERS.map(r => [r.id, now]));
  }, []); // only once

  // Persist settings
  useEffect(() => {
    try { localStorage.setItem('breakReminderSettings', JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings]);

  // Main tick — runs every 60 seconds
  useEffect(() => {
    if (!settings.enabled) return;

    const tick = () => {
      // Suppress when the timer is running (if opted in) or page is hidden
      if (settings.suppressDuringTimer && isTimerRunning) return;
      if (document.hidden) return;

      const now = Date.now();

      for (const reminder of BREAK_REMINDERS) {
        const cfg = settings.reminders.find(r => r.id === reminder.id);
        if (!cfg || !cfg.active) continue;

        const intervalMs = cfg.intervalMin * 60_000;
        const lastFired = lastFiredRef.current[reminder.id] ?? (now - intervalMs - 1);

        if (now - lastFired >= intervalMs) {
          lastFiredRef.current[reminder.id] = now;

          // Try browser notification first
          if (sendNotification) {
            sendNotification(`${reminder.icon} ${reminder.label}`, {
              body: reminder.description,
              tag: `break-${reminder.id}`,
              requireInteraction: false,
            });
          } else {
            // Fallback: in-app banner (show the first fired one; don't stack)
            setPendingReminder(reminder);
          }

          // Only fire one reminder per tick to avoid overloading the user
          break;
        }
      }
    };

    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [settings, isTimerRunning, sendNotification]);

  const updateSettings = useCallback((patch) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const toggleEnabled = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const toggleReminder = useCallback((id) => {
    setSettings(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, active: !r.active } : r),
    }));
  }, []);

  const setReminderInterval = useCallback((id, minutes) => {
    const clamped = Math.max(5, Math.min(120, Math.round(minutes)));
    setSettings(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, intervalMin: clamped } : r),
    }));
  }, []);

  /**
   * Reset the countdown for a specific reminder (e.g. user took the break).
   * Also resets all reminders when called without an id.
   */
  const resetReminder = useCallback((id) => {
    const now = Date.now();
    if (id) {
      lastFiredRef.current[id] = now;
    } else {
      BREAK_REMINDERS.forEach(r => { lastFiredRef.current[r.id] = now; });
    }
    setPendingReminder(null);
  }, []);

  const dismissReminder = useCallback(() => {
    setPendingReminder(null);
  }, []);

  return {
    settings,
    updateSettings,
    toggleEnabled,
    toggleReminder,
    setReminderInterval,
    pendingReminder,
    resetReminder,
    dismissReminder,
    BREAK_REMINDERS,
  };
};

export default useBreakReminders;
