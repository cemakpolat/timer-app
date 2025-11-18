# 🏛️ Architecture Documentation

Complete system design, data flow, and component interactions for the Timer App.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [System Architecture](#system-architecture)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [Technology Stack](#technology-stack)
- [Security Architecture](#security-architecture)
- [Scalability & Performance](#scalability--performance)
- [Design Patterns](#design-patterns)

## Architecture Overview

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Timer Panel │  │ Stopwatch    │  │ Focus Rooms (Social) │  │
│  └──────┬───────┘  │ Interval     │  └──────────┬───────────┘  │
│         │          │ Chain        │             │               │
│         │          │ Scenes       │             │               │
│  ┌──────▼────────────────────────────────────────▼────────────┐ │
│  │          React Context (State Management)                  │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │ │
│  │  │ TimerContext │  │ ThemeContext │  │ Custom Hooks     │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘ │ │
│  └──────────────┬──────────────────────────────────────────────┘ │
│                 │                                                │
│  ┌──────────────▼──────────────────────────────────────────────┐ │
│  │              Service Layer                                  │ │
│  │  ┌────────────────────┐  ┌────────────────────────────────┐ │ │
│  │  │ RealtimeService    │  │ Other Services               │ │ │
│  │  │ (Factory Pattern)  │  │ - Storage, Share, etc.       │ │ │
│  │  └────────────────────┘  └────────────────────────────────┘ │ │
│  └──────────────┬──────────────────────────────────────────────┘ │
└─────────────────┼─────────────────────────────────────────────────┘
                  │
          ┌───────▼──────────┐
          │ Firebase SDK     │
          │ (JavaScript)     │
          └───────┬──────────┘
                  │
┌─────────────────▼─────────────────────────────────────────────────┐
│                      Google Cloud Platform                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           Firebase Services                               │ │
│  │  ┌────────────────┐  ┌────────────────┐                   │ │
│  │  │ Authentication │  │ Realtime DB    │                   │ │
│  │  └────────────────┘  └────────────────┘                   │ │
│  │  ┌────────────────┐  ┌────────────────┐                   │ │
│  │  │ Cloud Storage  │  │ Cloud Messaging│                   │ │
│  │  └────────────────┘  └────────────────┘                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │       Optional Backend Services                           │ │
│  │  ┌────────────────┐  ┌────────────────┐                   │ │
│  │  │ Cloud Functions│  │ Pub/Sub & Jobs │                   │ │
│  │  └────────────────┘  └────────────────┘                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## System Architecture

### Layered Architecture

#### 1. Presentation Layer (React)

**Components**:
- Timer Panel - Core countdown timer
- Stopwatch Panel - Time tracking
- Interval Panel - Interval timer management
- Focus Rooms - Collaborative session management
- Feedback Modal - User notifications

**Characteristics**:
- Component-based UI
- CSS Modules for styling
- Reusable shared components
- Error boundary for error handling

#### 2. State Management Layer

**Technologies**:
- React Context API for global state
- Custom hooks for logic encapsulation
- Local storage for persistence

**State Trees**:

```javascript
// TimerContext
{
  timers: [
    { id, name, duration, scene, category, color, ... }
  ],
  currentTimer: { ... },
  history: [ ... ],
  achievements: { ... },
  streak: number,
  preferences: { theme, sound, volume, ... }
}

// ThemeContext
{
  currentTheme: 'light' | 'dark' | 'midnight',
  contrast: 'normal' | 'high',
  fontSize: 'small' | 'medium' | 'large'
}
```

#### 3. Service Layer

**RealtimeServiceFactory**:
- Abstracts realtime data backend
- Supports multiple implementations (Firebase, Mock)
- Factory pattern for flexible switching

**Service Interface**:
```javascript
class IRealtimeService {
  async getActiveUsersCount()
  async getFocusRooms()
  async joinFocusRoom()
  async updatePresence()
  async getTimers()
  async saveTimer()
  // ... more methods
}
```

**Implementations**:
- `FirebaseService` - Live Firebase integration
- `MockRealtimeService` - Testing/offline mode

#### 4. Integration Layer (Firebase SDK)

**Connection Types**:
- HTTP/REST for operations
- WebSocket for real-time sync
- Offline persistence with local queue

## Data Flow

### Complete Request Flow

```
User Action (e.g., "Start Timer")
    ↓
Component Handler (e.g., startTimer())
    ↓
Context Update (dispatch action)
    ↓
Service Method (firebaseService.startTimer())
    ↓
Firebase SDK Call (realtime.ref().set())
    ↓
Network Request (WebSocket/HTTP)
    ↓
GCP: Firebase Service
    ↓
Database Write
    ↓
Real-time Listener Triggered
    ↓
SDK Emits Change Event
    ↓
Context Updates
    ↓
Component Re-renders
    ↓
Updated UI
```

### Real-Time Sync Flow

```
User A starts timer
    ↓
Firebase DB updated: /timers/{userId}/timer
    ↓
Firebase broadcasts: /presence/{userA}
    ↓
User B receives update via listener
    ↓
Context updates presence data
    ↓
Focus room component re-renders
    ↓
Shows "User A is active" with timer
```

### Offline Behavior

```
User goes offline
    ↓
SDK queues local changes
    ↓
Changes written to local storage
    ↓
User goes back online
    ↓
SDK syncs queued changes
    ↓
Remote DB updated
    ↓
Listeners triggered for all users
    ↓
Everyone sees consistent state
```

## Component Architecture

### Component Hierarchy

```
<App>
├── <ErrorBoundary>
├── <AuthLayout>
│   ├── <LoginForm> / <SignupForm>
│   └── <GoogleAuthButton>
├── <MainLayout> (if authenticated)
│   ├── <Header>
│   ├── <Sidebar>
│   │   ├── <NavItem>
│   │   └── <UserProfile>
│   ├── <MainContent>
│   │   ├── <TimerPanel>
│   │   │   ├── <TimerDisplay>
│   │   │   ├── <ControlButtons>
│   │   │   └── <PresetSelector>
│   │   ├── <StopwatchPanel>
│   │   │   ├── <TimeDisplay>
│   │   │   ├── <LapList>
│   │   │   └── <Controls>
│   │   ├── <IntervalPanel>
│   │   │   ├── <IntervalEditor>
│   │   │   └── <Preview>
│   │   ├── <FocusRooms>
│   │   │   ├── <RoomList>
│   │   │   ├── <RoomDetail>
│   │   │   └── <ParticipantsList>
│   │   └── <GamificationPanel>
│   │       ├── <AchievementsList>
│   │       ├── <StreakDisplay>
│   │       └── <StatsSummary>
│   ├── <FeedbackModal>
│   └── <SettingsModal>
└── <Footer>
```

### Hook Architecture

**Custom Hooks** (Composition Pattern):

```javascript
// useTimer.js - Core timer logic
{
  time, isRunning, isPaused, start, pause, resume, reset, ...
}

// usePresence.js - User presence tracking
{
  activeUsers, updatePresence, getActiveUsersCount, ...
}

// useFocusRoom.js - Collaborative features
{
  rooms, currentRoom, joinRoom, leaveRoom, createRoom, ...
}

// useGamification.js - Achievement system
{
  achievements, streak, badges, earnAchievement, updateStreak, ...
}

// useKeyboardShortcuts.js - Keyboard bindings
{
  registerShortcut, unregisterShortcut, ...
}

// useNotifications.js - Browser notifications
{
  notify, requestPermission, ...
}

// useSound.js - Audio management
{
  play, setVolume, mute, unmute, ...
}

// useLocalStorage.js - Local persistence
{
  get, set, remove, clear, ...
}
```

## Technology Stack

### Frontend

| Layer | Technology | Purpose | Version |
|-------|-----------|---------|---------|
| **Framework** | React | UI library | 18.2.0+ |
| **Styling** | CSS Modules | Component styles | Native |
| **State** | React Context | Global state | Native |
| **HTTP Client** | Firebase SDK | Backend integration | 9.0.0+ |
| **Testing** | Jest | Unit tests | 29.0.0+ |
| **Bundler** | Create React App | Build tool | 5.0.0+ |

### Backend Services

| Service | Technology | Purpose |
|---------|-----------|---------|
| **Database** | Firebase Realtime DB | NoSQL data storage |
| **Auth** | Firebase Authentication | User identity & access |
| **Storage** | Cloud Storage | File storage |
| **Messaging** | Cloud Messaging | Push notifications |
| **Functions** | Cloud Functions | Serverless compute |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **IaC** | Terraform | Infrastructure provisioning |
| **Cloud** | Google Cloud Platform | Hosting infrastructure |
| **CI/CD** | GitHub Actions | Automated deployment |
| **Container** | Docker (optional) | Containerization |

## Security Architecture

### Authentication Flow

```
┌─────────────┐
│  User       │
└──────┬──────┘
       │ 1. Signs in with email/password or Google
       ▼
┌─────────────────────────┐
│ Firebase Auth           │
│ ├─ Verify credentials   │
│ └─ Generate JWT token   │
└──────┬──────────────────┘
       │ 2. Returns auth token
       ▼
┌──────────────┐
│ Browser      │
│ ├─ Store JWT │
│ └─ Send      │
└──────┬───────┘
       │ 3. Include in all requests
       ▼
┌─────────────────────────┐
│ Firebase SDK            │
│ ├─ Validate JWT         │
│ └─ Attach to requests   │
└──────┬──────────────────┘
       │ 4. Verified requests
       ▼
┌─────────────────────────┐
│ Firebase Services       │
│ ├─ Apply rules          │
│ └─ Process request      │
└─────────────────────────┘
```

### Authorization Flow

```
Client Request
    ↓
Firebase Security Rules Evaluated
    ├─ .read: Is user authenticated?
    ├─ .write: Does user own this resource?
    └─ Custom: Business logic checks
    ↓
Rule Matches?
├─ YES → Request Granted
└─ NO → Permission Denied Error
```

### Data Protection

**In Transit**:
- HTTPS/TLS encryption
- WebSocket Secure (WSS)

**At Rest**:
- GCP encryption by default
- Customer-managed keys (optional)

**In Application**:
- Sensitive values marked as `sensitive = true` in Terraform
- Masked in CI/CD logs with `::add-mask::`
- Never logged to console in production

## Scalability & Performance

### Horizontal Scaling

**Frontend**:
- Static content served via CDN (Firebase Hosting)
- No server-side rendering (client-side only)
- Scales infinitely with no backend changes

**Backend**:
- Firebase auto-scales realtime connections
- Cloud Functions scale based on invocations
- Pub/Sub handles message queue scaling

**Database**:
- Firebase Realtime DB auto-shards by path
- Storage scales elastically
- Backups automatic and incremental

### Performance Optimization

**Frontend**:
```javascript
// Code splitting
React.lazy(() => import('./components/FocusRooms'))

// Memoization
React.memo(Component, (prev, next) => { ... })

// Pagination
getTimers(userId, limit: 50, offset: 0)

// Debouncing
debounce(updatePresence, 5000)
```

**Backend**:
```
- Indexed database paths for fast queries
- Connection pooling for database
- Cache frequently accessed data
- Archive old timer history
```

### Monitoring & Metrics

**Key Performance Indicators**:
- Active concurrent users
- Average response time
- Database read/write operations
- Storage usage
- Function execution time

## Design Patterns

### 1. Factory Pattern

**RealtimeServiceFactory**:
```javascript
// Creates appropriate service based on environment
class RealtimeServiceFactory {
  static createService(type: 'firebase' | 'mock') {
    return type === 'firebase' 
      ? new FirebaseService() 
      : new MockRealtimeService()
  }
}
```

### 2. Observer Pattern

**Firebase Listeners**:
```javascript
// Observers notify when data changes
ref.on('value', (snapshot) => {
  // Update UI when data changes
})

// Multiple observers can listen to same path
ref.on('child_added', handleChildAdded)
ref.on('child_changed', handleChildChanged)
ref.on('child_removed', handleChildRemoved)
```

### 3. Context Provider Pattern

**React Context**:
```javascript
// Provides state to entire component tree
<TimerProvider>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</TimerProvider>
```

### 4. Custom Hook Pattern

**Logic Reuse**:
```javascript
// Encapsulates complex logic
function useTimer() {
  const [time, setTime] = useState(0)
  // ... timer logic
  return { time, start, pause, ... }
}

// Used in multiple components
function TimerPanel() {
  const timer = useTimer()
}
```

### 5. Singleton Pattern

**Firebase Instance**:
```javascript
// Single Firebase instance for entire app
const firebase = initializeApp(config)
export default firebase
```

### 6. Strategy Pattern

**Theme Strategies**:
```javascript
// Different theme implementations
const themes = {
  light: { ... },
  dark: { ... },
  midnight: { ... }
}

// Switch strategy based on user preference
applyTheme(themes[userPreference])
```

## Error Handling

### Error Hierarchy

```
┌────────────────────────┐
│ All Errors             │
├────────────────────────┤
│ ├─ Authentication      │
│ │  └─ Invalid token    │
│ │  └─ Expired session  │
│ │  └─ Permission denied│
│ ├─ Network             │
│ │  └─ Offline          │
│ │  └─ Timeout          │
│ │  └─ 5xx error        │
│ ├─ Database            │
│ │  └─ Query failed     │
│ │  └─ Write failed     │
│ │  └─ Validation error │
│ └─ Application         │
│    └─ Logic errors     │
│    └─ Component errors │
└────────────────────────┘
```

### Error Recovery

**Automatic Retry**:
- Network errors: exponential backoff
- Transient failures: auto-retry
- Failed writes: queue locally

**User Notification**:
- Errors shown in toast/modal
- Retry options provided
- Offline indicator displayed

**Logging**:
- Production errors tracked
- Stack traces preserved
- User context included

---

**For more information**: See [CICD.md](./CICD.md), [FIREBASE.md](./FIREBASE.md), [INFRASTRUCTURE.md](./INFRASTRUCTURE.md), [TIMER_APP.md](./TIMER_APP.md)
