# ⏱️ Timer App - User Guide & Features

Complete guide to the Timer App features, functionality, and usage.

## Table of Contents

- [Core Features](#core-features)
- [Usage Guide](#usage-guide)
- [Gamification System](#gamification-system)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)

## Core Features

### Timer Mode
**Purpose**: Set and run a single timer with custom duration.

**How to Use**:
1. Click on "Timer" tab
2. Enter time in HH:MM:SS format (e.g., 00:25:00 for 25 minutes)
3. Or use quick preset buttons (5m, 10m, 25m, 45m, 60m)
4. Click Play button to start
5. Adjust volume or sound type before starting

**Features**:
- Custom duration input with validation
- Quick preset buttons
- Sound selection (Bell, Chime, Silent)
- Volume control (0-100%)
- Pause/Resume functionality
- Stop/Reset capability

### Stopwatch Mode
**Purpose**: Track elapsed time from zero.

**How to Use**:
1. Click on "Stopwatch" tab
2. Click Play to start
3. Press Pause to pause
4. Press Resume to continue
5. Click Reset to start over

**Features**:
- Millisecond precision
- Lap tracking (press Lap button)
- Pause/Resume
- Full reset capability

### Interval Timer (Pomodoro)
**Purpose**: Run work/rest cycles, perfect for Pomodoro technique.

**How to Use**:
1. Click on "Interval" tab
2. Set "Work Duration" (default 25 min)
3. Set "Rest Duration" (default 5 min)
4. Set "Rounds" (number of cycles)
5. Click "Start Interval"
6. Watch progress with visual indicators

**Features**:
- Customizable work/rest durations
- Multiple rounds configuration
- Visual progress indicators
- Automatic transitions
- Sound alerts between rounds
- Total estimated time display

**Typical Use Cases**:
- Pomodoro Technique: 25min work, 5min rest, 4 rounds
- Extended Focus: 45min work, 10min rest, 2 rounds
- Short Bursts: 10min work, 2min rest, 8 rounds

### Chain Timers (Sequences)
**Purpose**: Create multi-step timer sequences for complex workflows.

**How to Use**:
1. Go to "Chain Timers" section
2. Click "Build" button
3. Select timers from your saved list
4. Arrange order using up/down arrows
5. Customize each step (optional)
6. Click "Save" to store or "Start" to run

**Features**:
- Combine multiple saved timers
- Custom ordering
- Visual preview
- Automatic progression
- Individual alerts between steps
- Save for reuse

**Examples**:
```
Morning Routine:
  1. Meditation (10 min)
  2. Exercise (30 min)
  3. Shower (15 min)

Study Session:
  1. Reading (25 min)
  2. Notes Review (10 min)
  3. Break (5 min)
  4. Problem Solving (25 min)
  5. Rest (15 min)
```

### Immersive Scenes
**Purpose**: Transform app appearance for different activities.

**Available Scenes**:

| Scene | Duration | Use Case |
|-------|----------|----------|
| ☕ Coffee Break | 5-15 min | Quick breaks with warm ambiance |
| 🧠 Deep Work | 25-90 min | Focused work sessions |
| 💪 Exercise | 10-60 min | Workout timers with energy |
| 📚 Reading | 20-60 min | Calm reading environment |
| 🧘 Meditation | 5-30 min | Peaceful mindfulness |
| 🎨 Creative Work | 30-120 min | Vibrant creative sessions |
| 📖 Study Session | 25-90 min | Concentration-enhancing blues |
| 👥 Meeting | 15-60 min | Professional meeting timer |

**How to Apply**:
1. Create new timer or edit existing
2. Select scene from "Immersive Scene" dropdown
3. Scene applies when timer starts
4. Persists through entire timer duration
5. Transitions smoothly between scenes in Chain Timers

## Usage Guide

### Creating Your First Timer

#### Quick Timer (5 seconds)
```
1. Click "Timer" tab
2. Click "5m" preset button
3. Click Play
4. Watch your first timer run!
```

#### Custom 45-Minute Focus Session
```
1. Click "Timer" tab
2. Enter "00:45:00" in time input
3. Select "Deep Work" scene
4. Change sound to "Bell"
5. Click Play
6. Focus for 45 minutes
```

#### Pomodoro Workflow
```
1. Click "Interval" tab
2. Work Duration: 25 min
3. Rest Duration: 5 min
4. Rounds: 4
5. Click "Start Interval"
6. Complete 4 rounds = ~2 hours of productivity
```

### Saving Your Favorite Timers

1. Create a timer with preferred settings
2. Click "Save Timer" button
3. Enter name (e.g., "Quick Focus")
4. Choose color (for visual identification)
5. Add to group (optional)
6. Click "Save"

**Saved Timers Appear In**:
- Quick access from main screen
- Chain Timer builder
- History for quick re-running

### Using Focus Rooms (Collaborative Focus)

**Purpose**: Connect with others for focused sessions.

**How to Use**:
1. Click "Focus Rooms" tab
2. Browse active rooms or create new
3. Click "Join Room"
4. Set your timer
5. See active participants
6. Encourage each other with reactions
7. Celebrate completions together

**Features**:
- Real-time participant list
- "Active Now" counter
- Shared completion notifications
- Room chat/reactions
- Join/leave without penalty

## Gamification System

### Achievement Badges (8 Total)

| Badge | Requirement | Type |
|-------|-------------|------|
| 🎯 First Steps | Complete 1 timer | Welcome |
| 🌅 Early Bird | Complete timer before 7 AM | Time-based |
| 🦉 Night Owl | Complete timer after 10 PM | Time-based |
| 💯 Century Club | Complete 100 timers | Milestone |
| 🔥 Week Warrior | 7-day streak | Streak |
| 👑 Month Master | 30-day streak | Streak |
| ⚡ Speed Demon | 10 timers in one day | Intensity |
| 🏆 Dedicated | Complete 500 timers | Mastery |

### Streak System

**Daily Streak**:
- Increases by 1 for each day with ≥1 completed timer
- Resets to 0 if day is missed
- Displayed in stats

**Weekly Streak**:
- Requires 7 consecutive days
- Unlocks "Week Warrior" badge
- Bonus points/rewards

**Monthly Streak**:
- Requires 30 consecutive days
- Unlocks "Month Master" badge
- Special recognition

### Stats & Progress

**Dashboard Shows**:
- Today's completions
- Current streak
- Total timers completed
- Personal best day
- Monthly progress vs last month
- All badges earned

**History Tracking**:
- Last 10 completed sessions
- Session timestamps
- Duration actual vs target
- Scene used
- Achievements unlocked

## Advanced Features

### URL-Based Sharing

**Share Any Timer Setup**:
1. Create/configure a timer
2. Click "Share" button
3. Copy generated link
4. Share with others
5. Recipients can open link to get exact same setup

**Shared Information**:
- Timer duration
- Scene selection
- Sound preferences
- Any custom settings

**Privacy**:
- No personal data shared
- Just the timer configuration
- Others can modify for themselves

### Export & Backup

**Export Your Data**:
1. Settings → Data Management
2. Click "Export All Data"
3. Saves `timer-backup-YYYY-MM-DD.json`
4. Contains all timers, stats, achievements

**Import Data**:
1. Settings → Data Management
2. Click "Choose File"
3. Select backup JSON file
4. Confirm import
5. All data restored

**Use Cases**:
- Switch devices
- Restore after factory reset
- Share data with trusted person
- Backup important statistics

### Time Capsule

**Write to Future Self**:
1. Click "Time Capsule" section
2. Click "New Capsule"
3. Write message to yourself
4. Set delivery date (default +30 days)
5. Click "Send to Future"

**What Happens**:
- Message locked for specified days
- Automatic delivery notification
- Opens on specified date
- Perfect for motivation/goals

**Use Cases**:
- Motivational messages
- Goal reminders
- Progress check-ins
- Future milestone celebrations

### Active Now Counter

**See Community Activity**:
- Real-time count of users currently running timers
- Updates every 5 seconds
- Shows popularity at different times
- Great for motivation ("1,247 people focusing now!")

**Data Collection**:
- Aggregate only (no individual tracking)
- Privacy-preserving
- Opt-in via settings

### Daily Challenge

**Complete Daily Goals**:
1. Go to "Stats & History" → "Achievements" tab
2. View your daily challenge at the bottom
3. Complete the specified goal (e.g., "Complete 3 timers today")
4. Track progress with visual progress bar
5. Get rewarded when completed ✅

**Features**:
- Dynamic challenges that change daily
- Progress tracking with visual indicators
- Achievement integration
- Motivational goal setting

**Example Challenges**:
- "Complete 3 timers today"
- "Focus for 90 minutes total"
- "Try a new timer scene"
- "Create and save a custom timer"

### Custom Theme Creation

**Create Unlimited Themes**:
1. Click the theme selector button (🎨)
2. Choose from 5 built-in themes or click "Add Theme"
3. Use the color picker to customize:
   - Background color
   - Card color
   - Accent color
   - Text color
4. Name your theme and save
5. Switch between themes instantly

**Features**:
- Full color customization
- Unlimited custom themes
- Live preview before saving
- Delete unwanted themes
- Persist across sessions

**Color Picker Options**:
- Hex color input
- Visual color wheel
- RGB sliders
- Color presets

### Sound Settings

**Customize Audio Experience**:
1. Click the sound button (🔊) in the top-right
2. Choose alarm sound type:
   - 🔔 Bell (default)
   - 🎵 Chime
   - 🔇 Silent
3. Adjust volume with slider (0-100%)
4. Settings apply to all timers

**Features**:
- Multiple alarm sound options
- Volume control
- Persistent settings
- Preview sounds before selecting

### Ambient Music Library
The app includes a curated library of ambient music tracks for different activities:

- **🎷 Jazz Music**: Guitar and piano jazz for general ambiance
- **🧘 Therapy Music**: Meditation, relaxation, and healing tracks
- **💼 Productivity Music**: Focus music for deep work, pomodoro sessions, coffee breaks, and workouts

**Access**: Click the music note button (🎵) to open ambient music settings.

> 📖 **Technical Details**: See [AUDIO_STORAGE.md](AUDIO_STORAGE.md) for complete audio storage setup, file management, and migration options.

## Troubleshooting

### Timer Won't Start
**Solutions**:
1. Ensure duration > 0
2. Check browser permissions
3. Clear browser cache
4. Refresh page and retry

### Sound Not Playing
**Solutions**:
1. Check volume slider (not at 0%)
2. Check system volume
3. Allow audio permissions in browser
4. Try different sound option
5. Restart browser

### Data Not Saving
**Solutions**:
1. Check localStorage is enabled
2. Clear browser cache/cookies
3. Check available storage space
4. Export data to backup
5. Try different browser

### Streak Broken Unexpectedly
**Solutions**:
1. Streaks reset at midnight (your timezone)
2. Must complete ≥1 timer per day to maintain
3. Browser data cleared resets streaks
4. Check backup file for historical data

### Performance Issues
**Solutions**:
1. Clear browser cache
2. Disable background extensions
3. Close other tabs/apps
4. Restart browser
5. Update to latest browser version

---

**Happy Timing! 🎯**

## Phase 1-3: Room Lifecycle Management

### Overview
Implemented room cleanup feature with stale participant detection and timer expiration UI.

### Phase 1: Stale Participant Detection ✅

Participants with no presence update for **5+ minutes** are marked as "stale" and automatically removed from the room's participant list. If the room owner is stale, a flag `ownerDisconnected = true` is set on the room.

**Configuration**: 5-minute stale threshold (configurable in `functions/index.js`), runs every 15 minutes via scheduled Cloud Function.

### Phase 3: Timer Expiration UI with Extension ✅

#### For Room Owner:
- Shows timer countdown (2-min grace period before auto-close)
- Dropdown to select extension (5, 10, 15, 20, 25, or 30 minutes)
- "Extend Timer" button to add time
- "Close Room Now" button to close immediately

#### For Non-Owners:
- Shows "Owner is deciding..." message
- "Leave Room" option
- Cannot extend or close (owner-only privilege)

**Implementation Files**:
- `src/components/FocusRooms/RoomExpirationModal.js` - Modal component
- `src/services/firebase/FirebaseService.js` - `extendRoomTimer()` method
- `src/hooks/useFocusRoom.js` - `extendTimer()` hook function
- `src/App.js` - Integration and event handling

## 5 New Features Implementation ✅

### Task 1: Cancel Button for Timer Creation ✅

Added `cancelCreateTimer()` function that resets form state and closes the modal. Timer creation UI displays two buttons side-by-side: "Create Timer" and "Cancel". The cancel button uses an X icon and resets all form fields (name, duration, unit, color, group, scene).

**File**: `src/App.js`

### Task 2: Hide Sequences in Composite Group ✅

Modified `filteredGroups` logic to exclude "Sequences" when `activeMainTab === 'composite'`. Sequences remain available in the main "timer" tab.

**File**: `src/App.js`

### Task 3: Phase 2a Room Scheduling ✅

**Database Schema Changes**:
- Added `scheduledFor` field (timestamp) to room object
- Added `status` field with values: "scheduled", "active", "completed"
- Rooms with future `scheduledFor` are created with status="scheduled"

**UI/UX Enhancements**:
- Date/time picker in CreateRoomModal (toggle with "Schedule for Later" button)
- Visual indicator (📅 Scheduled badge) on scheduled rooms
- Displays scheduled time instead of timer countdown
- "Not Ready" button state prevents joining before scheduled time
- Export button available for scheduled rooms (for calendar integration)

**Cloud Functions**:
- New `activateScheduledRooms()` function runs on schedule (default: every 15 minutes)
- Automatically changes status from "scheduled" → "active" when `now >= scheduledFor`
- Retries with exponential backoff for robustness
- Logs all activations for debugging

**Files Modified**:
- `src/services/firebase/FirebaseService.js` - Updated `createFocusRoom()` to support scheduling
- `src/components/FocusRooms/CreateRoomModal.js` - Added date/time picker UI
- `src/App.js` - Updated room display to show scheduled status
- `functions/index.js` - Added `activateScheduledRooms()` Cloud Function

### Task 4: Room Creation Limits ✅

**Implementation in `FirebaseService.createFocusRoom()`**:
- **Per-user limit**: Checks if user already has an active room (via `userRooms/{userId}`)
- **Global limit**: Counts all non-completed rooms and prevents creation if >= 100
- Throws descriptive error messages for both cases

**Error Messages**:
1. Per-user: "You already have an active room. Leave your current room before creating a new one."
2. Global: "Maximum number of active rooms (100) has been reached. Please try again later."

**File**: `src/services/firebase/FirebaseService.js`

### Task 5: Calendar Export Feature ✅

**Calendar Service Functions** (`src/services/calendar/calendarService.js`):
1. **`generateICSContent(room)`** - Generates RFC 5545 compliant ICS format
2. **`downloadICSFile(room)`** - Download .ics file locally
3. **`generateGoogleCalendarURL(room)`** - Generate Google Calendar link
4. **`downloadMultipleRoomsAsICS(rooms)`** - Batch export for multiple rooms

**UI Components**:
- **Export Button** on scheduled rooms (green "Export" button)
- **Calendar Export Modal** with two options:
  - "Download .ics File" - Local file download for import later
  - "Add to Google Calendar" - Direct Google Calendar integration
  - Cancel option to dismiss modal
- **Toast Notifications** for success/failure feedback

**Export Flow**:
1. User clicks "Export" button on scheduled room
2. Modal opens showing room details and two export options
3. **Option A**: Download .ics file (can import to Outlook, Apple Calendar, etc.)
4. **Option B**: Open Google Calendar directly and add event

**Files Created/Modified**:
- New: `src/services/calendar/calendarService.js` - Calendar export utilities
- Modified: `src/App.js` - UI integration, state management, handlers

## Deployment Guide

### Pre-Deployment Checklist
- [ ] Review all changes in feature documentation
- [ ] Run tests for all features
- [ ] Verify Firebase Database Rules are up-to-date
- [ ] Ensure Cloud Functions have correct environment variables
- [ ] Backup current Firebase Realtime Database

### Deployment Steps

#### 1. Deploy Frontend (React App)

```bash
cd /Users/cemakpolat/Development/timer-app
npm install
npm run build
firebase deploy --only hosting
```

#### 2. Deploy Cloud Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

#### 3. Verify Deployment

```bash
firebase functions:log
```

### Feature Validation After Deployment

#### Task 1: Cancel Button
- [ ] Open app in browser
- [ ] Go to Timer tab → Create button
- [ ] Verify "Cancel" button appears next to "Create Timer"
- [ ] Click Cancel and verify form closes

#### Task 2: Hide Sequences
- [ ] Go to Timer tab → create a sequence
- [ ] Switch to Composite tab
- [ ] Try to create a timer → verify "Sequences" not in group dropdown
- [ ] Switch back to Timer tab → verify "Sequences" appears

#### Task 3: Room Scheduling
- [ ] Go to Focus Rooms → Create Room
- [ ] Toggle "Schedule for Later" button
- [ ] Pick a future date/time
- [ ] Create room
- [ ] Verify room shows "📅 Scheduled" badge
- [ ] Verify "Not Ready" button (disabled)

#### Task 4: Room Limits
- [ ] Create one active room
- [ ] Try creating another → verify error: "You already have an active room"
- [ ] Leave the room
- [ ] Create new room → verify success

#### Task 5: Calendar Export
- [ ] Create a scheduled room
- [ ] Look for green "Export" button on the room card
- [ ] Click Export → verify modal opens
- [ ] Click "Download .ics File" → verify file downloads
- [ ] Click "Add to Google Calendar" → verify Google Calendar opens

#### Additional Features Validation

##### Daily Challenge
- [ ] Go to Stats & History → Achievements tab
- [ ] Scroll to bottom → verify Daily Challenge section
- [ ] Check progress bar updates as you complete timers
- [ ] Verify challenge completion shows ✅

##### Custom Themes
- [ ] Click theme selector button (🎨)
- [ ] Click "Add Theme" → verify color picker modal opens
- [ ] Customize colors and name theme
- [ ] Save theme → verify it appears in theme list
- [ ] Switch to custom theme → verify colors apply

##### Sound Settings
- [ ] Click sound button (🔊) in top-right
- [ ] Verify dropdown with sound type selector and volume slider
- [ ] Change sound type and volume
- [ ] Start a timer → verify settings apply to alarm

### Rollback Procedure

If issues occur:

```bash
firebase deploy --only hosting
cd functions && npm install && firebase deploy --only functions
```

---

**Happy Timing! 🎯**
