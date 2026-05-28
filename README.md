
# 🎯 Timer App (v1.0.0+)

Timer App is a modern, collaborative, and highly customizable timer platform for productivity, workouts, study, and group focus. It features social focus rooms, flexible timer modes (single, interval, sequence), immersive scenes, achievements, and a unified architecture for both custom and template-based routines.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Development](#development)
- [Deployment](#deployment)


## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (for deployment)
- Google Cloud account (for infrastructure)

### Local Development
```bash
git clone https://github.com/cemakpolat/timer-app.git
cd timer-app
npm install
npm start
```
The app will open at `http://localhost:3000`

### Build & Test
```bash
npm run build      # Production build
npm test           # Run tests
```


## 🌟 Features

### Social & Collaborative
- **👥 Focus Rooms**: Real-time group focus, presence, and chat
- **📅 Room Scheduling**: Plan sessions in advance, auto-activate rooms
- **🔗 URL Sharing**: Share timer setups and routines via links

### Flexible Timer System
- **⏱️ Single Timers**: Custom duration, presets, and sound options
- **⚡ Interval Timers**: Pomodoro, HIIT, and custom work/rest cycles
- **🔗 Sequences (Composite Timers)**: Multi-step routines for workouts, study, or creative flows
- **🏃‍♂️ Templates & Custom Routines**: Use built-in templates or build your own

### Personalization & Immersion
- **🎨 Custom Themes**: Unlimited color schemes, Minimal/Clean modes
- **🎬 Immersive Scenes**: Coffee shop, gym, forest, and more
- **🖼️ Background Images + Videos**: Upload and use local media backgrounds (plus remote media sources)
- **🧩 Mixed-Media Slide Sets**: Build ordered slide sets with both images and videos in one sequence
- **🌊 Universal Crossfade Transitions**: Smooth transitions for image→image, video→video, and image↔video
- **🎞️ Smart Slide Playback**: Image slides use the configured interval, video slides play full duration then auto-advance
- **🔊 Ambient Music**: Built-in and custom audio for focus or relaxation
- **📱 Mobile Optimized**: Fully responsive for all devices

### Input & Editing UX
- **⌨️ Better Numeric Editing**: Timer, interval, and slide interval fields now allow temporary empty edits while typing
- **✅ Safe Value Commit**: Numeric values are normalized on blur/confirm instead of forcing immediate 0 while editing

### Engagement & Tracking
- **🏆 Achievements**: Badges for milestones, streaks, and challenges
- **🔥 Streaks**: Daily, weekly, and monthly focus streaks
- **📊 Analytics**: Progress, history, and session stats
- **🎯 Daily Challenges**: Dynamic goals for extra motivation

### Portability & Data
- **💾 Export/Import**: Backup and restore all data
- **🔗 URL-Based Sharing**: Share any timer or routine


## 🏗️ System Architecture

### Tech Stack
- **Frontend**: React 18+, CSS Modules, Custom Hooks
- **Backend**: Firebase Realtime Database, Cloud Functions
- **Infrastructure**: Google Cloud Platform (Terraform)
- **CI/CD**: GitHub Actions
- **Hosting**: Firebase Hosting
- **Storage**: Cloud Storage, IndexedDB (for music and uploaded background media)

### Layered Architecture
1. **Presentation**: React components (TimerPanel, IntervalPanel, StopwatchPanel, FocusRooms, etc.)
2. **State Management**: React Context, custom hooks, localStorage
3. **Service Layer**: Firebase SDK, timerService, storageService, shareService
4. **Backend**: Firebase Realtime DB, Cloud Functions, Cloud Storage

### Data Flow
```
User → React App → Context/Services → Firebase SDK →
   → Realtime DB / Cloud Functions / Storage
```

### Unified Timer/Workout Model
All routines (custom or template) use a unified data structure:
```js
{
   id, name, description,
   exercises: [ { name, duration, unit, type, color, scene } ],
   metadata: { source, category, difficulty, emoji, tags, ... }
}
```

### Storage
- **Templates**: Hardcoded in code (read-only)
- **Custom**: Saved in localStorage (editable)
- **Combined**: Merged at runtime for unified experience


## 📁 Project Structure

```
timer-app/
├── src/
│   ├── components/          # React UI components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Business logic (timerService, Firebase, etc.)
│   ├── context/             # React context providers
│   ├── utils/               # Utility functions/constants
│   └── styles/              # Global styles
├── infrastructure/          # Terraform & GCP config
├── functions/               # Cloud Functions (Node.js)
├── .github/workflows/       # GitHub Actions (CI/CD)
└── docs/                    # Documentation (features, infra, CI/CD, etc.)
```


## 📚 Documentation

See the `docs/` folder for full details:
- **TIMER_APP.md**: Full feature/user guide
- **WORKOUT_ARCHITECTURE.md**: Unified timer/workout model
- **ARCHITECTURE.md**: System & component architecture
- **FIREBASE.md**: Firebase setup, schema, and security
- **CICD.md**: CI/CD pipeline and deployment
- **INFRASTRUCTURE.md**: Terraform, GCP, and infra setup
- **AUDIO_STORAGE.md**: Audio/music storage and migration


## 💻 Development & Usage

### 1. Clone & Install
```bash
git clone https://github.com/cemakpolat/timer-app.git
cd timer-app
npm install
```

### 2. Configure Firebase (optional for local dev)
- Create `.env.local` with Firebase config (see `docs/FIREBASE.md`)
- Or use mock Firebase for testing

### 3. Start the App
```bash
npm start
```
App runs at [http://localhost:3000](http://localhost:3000)

### 4. Build & Test
```bash
npm run build   # Build for production
npm test        # Run tests
```

### 5. Key Components & Hooks
- `TimerPanel`, `IntervalPanel`, `StopwatchPanel`, `FocusRooms`, `ThemeManager`, `CompositePanel`, etc.
- Custom hooks: `useTimer`, `useFocusRoom`, `useGamification`, `useNotifications`, `usePresence`
- Services: `timerService`, `FirebaseService`, `storageService`, `shareService`

### 6. Code Style
- ESLint & Prettier for formatting
- Pre-commit hooks via husky (if configured)


## 🚀 Deployment & CI/CD

### Automated Pipeline
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)
- **Stages**: Infrastructure (Terraform) → Build (React) → Deploy (Firebase Hosting)

### Manual Deployment
```bash
npm run build
firebase deploy --project timerapp-2997d
```

### Environment Variables
- `CREDENTIALS_ENCRYPTION_KEY` (for secrets)
- `FIREBASE_DEPLOY_TOKEN` (for deploy)
- `REACT_APP_SUPPORT_STRIPE_URL` (optional Stripe hosted checkout/payment link)
- `REACT_APP_SUPPORT_PAYPAL_URL` (optional PayPal payment link)
- `REACT_APP_SUPPORT_KOFI_URL` (optional Ko-fi support link)
- `REACT_APP_SUPPORT_BMC_URL` (optional Buy Me a Coffee link)
- `REACT_APP_SUPPORT_CHECKOUT_URL` (optional fallback/custom payment link)

Support links are used by the supporter modal in the app header (beer icon). Use hosted checkout providers (Stripe Payment Links, PayPal, Ko-fi, etc.) rather than collecting card data in-app. For thank-you handling after checkout, configure your provider return URLs with query params like `?support=success&amount=5` and cancel URLs with `?support=cancel`.

Payment methods are modular and config-based in [src/config/supportPayments.config.js](src/config/supportPayments.config.js).
To add a new provider later:
1. Add a new entry to `PAYMENT_METHOD_DEFINITIONS` with `id`, `label`, and `envVar`.
2. Add that env var to your deployment/local environment.
3. The support dropdown will include it automatically when the link is configured.

### Monitoring
- Firebase Console (realtime, hosting)
- Google Cloud Console (infra)
- GitHub Actions (CI/CD logs)


## 🔐 Security & Privacy

- **Database Rules**: See `infrastructure/database-rules.json` (auth required, user data isolation, room validation)
- **API Security**: Firebase Security Rules, no secrets in client code
- **Data Privacy**: User data by UID, no sharing without consent, GDPR-compliant


## 🤝 Contributing

Contributions are welcome!
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a pull request


## 📄 License

MIT License - free for personal or commercial use.


## 🆘 Support & Issues
- **Bugs**: GitHub Issues
- **Features**: GitHub Discussions
- **Docs**: See `docs/` folder

---

**Made with ❤️ for productive people everywhere**

⭐ Star this repo if you find it useful!
