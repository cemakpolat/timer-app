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
