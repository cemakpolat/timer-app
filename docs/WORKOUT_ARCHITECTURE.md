# Workout & Timer Architecture - Unified System Design

## Problem Statement

Currently, we have two separate systems:
1. **Composite Timers** - User-created timer sequences (stored in localStorage)
2. **Workout Templates** - Pre-configured workout sequences (hardcoded in `workoutTemplates.js`)

### Key Issues:
- Composite timers can't be shown in workout tab
- Workout templates can't be shown in Create Room modal
- No unified metadata system (category, difficulty, icons, etc.)
- Duplication of functionality and data structures

---

## Proposed Solution: Unified Timer System

### Core Principle
**Everything is a Timer Sequence** - Whether it's a custom composite timer or a pre-made workout template, they all share the same data structure and storage mechanism.

---

## Data Structure Design

### 1. Unified Timer/Workout Object

```javascript
{
  // Core Identity
  id: string,                    // Unique ID: 'hiit-beginner' or 'custom-1234567890'
  name: string,                  // Display name: 'HIIT Beginner' or 'My Workout'
  description: string,           // Description text

  // Sequence Data (existing)
  exercises: [                   // Array of timer blocks
    {
      name: string,              // Exercise name
      duration: number,          // Duration value
      unit: 'sec' | 'min',      // Time unit
      type: 'work' | 'rest' | 'warmup' | 'cooldown',  // Exercise type
      color: string,             // Color code
      scene: string              // Optional scene name
    }
  ],

  // Metadata (NEW - for display purposes)
  metadata: {
    // Basic Classification
    source: 'template' | 'custom',  // Where it came from
    category: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'mixed' | 'focus' | 'work',
    difficulty: 'beginner' | 'intermediate' | 'advanced',

    // Visual Elements
    emoji: string,                  // Display emoji
    icon: string,                   // Icon identifier (optional)
    tags: [string],                 // Searchable tags: ['hiit', 'no-equipment', 'fat-burning']

    // Statistics
    totalDuration: number,          // Pre-calculated total seconds
    exerciseCount: number,          // Number of exercises

    // User Data
    createdAt: timestamp,           // Creation timestamp
    lastUsed: timestamp,            // Last used timestamp
    usageCount: number,             // How many times run
    isFavorite: boolean,            // User favorite flag

    // Focus Room Compatibility
    isRoomCompatible: boolean,      // Can be used in focus rooms
    recommendedParticipants: number, // Suggested room size

    // Custom vs Template
    isEditable: boolean,            // Can user edit this?
    isTemplate: boolean             // Is this a pre-made template?
  }
}
```

---

## Storage Architecture

### Option A: Hybrid Storage (RECOMMENDED)

**Templates** → Hardcoded in `workoutTemplates.js` (read-only)
**Custom Timers** → localStorage (user-created, editable)
**Combined View** → Merge both sources at runtime

**Advantages:**
- Templates remain pristine and updateable via code
- Custom timers fully under user control
- Clear separation of concerns
- Easy to add new templates via updates

**Implementation:**
```javascript
// services/timerService.js

export const getAllTimers = () => {
  const templates = WORKOUT_TEMPLATES.map(t => ({
    ...t,
    metadata: {
      ...t.metadata,
      source: 'template',
      isEditable: false,
      isTemplate: true
    }
  }));

  const customTimers = JSON.parse(localStorage.getItem('customTimers') || '[]');

  return [...templates, ...customTimers];
};

export const getTimerById = (id) => {
  const allTimers = getAllTimers();
  return allTimers.find(t => t.id === id);
};

export const saveCustomTimer = (timer) => {
  const customTimers = JSON.parse(localStorage.getItem('customTimers') || '[]');

  const newTimer = {
    ...timer,
    id: timer.id || `custom-${Date.now()}`,
    metadata: {
      ...timer.metadata,
      source: 'custom',
      isEditable: true,
      isTemplate: false,
      createdAt: timer.metadata?.createdAt || Date.now()
    }
  };

  // Update or add
  const index = customTimers.findIndex(t => t.id === newTimer.id);
  if (index >= 0) {
    customTimers[index] = newTimer;
  } else {
    customTimers.push(newTimer);
  }

  localStorage.setItem('customTimers', JSON.stringify(customTimers));
  return newTimer;
};
```

### Option B: Pure LocalStorage (Alternative)

**All timers** → localStorage (including templates copied on first load)

**Advantages:**
- Single source of truth
- Users can edit templates
- Simpler queries

**Disadvantages:**
- Can't update templates easily
- Users might break pre-made workouts
- More complex migration logic

---

## UI Integration Strategy

### 1. Composite Timer Enhancement

**Current:** Basic timer sequence builder
**Enhanced:** Add metadata fields

```javascript
// When saving a sequence in CompositePanel:
const saveSequence = () => {
  const timer = {
    name: seqName,
    description: description, // NEW field
    exercises: sequence,
    metadata: {
      source: 'custom',
      category: selectedCategory, // NEW dropdown
      difficulty: selectedDifficulty, // NEW dropdown
      emoji: selectedEmoji, // NEW picker
      tags: tags, // NEW multi-select
      totalDuration: calculateTotalDuration(sequence),
      exerciseCount: sequence.filter(e => e.type === 'work').length,
      createdAt: Date.now(),
      isEditable: true,
      isTemplate: false,
      isRoomCompatible: isRoomCompatible, // NEW checkbox
      recommendedParticipants: maxParticipants // NEW input
    }
  };

  timerService.saveCustomTimer(timer);
};
```

**UI Mockup for Enhanced Save Dialog:**
```
┌─────────────────────────────────────┐
│ Save Sequence                    ×  │
├─────────────────────────────────────┤
│ Name: [My Custom Workout________]   │
│ Description: [___________________]   │
│                                     │
│ Category:  [Cardio ▼]               │
│ Difficulty: [Intermediate ▼]        │
│ Emoji: 🔥 [Change]                  │
│                                     │
│ Tags: [hiit] [no-equipment] [+]     │
│                                     │
│ ☑ Available for Focus Rooms        │
│   Max Participants: [10______]      │
│                                     │
│         [Cancel]  [Save]            │
└─────────────────────────────────────┘
```

### 2. Workout Browser Enhancement

**Current:** Shows only template workouts
**Enhanced:** Shows templates + custom timers with filter options

```javascript
// WorkoutBrowser.js
const WorkoutBrowser = ({ theme, onStartWorkout }) => {
  const [showSource, setShowSource] = useState('all'); // all, templates, custom

  const allTimers = timerService.getAllTimers();

  const filteredTimers = allTimers.filter(t => {
    if (showSource === 'templates' && t.metadata.source !== 'template') return false;
    if (showSource === 'custom' && t.metadata.source !== 'custom') return false;
    // ... existing category/difficulty filters
    return true;
  });

  return (
    <div>
      {/* NEW: Source Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setShowSource('all')}>All</button>
        <button onClick={() => setShowSource('templates')}>Templates</button>
        <button onClick={() => setShowSource('custom')}>My Workouts</button>
      </div>

      {/* Existing category/difficulty filters */}
      {/* Workout cards with edit/delete for custom */}
      {filteredTimers.map(timer => (
        <WorkoutCard
          key={timer.id}
          timer={timer}
          onStart={() => onStartWorkout(timer)}
          onEdit={timer.metadata.isEditable ? () => editTimer(timer) : null}
          onDelete={timer.metadata.isEditable ? () => deleteTimer(timer.id) : null}
        />
      ))}
    </div>
  );
};
```

### 3. Create Room Modal Enhancement

**Current:** Shows predefined room templates
**Enhanced:** Shows all timers flagged as room-compatible

```javascript
// CreateRoomModal.js - add timer/workout selection
<select onChange={(e) => attachTimer(e.target.value)}>
  <option value="">No attached workout</option>
  <optgroup label="Workout Templates">
    {timerService.getAllTimers()
      .filter(t => t.metadata.isRoomCompatible && t.metadata.source === 'template')
      .map(t => (
        <option value={t.id}>{t.emoji} {t.name}</option>
      ))}
  </optgroup>
  <optgroup label="My Workouts">
    {timerService.getAllTimers()
      .filter(t => t.metadata.isRoomCompatible && t.metadata.source === 'custom')
      .map(t => (
        <option value={t.id}>{t.emoji} {t.name}</option>
      ))}
  </optgroup>
</select>
```

---

## Migration Path

### Phase 1: Core Infrastructure (Week 1)
1. Create `timerService.js` with unified data structure
2. Migrate existing workout templates to new structure
3. Add metadata to template definitions
4. Create utility functions (getAllTimers, saveCustomTimer, etc.)

### Phase 2: Composite Timer Enhancement (Week 2)
5. Add metadata fields to save dialog
6. Update localStorage schema for custom timers
7. Add migration logic for existing saved sequences
8. Test save/load workflow

### Phase 3: UI Updates (Week 3)
9. Update WorkoutBrowser to show both sources
10. Add source filter (All/Templates/My Workouts)
11. Add edit/delete for custom timers
12. Update CreateRoomModal to show all compatible timers

### Phase 4: Advanced Features (Week 4+)
13. Add duplicate/clone functionality
14. Implement timer sharing (export/import JSON)
15. Add workout history tracking
16. Implement favorites system
17. Add usage analytics

---

## User Workflows

### Workflow 1: Create Custom Workout from Scratch
1. Go to Timer → Sequence tab
2. Click "Build"
3. Add exercises from saved timers
4. Fill in metadata (name, category, difficulty, emoji)
5. Check "Available for Focus Rooms"
6. Click "Save"
7. Custom workout appears in:
   - Workouts tab (filtered to "My Workouts")
   - Create Room modal (if room-compatible)
   - Timer → Sequence saved list

### Workflow 2: Start Template Workout
1. Go to Workouts tab
2. Browse templates (with category/difficulty filters)
3. Click "Start Solo"
4. Workout loads into sequence timer and auto-starts
5. After completion, history is saved

### Workflow 3: Create Room with Custom Workout
1. Go to Focus Rooms tab
2. Click "Create Room"
3. In "Attach Workout" dropdown:
   - See templates under "Workout Templates"
   - See custom workouts under "My Workouts"
4. Select custom workout
5. Room metadata pre-fills from workout metadata
6. Start room with synced workout

### Workflow 4: Clone & Modify Template
1. Go to Workouts tab
2. Find a template (e.g., "HIIT Beginner")
3. Click "Clone" button (NEW)
4. Opens sequence builder with exercises pre-loaded
5. Modify exercises, adjust durations
6. Save as custom workout
7. Now appears in "My Workouts"

---

## Technical Considerations

### 1. Backwards Compatibility
- Existing saved sequences in localStorage need migration
- Add migration function that runs on app load:

```javascript
const migrateOldSequences = () => {
  const oldSequences = JSON.parse(localStorage.getItem('saved') || '[]')
    .filter(t => t.isSequence);

  const migratedTimers = oldSequences.map(seq => ({
    id: `migrated-${Date.now()}-${Math.random()}`,
    name: seq.name,
    description: '',
    exercises: seq.sequence || [],
    metadata: {
      source: 'custom',
      category: 'mixed',
      difficulty: 'intermediate',
      emoji: '⭐',
      tags: [],
      totalDuration: calculateTotalDuration(seq.sequence),
      createdAt: Date.now(),
      isEditable: true,
      isTemplate: false
    }
  }));

  localStorage.setItem('customTimers', JSON.stringify(migratedTimers));
};
```

### 2. Performance Optimization
- Cache merged timer list in memory
- Only recalculate when localStorage changes
- Use React.useMemo for expensive filters

### 3. Data Validation
- Validate timer structure before saving
- Ensure required fields are present
- Sanitize user input (name, description)

### 4. Future: Cloud Sync
- Once architecture is solid, can add Firebase sync
- Each timer gets `syncedAt` timestamp
- Conflict resolution for cross-device edits

---

## File Structure

```
src/
├── services/
│   ├── workoutTemplates.js      (existing - becomes pure templates)
│   ├── timerService.js          (NEW - unified CRUD operations)
│   └── timerMigration.js        (NEW - one-time migration logic)
│
├── components/
│   └── panels/
│       ├── WorkoutsPanel.js     (existing - enhanced filtering)
│       ├── CompositePanel.js    (existing - enhanced save dialog)
│       └── WorkoutCard.js       (NEW - reusable workout/timer card)
│
└── hooks/
    ├── useTimers.js             (NEW - React hook for timer CRUD)
    └── useTimerHistory.js       (NEW - track usage/stats)
```

---

## Open Questions & Decisions Needed

### Question 1: Focus Room Compatibility
**Should all timers be room-compatible by default?**
- Option A: Yes, all timers can be used in rooms (simpler)
- Option B: User opts in with checkbox (more control)

**Recommendation:** Option B - Let users decide. Some personal timers might not make sense for groups.

### Question 2: Template Editing
**Should users be able to edit pre-made templates?**
- Option A: Templates are read-only, users must clone to edit
- Option B: Users can edit templates, but changes are local

**Recommendation:** Option A - Keeps templates pristine. Users clone and customize.

### Question 3: Categorization
**How strict should categories be?**
- Current: Fixed categories (cardio, strength, etc.)
- Alternative: User-defined tags (more flexible)

**Recommendation:** Both - Fixed categories for filtering + custom tags for search.

### Question 4: Icon System
**Should we expand beyond emojis?**
- Keep: Just emojis (simple, works everywhere)
- Add: Icon library (lucide-react icons)
- Add: Custom image uploads

**Recommendation:** Start with emojis, add icons in Phase 4 if needed.

---

## Next Steps (Immediate)

1. Review this architecture document
2. Decide on open questions
3. Create `timerService.js` with core functions
4. Add metadata to existing workout templates
5. Test unified getAllTimers() function
6. Update WorkoutBrowser to use timerService

**Estimated Time:** 2-3 weeks for full implementation
**Complexity:** Medium (requires careful data migration)
**Impact:** High (solves major architectural pain point)
