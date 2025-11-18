# App.js Modularization Guide

This guide explains how to break down the massive `App.js` (2863 lines) into manageable, reusable components.

## Architecture Overview

```
src/
  App.js (refactored main orchestrator, ~300 lines)
  components/
    index.js (export all components)
    TimerPanel.js ✅ (single timer UI)
    IntervalPanel.js ✅ (work/rest cycles)
    StopwatchPanel.js ✅ (elapsed time display)
    CompositePanel.js (⏳ to create: sequence builder)
    ThemeManager.js (⏳ to create: theme selection & creation)
    SavedTimers.js (⏳ to create: saved timers list)
    FocusRoomsPanel.js (⏳ to create: rooms list & join/create)
  hooks/
    useTimerLogic.js (⏳ to create: extracted timer state & effects)
    useThemeManager.js (⏳ to create: extracted theme state & effects)
    useGamification.js (existing: achievements & stats)
```

## Component Breakdown

### 1. **TimerPanel** ✅ (Done)
- **Purpose:** Single timer (HH:MM:SS input, display, controls)
- **Props:** `time`, `isRunning`, `onStart`, `onPause`, `onReset`, `onInputChange`, `inputHours`, `inputMinutes`, `inputSeconds`, `theme`, `showWarning`, `showCritical`
- **File:** `src/components/TimerPanel.js`

### 2. **IntervalPanel** ✅ (Done)
- **Purpose:** Work/rest interval timer with rounds
- **Props:** `work`, `rest`, `rounds`, `currentRound`, `isWork`, `isRunning`, `time`, `onWorkChange`, `onRestChange`, `onRoundsChange`, `onStart`, `onPause`, `onReset`, `theme`
- **File:** `src/components/IntervalPanel.js`

### 3. **StopwatchPanel** ✅ (Done)
- **Purpose:** Simple elapsed time stopwatch
- **Props:** `time`, `isRunning`, `onStart`, `onPause`, `onReset`, `theme`
- **File:** `src/components/StopwatchPanel.js`

### 4. **CompositePanel** (⏳ To Create)
- **Purpose:** Composite timer sequence builder and display
- **Props:** `sequence`, `currentStep`, `time`, `isRunning`, `onAddStep`, `onRemoveStep`, `onStart`, `onPause`, `onReset`, `onSave`, `theme`
- **Extracted from App.js lines:** ~1000–1200 (sequence management, builder UI)

### 5. **ThemeManager** (⏳ To Create)
- **Purpose:** Theme selection dropdown and custom theme creation modal
- **Props:** `theme`, `themes`, `onThemeSelect`, `onThemeCreate`, `onThemeDelete`, `onShowPicker`
- **Extracted from App.js lines:** ~300–500 (theme UI, color picker)

### 6. **SavedTimers** (⏳ To Create)
- **Purpose:** List of saved timers with quick-access buttons, filtering by group
- **Props:** `saved`, `onLoadTimer`, `onDeleteTimer`, `onCreateTimer`, `theme`
- **Extracted from App.js lines:** ~1400–1600 (saved timers list and actions)

### 7. **FocusRoomsPanel** (⏳ To Create)
- **Purpose:** Display list of active focus rooms, join/create buttons
- **Props:** `rooms`, `currentRoom`, `onJoinRoom`, `onCreateRoom`, `onLeaveRoom`, `getParticipantCount`, `isRoomFull`, `theme`
- **Extracted from App.js lines:** ~2100–2400 (rooms list UI)

## State Hooks to Extract

### **useTimerLogic** (⏳ To Create)
- **Purpose:** Encapsulate all timer state and logic (isRunning, mode, time, ticking, reset, etc.)
- **Exports:**
  ```javascript
  {
    time, setTime,
    isRunning, setIsRunning,
    mode, setMode,
    isWork, setIsWork,
    currentRound, setCurrentRound,
    // ... and all timer-related callbacks
    startTimer, pauseTimer, resetTimer, etc.
  }
  ```
- **Location:** `src/hooks/useTimerLogic.js`

### **useThemeManager** (⏳ To Create)
- **Purpose:** Encapsulate theme state and persistence
- **Exports:**
  ```javascript
  {
    theme,
    themes,
    setTheme,
    createCustomTheme,
    deleteCustomTheme,
    previewTheme,
    setPreviewTheme
  }
  ```
- **Location:** `src/hooks/useThemeManager.js`

## Migration Steps

### Step 1: Extract Timer Logic into Hook (useTimerLogic)
Cut from App.js and move to `src/hooks/useTimerLogic.js`:
- All timer state (`time`, `isRunning`, `mode`, `work`, `rest`, `rounds`, `isWork`, etc.)
- All timer-related effects (interval, ticking, countdown)
- All timer callbacks (`startTimer`, `pauseTimer`, `resetTimer`, `handleComplete`, etc.)

**Result:** App.js loses ~400 lines, gains 1 import.

### Step 2: Extract Theme Logic into Hook (useThemeManager)
Cut from App.js and move to `src/hooks/useThemeManager.js`:
- Theme state (`theme`, `themes`, `showThemes`, `previewTheme`)
- Theme persistence effect
- Theme callbacks (`createCustomTheme`, `deleteCustomTheme`, `setTheme`)

**Result:** App.js loses ~150 lines, gains 1 import.

### Step 3: Replace Timer Display with Components
In App.js main render, replace the large timer display code with:
```javascript
{activeMainTab === 'timer' && (
  <TimerPanel
    time={time}
    isRunning={isRunning}
    onStart={() => startTimer(time)}
    onPause={() => setIsRunning(false)}
    onReset={() => resetTimer()}
    onInputChange={handleTimerInput}
    inputHours={inputHours}
    inputMinutes={inputMinutes}
    inputSeconds={inputSeconds}
    theme={theme}
    showWarning={showWarning}
    showCritical={showCritical}
  />
)}
{activeMainTab === 'interval' && (
  <IntervalPanel
    work={work}
    rest={rest}
    rounds={rounds}
    currentRound={currentRound}
    isWork={isWork}
    isRunning={isRunning}
    time={time}
    onWorkChange={setWork}
    onRestChange={setRest}
    onRoundsChange={setRounds}
    onStart={startInterval}
    onPause={() => setIsRunning(false)}
    onReset={resetInterval}
    theme={theme}
    showWarning={showWarning}
    showCritical={showCritical}
  />
)}
// ... etc
```

**Result:** App.js loses ~1000 lines (display logic), gains imports and component JSX.

### Step 4: Extract FocusRooms into Component (FocusRoomsPanel)
Move focus rooms UI from App.js into `src/components/FocusRoomsPanel.js`.

**Result:** App.js loses ~300 lines.

### Step 5: Extract Theme UI into Component (ThemeManager)
Move theme picker, color picker, and custom theme modal into `src/components/ThemeManager.js`.

**Result:** App.js loses ~200 lines.

## Refactored App.js Structure

After refactoring, `App.js` will look roughly like:

```javascript
import React, { useState, useEffect } from 'react';
import { TimerPanel, IntervalPanel, StopwatchPanel, FocusRoomsPanel, ThemeManager } from './components';
import { useTimerLogic } from './hooks/useTimerLogic';
import { useThemeManager } from './hooks/useThemeManager';
import { useGamification } from './hooks/useGamification';
import useFocusRoom from './hooks/useFocusRoom';

export default function TimerApp() {
  // Extracted hooks (now ~50 lines each, very focused)
  const timerLogic = useTimerLogic();
  const themeManager = useThemeManager();
  const { currentStreak, achievements } = useGamification();
  const {
    rooms, currentRoom, createRoom, joinRoom, leaveRoom, deleteRoom, updateRoomSettings
  } = useFocusRoom();

  // Main UI state (focus tab, modals, toast, etc.) — remaining focused state management
  const [activeMainTab, setActiveMainTab] = useState('timer');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // ... a few more focused states

  return (
    <div style={{ /* main styles */ }}>
      {/* Top navigation bar */}
      <div style={{ /* tab buttons */ }}>
        {/* Tab buttons: Timer, Interval, Stopwatch, Composite, Stats, etc. */}
      </div>

      {/* Main content area */}
      {activeMainTab === 'timer' && <TimerPanel {...timerLogic} theme={themeManager.theme} />}
      {activeMainTab === 'interval' && <IntervalPanel {...timerLogic} theme={themeManager.theme} />}
      {activeMainTab === 'stopwatch' && <StopwatchPanel {...timerLogic} theme={themeManager.theme} />}
      {activeMainTab === 'focus' && <FocusRoomsPanel rooms={rooms} currentRoom={currentRoom} theme={themeManager.theme} {...focusRoomHandlers} />}
      {activeMainTab === 'themes' && <ThemeManager {...themeManager} />}

      {/* Toasts and modals */}
      {showToast && <Toast message={toastMessage} />}
      {/* ... other modals */}
    </div>
  );
}
```

**Final App.js size:** ~400–500 lines (down from 2863).

## Benefits of Modularization

| Benefit | Impact |
|---------|--------|
| **Maintainability** | Single responsibility principle: each component/hook does one thing |
| **Reusability** | Components can be used in other projects or views |
| **Testability** | Smaller units are easier to unit-test |
| **Performance** | React.memo can be applied per-component to prevent unnecessary re-renders |
| **Readability** | New developers can understand the structure quickly |
| **Collaboration** | Multiple developers can work on different components without conflicts |

## Next Steps

1. ✅ **Create TimerPanel, IntervalPanel, StopwatchPanel** (done)
2. ⏳ **Create useTimerLogic hook** — Extract ~400 lines of timer state & logic
3. ⏳ **Create useThemeManager hook** — Extract ~150 lines of theme state
4. ⏳ **Create CompositePanel** — Move sequence builder UI (~200 lines)
5. ⏳ **Create ThemeManager component** — Move theme selection & creation UI (~150 lines)
6. ⏳ **Create SavedTimers component** — Move saved timers list UI (~150 lines)
7. ⏳ **Create FocusRoomsPanel component** — Move rooms list UI (~200 lines)
8. ⏳ **Refactor App.js** — Wire together extracted modules (~400 lines final)
9. ⏳ **Test & verify** — Ensure no functionality is lost during refactoring

Would you like me to start with **useTimerLogic hook extraction** next?
