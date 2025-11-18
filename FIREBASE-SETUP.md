# Firebase Setup Guide

This guide will help you set up Firebase for the Timer App's real-time features.

## Features Enabled

✅ **Active Users Count** - See how many people are currently using the app
✅ **Focus Rooms** - Create/join shared focus sessions with others
✅ **Real-time Chat** - Chat with participants in focus rooms
✅ **Synchronized Timers** - Everyone in a room sees the same countdown

## Architecture

### Modular & Swappable Design (SOLID Principles)
```
services/
  ├── interfaces/IRealtimeService.js     # Interface definition
  ├── firebase/FirebaseService.js        # Firebase implementation
  └── RealtimeServiceFactory.js          # Factory for easy swapping
```

**Benefits:**
- ✅ Easy to switch to Supabase, Pusher, or custom backend
- ✅ Testable with mock services
- ✅ Single Responsibility - each service does one thing

Deployment notes

- Deploy the function with the Firebase CLI from the `functions` folder (see `functions/README.md`). The function uses the Admin SDK and requires permissions to read/write the Realtime Database.
- ✅ Dependency Inversion - depends on abstractions, not concretions

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `timer-app` (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Add Web App

1. In project overview, click the **Web icon** (`</>`)
2. Register app nickname: `Timer Web App`
3. **Don't** check "Firebase Hosting" (unless you want it)
4. Click "Register app"
5. **Copy the firebaseConfig object** - you'll need it in step 4

### 3. Enable Realtime Database

1. In Firebase console, go to **Build** → **Realtime Database**
2. Click "Create Database"
3. Choose location (closest to your users)
4. Start in **Test mode** (we'll set proper rules next)
5. Click "Enable"

### 4. Set Security Rules

In Realtime Database → **Rules** tab, paste:

```json
{
  "rules": {
    "presence": {
      ".read": true,
      "$userId": {
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid",
        "avatarUrl": {
          ".validate": "newData.isString() || newData.val() === null"
        },
        "avatarSession": {
          ".validate": "newData.isBoolean() || newData.val() === null"
        }
      }
    },
    "userRooms": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId",
        ".validate": "newData.isString() || newData.val() === null"
      }
    },
    "focusRooms": {
      ".read": true,
      "$roomId": {
        ".write": "auth != null",
        "participants": {
          "$userId": {
            // Allow either the participant themselves or the room creator to add/remove/update participant entries.
            // This lets the room creator perform cleanup for disconnected users.
            ".write": "auth != null && (auth.uid == $userId || root.child('focusRooms').child($roomId).child('createdBy').val() === auth.uid)",
            ".validate": "newData.hasChildren(['joinedAt', 'displayName']) || newData.val() === null"
          }
        },
        "messages": {
          ".write": "auth != null"
        },
        "timer": {
          ".write": "auth != null"
        }
      }
    }
  }
}
```

### Restricting room deletion to the creator
If you want to ensure only the room creator can delete the room (recommended), add the following condition to the `$roomId` rule. It allows anyone authenticated to create/update the room contents but requires that a deletion (where the room node is removed) is performed only by the creator:

```json
"$roomId": {
  ".write": "auth != null && (
      (!data.exists() && newData.exists()) ||                 // creating
      (data.exists() && newData.exists()) ||                  // updating
      (data.exists() && !newData.exists() && data.child('createdBy').val() === auth.uid) // deleting only by creator
  )",
  "participants": { "$userId": { ".write": "auth != null && auth.uid == $userId" } },
  "messages": { ".write": "auth != null" },
  "timer": { ".write": "auth != null" }
}
```

Apply and publish these rules in the Realtime Database > Rules tab.

Click **Publish**

### 5. Configure Your App

Open `src/config/firebase.config.js` and replace with your config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "timer-app-xxxxx.firebaseapp.com",
  databaseURL: "https://timer-app-xxxxx-default-rtdb.firebaseio.com",
  projectId: "timer-app-xxxxx",
  storageBucket: "timer-app-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**OR** use environment variables (recommended):

Create `.env.local` in project root:

```bash
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=timer-app-xxxxx.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://timer-app-xxxxx-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=timer-app-xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=timer-app-xxxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef

# Optional: room removal timing (seconds)
# When a room becomes empty but still has an active timer, the app can schedule an automatic removal.
# Default for empty-room removal is 120 seconds (2 minutes). You can override with either variable.
REACT_APP_ROOM_REMOVAL_DELAY_SEC=30
REACT_APP_EMPTY_ROOM_REMOVAL_DELAY_SEC=120
```

### 6. Install Dependencies

```bash
npm install firebase
```

### 7. Initialize Service in App.js

Add at the top of `src/App.js`:

```javascript
import { useEffect } from 'react';
import RealtimeServiceFactory, { ServiceType } from './services/RealtimeServiceFactory';
import firebaseConfig from './config/firebase.config';
import usePresence from './hooks/usePresence';

function App() {
  // Initialize Firebase service
  useEffect(() => {
    const initService = async () => {
      try {
        await RealtimeServiceFactory.createService(ServiceType.FIREBASE, firebaseConfig);
        console.log('Realtime service initialized');
      } catch (error) {
        console.error('Failed to initialize service:', error);
      }
    };

    initService();

    // Cleanup on app unmount
    return () => {
      RealtimeServiceFactory.resetService();
    };
  }, []);

  // Use presence hook
  const { activeUsers } = usePresence();

  // Replace mock activeUsers with real data
  // ...
}
```

## Usage Examples

### Active Users Count

```javascript
import usePresence from './hooks/usePresence';

const { activeUsers, isOnline, updatePresence } = usePresence();

// Display: {activeUsers} people focusing right now
```

### Focus Rooms

```javascript
import useFocusRoom from './hooks/useFocusRoom';

const {
  rooms,
  currentRoom,
  messages,
  createRoom,
  joinRoom,
  sendMessage
} = useFocusRoom();

// Create a room
await createRoom({
  name: 'Deep Work Session',
  maxParticipants: 10,
  duration: 1500 // 25 minutes
});

// Join a room
await joinRoom(roomId, { displayName: 'John' });

// Send message
await sendMessage('Let\'s stay focused!');
```

## Switching to Another Backend

To switch from Firebase to Supabase (or any other):

1. Implement `IRealtimeService` interface
2. Update `RealtimeServiceFactory.js` to support new type
3. Change one line in your app:

```javascript
// From Firebase
await RealtimeServiceFactory.createService(ServiceType.FIREBASE, config);

// To Supabase
await RealtimeServiceFactory.createService(ServiceType.SUPABASE, config);
```

That's it! No other code changes needed.

## Cost Estimation

### Firebase Free Tier (Spark Plan)
- ✅ 100 simultaneous connections
- ✅ 1 GB stored data
- ✅ 10 GB/month downloaded

**Perfect for:**
- Small to medium apps
- Up to ~100 concurrent users
- Moderate chat usage

### Firebase Paid Tier (Blaze Plan)
- **$1/GB** stored data
- **$0.18/GB** downloaded data
- Unlimited connections

**Example cost:**
- 1,000 active users
- 10,000 messages/day
- **~$5-10/month**

## Troubleshooting

### "Permission denied" errors
→ Check Firebase security rules are published

### "Service not initialized"
→ Make sure `RealtimeServiceFactory.createService()` is called before using hooks

### Active users always 0
→ Verify database URL in config includes `https://` and `.firebaseio.com`

### Messages not appearing
→ Check browser console for errors and verify anonymous auth is enabled

## Security Notes

1. **Anonymous Authentication**: Users are signed in anonymously (no login required)
2. **Read Access**: Anyone can read presence and rooms (public data)
3. **Write Access**: Only authenticated users can write (prevents spam)
4. **User Isolation**: Users can only update their own presence

## Next Steps

- [ ] Set up Firebase project
- [ ] Install `firebase` package
- [ ] Configure `firebase.config.js`
- [ ] Initialize service in App.js
- [ ] Test active users count
- [ ] Build Focus Rooms UI
- [ ] Test chat functionality

---

Need help? Check [Firebase Docs](https://firebase.google.com/docs/database) or open an issue!
