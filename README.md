# ⏱️ Modern Timer App

A beautiful, feature-rich timer application designed for productivity enthusiasts. Built with React and powered by Firebase Realtime Database, featuring gamification, social elements, and immersive focus experiences.

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
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The app will open at `http://localhost:3000`

## 🌟 Features

### Core Timer Functionality
- **⏱️ Timer Mode** - Set custom timers with HH:MM:SS input or quick presets
- **⏱️ Stopwatch Mode** - Track elapsed time
- **⚡ Interval Timer** - Pomodoro technique with customizable work/rest cycles
- **🔗 Chain Timers (Sequences)** - Build multi-step timer sequences with visual progress
- **💾 Saved Timers** - Save favorite timers with colors, groups, and custom names
- **🎨 5 Beautiful Themes** - Midnight, Ocean, Forest, Purple, Warm Grey
- **🎬 Immersive Scenes** - 8 contextual backgrounds that transform your focus environment

### Engagement & Gamification
- **🏆 Achievement System** - 8 badges for completing various milestones
- **🔥 Streak Tracking** - Build and maintain daily completion streaks
- **📊 Progress Stats** - Comprehensive statistics and analytics
- **📈 Monthly Comparison** - Compare performance across time periods

### Smart Features
- **✨ Smart Insights** - Pattern recognition and personalized suggestions
- **📩 Time Capsule** - Write messages to your future self
- **🔴 "Active Now" Counter** - See how many people are focusing right now
- **📜 History Tracking** - Last 10 completed sessions with timestamps

### Sharing & Portability
- **🔗 URL-Based Sharing** - Share timer setups via encoded links
- **💾 Export/Import** - Full data backup & restore

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18+, CSS Modules
- **Backend**: Firebase Realtime Database
- **Infrastructure**: Google Cloud Platform (Terraform)
- **CI/CD**: GitHub Actions
- **Hosting**: Firebase Hosting
- **Storage**: Cloud Storage

### Data Flow
```
React App → Firebase SDK → Realtime Database
         ↓
    Cloud Functions (for server-side logic)
         ↓
    Cloud Storage (for media/backups)
```

### Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React 18 | UI framework |
| Database | Firebase Realtime DB | Real-time data sync |
| Storage | Cloud Storage | File storage |
| Auth | Firebase Auth | User authentication |
| Functions | Cloud Functions | Server-side logic |
| Hosting | Firebase Hosting | App deployment |
| Infrastructure | Terraform | IaC for GCP resources |
| CI/CD | GitHub Actions | Automated deployment |

## 📁 Project Structure

```
timer-app/
├── src/
│   ├── components/          # React components
│   │   ├── TimerPanel.js
│   │   ├── IntervalPanel.js
│   │   ├── StopwatchPanel.js
│   │   ├── FocusRooms/
│   │   └── shared/          # Reusable components
│   ├── hooks/               # Custom React hooks
│   │   ├── useTimer.js
│   │   ├── useFocusRoom.js
│   │   ├── useNotifications.js
│   │   └── useGamification.js
│   ├── services/            # Business logic
│   │   ├── FirebaseService.js
│   │   ├── storageService.js
│   │   └── shareService.js
│   ├── context/             # React context
│   │   ├── TimerContext.js
│   │   └── ThemeContext.js
│   ├── utils/               # Utility functions
│   │   ├── formatters.js
│   │   ├── helpers.js
│   │   └── constants.js
│   └── styles/              # Global styles
├── infrastructure/          # Terraform configuration
│   ├── firebase.tf          # Firebase resources
│   ├── services.tf          # Cloud services
│   ├── iam-and-sa.tf        # Identity & Access
│   ├── pubsub-and-scheduler.tf
│   └── database-rules.json  # Firebase security rules
├── functions/               # Cloud Functions
├── .github/workflows/       # GitHub Actions
│   └── deploy.yml          # CI/CD pipeline
└── docs/                    # Documentation
    ├── TIMER_APP.md         # App features & usage
    ├── FIREBASE.md          # Firebase setup & services
    ├── CICD.md              # Deployment pipeline
    ├── INFRASTRUCTURE.md    # Terraform & GCP
    └── ARCHITECTURE.md      # System design
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Timer App Guide](docs/TIMER_APP.md)** - Feature details, usage, and user guide
- **[Firebase Documentation](docs/FIREBASE.md)** - Database setup, services, and security rules
- **[CI/CD Pipeline](docs/CICD.md)** - GitHub Actions workflow, deployment process
- **[Infrastructure Guide](docs/INFRASTRUCTURE.md)** - Terraform, GCP resources, setup
- **[Architecture Document](docs/ARCHITECTURE.md)** - System design and data flow

## 💻 Development

### Setting Up Development Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/cemakpolat/timer-app.git
   cd timer-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (optional for local dev)
   - Create `.env.local` with Firebase config
   - Or use mock Firebase service for testing

4. **Start development server**
   ```bash
   npm start
   ```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm start` | Start dev server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run eject` | Eject from Create React App |

### Code Style

- ESLint configured for consistency
- Prettier for code formatting
- Pre-commit hooks via husky (if configured)

### Key Hooks & Services

**Custom Hooks:**
- `useTimer()` - Timer state management
- `useFocusRoom()` - Focus room functionality
- `useGamification()` - Achievement tracking
- `useNotifications()` - Push notifications
- `usePresence()` - Active user tracking

**Services:**
- `FirebaseService` - Database operations
- `storageService` - localStorage abstraction
- `shareService` - URL encoding/decoding

## 🚀 Deployment

### Production Deployment

The app uses **GitHub Actions** for automated CI/CD:

1. **Infrastructure Stage** - Deploys Terraform resources
2. **Build Stage** - Builds React app with Firebase credentials
3. **Deploy Stage** - Deploys to Firebase Hosting

### Deployment Process

```bash
# Trigger deployment (automated via GitHub)
git push origin main
```

**For manual deployment:**
```bash
# Build production
npm run build

# Deploy to Firebase
firebase deploy --project timerapp-2997d
```

### Environment Variables

Required GitHub Secrets:
- `CREDENTIALS_ENCRYPTION_KEY` - For credential encryption
- `FIREBASE_DEPLOY_TOKEN` - Firebase deployment token

### Monitoring

- Firebase Console for real-time monitoring
- Google Cloud Console for infrastructure
- GitHub Actions for deployment logs

## 🔐 Security

### Database Security Rules

Security rules are defined in `infrastructure/database-rules.json`:
- User authentication required
- User-specific data access control
- Focus room ownership validation
- Public timer sharing with restrictions

### API Security

- Firebase Security Rules enforce authorization
- No sensitive data in client code
- Credentials encrypted in artifacts

### Data Privacy

- User data isolated by UID
- No data sharing without consent
- Compliance with privacy regulations

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support & Issues

- **Bugs**: Report via GitHub Issues
- **Features**: Discuss in Discussions tab
- **Documentation**: Check the `docs/` folder

---

**Made with ❤️ for productive people everywhere**

⭐ Star this repo if you find it useful!
