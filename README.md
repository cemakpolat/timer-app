# ⏱️ Modern Timer App

A beautiful, feature-rich timer application designed for millions of users. Built with React, featuring gamification, social elements, and immersive focus experiences - all without requiring a backend!

## 🌟 Features

### Core Timer Functionality
- **⏱️ Timer Mode** - Set custom timers with HH:MM:SS input or quick presets
- **⏱️ Stopwatch Mode** - Track elapsed time
- **⚡ Interval Timer** - Pomodoro technique with customizable work/rest cycles
- **🔗 Chain Timers (Sequences)** - Build multi-step timer sequences with visual progress
- **💾 Saved Timers** - Save favorite timers with colors, groups, and custom names
- **🎨 5 Beautiful Themes** - Midnight, Ocean, Forest, Purple, Warm Grey
- **🎬 Immersive Scenes** - 8 contextual backgrounds that transform your focus environment
  - ☕ Coffee Break - Warm brown tones
  - 🧠 Deep Work - Deep purple focus environment
  - 💪 Exercise - Energizing red
  - 📚 Reading - Calm green
  - 🧘 Meditation - Peaceful grey
  - 🎨 Creative Work - Vibrant orange
  - 📖 Study Session - Concentration blue
  - 👥 Meeting - Professional purple
- **🔔 Sound Controls** - Bell, Chime, or Silent with volume adjustment
- **🎉 Celebration Screens** - Confetti animations when completing sessions

### Engagement & Gamification
- **🏆 Achievement System** (8 Badges)
  - 🎯 First Steps - Complete your first timer
  - 🌅 Early Bird - Complete timer before 7 AM
  - 🦉 Night Owl - Complete timer after 10 PM
  - 💯 Century Club - Complete 100 timers
  - 🔥 Week Warrior - 7-day streak
  - 👑 Month Master - 30-day streak
  - ⚡ Speed Demon - 10 timers in one day
  - 🏆 Dedicated - Complete 500 timers

- **🎯 Daily Challenges** - Rotating daily goals
- **🔥 Streak Tracking** - Build and maintain daily completion streaks
- **📊 Progress Stats** - Day streak, total completions, saved timers count
- **📈 Monthly Comparison** - Compare this month vs last month performance

### Smart Features
- **✨ Smart Insights** - AI-like pattern recognition
- **📩 Time Capsule** - Write messages to your future self (30-day delay)
- **🔴 "Active Now" Counter** - See how many people are focusing right now
- **📜 History Tracking** - Last 10 completed sessions with timestamps

### Sharing & Portability
- **🔗 URL-Based Sharing** - Share any timer setup via encoded link
- **💾 Export/Import** - Full data backup & restore

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

The app will open at `http://localhost:3000`

## 📖 Usage Guide

### Creating a Quick Timer
1. Click on "Timer" mode
2. Enter time in HH:MM:SS format or use quick presets
3. Click Play button
4. Optional: Click "Share" to get a shareable link

### Using Interval Timer (Pomodoro)
1. Click on "Interval" mode
2. Set Work/Rest durations and Rounds
3. Click "Start Interval"
4. Watch progress with visual indicators

### Building Chain Timers (Sequences)
1. Go to "Chain Timers" section
2. Click "Build" button
3. Add timers from your saved list
4. Reorder with up/down arrows
5. Click "Save" or "Start"

### Using Immersive Scenes
1. Create a new timer or edit an existing one
2. Select a scene from the "Immersive Scene" dropdown
3. Each scene provides contextual background gradients:
   - **Coffee Break** ☕ - Perfect for 5-15 minute breaks
   - **Deep Work** 🧠 - Ideal for focused work sessions (25-90 min)
   - **Exercise** 💪 - Great for workout timers
   - **Reading** 📚 - Calm environment for reading sessions
   - **Meditation** 🧘 - Peaceful atmosphere for mindfulness
   - **Creative Work** 🎨 - Vibrant setting for creative tasks
   - **Study Session** 📖 - Concentration-enhancing blue tones
   - **Meeting** 👥 - Professional setting for timed meetings
4. When the timer runs, the entire app transforms with the chosen scene
5. Scenes work beautifully with **Chain Timers** - each step can have its own scene!
   - Example: Deep Work → Coffee Break → Deep Work sequence automatically transitions

### Daily Challenge & Time Capsule
- Daily challenges update automatically each day
- Time capsules open after 30 days
- Progress tracked in real-time

### Backup & Restore
- **Export:** Downloads `timer-backup-YYYY-MM-DD.json`
- **Import:** Restores all data from backup file

## 🏗️ Architecture

### Tech Stack
- **React** - UI framework
- **localStorage** - Data persistence (no backend needed!)
- **Web Audio API** - Alarm sounds
- **Page Visibility API** - Background time tracking

### No Backend Required
- ✅ 100% client-side application
- ✅ Works completely offline
- ✅ No authentication needed
- ✅ Privacy-first (all data stays on device)

## 📊 Data Storage

All data stored in browser's localStorage:
- Saved timers & sequences
- History & statistics
- Achievements & streaks
- Monthly stats
- Time capsules
- Preferences

## 🐛 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Chrome/Safari

## 🔒 Privacy

- **No tracking** - No analytics
- **Local-only** - All data stays on your device
- **No accounts** - No personal information collected
- **Offline capable** - Works without internet

## 📝 License

MIT License

---

**Made with ❤️ for productive people everywhere**

⭐ Star this repo if you find it useful!