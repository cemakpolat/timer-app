# 🔥 Firebase Documentation

Comprehensive guide to Firebase setup, services, and database configuration.

## Table of Contents

- [Firebase Overview](#firebase-overview)
- [Services Used](#services-used)
- [Database Schema](#database-schema)
- [Security Rules](#security-rules)
- [Setup & Configuration](#setup--configuration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Firebase Overview

### Project Details

| Field | Value |
|-------|-------|
| Project Name | Timer App |
| Project ID | `timerapp-2997d` |
| Region | us-central1 |
| Environment | Production |

### Firebase Services Used

```
Firebase Project (timerapp-2997d)
├── Authentication (Email/Google)
├── Realtime Database
├── Cloud Storage
├── Cloud Functions
├── Cloud Messaging
└── Hosting
```

## Services Used

### 1. Firebase Authentication
**Purpose**: User identity and access management

**Configuration**:
- Email/Password authentication
- Google OAuth integration
- Anonymous authentication for guests

**User Data**:
- UID (unique user identifier)
- Email address
- Display name
- Profile picture URL

### 2. Realtime Database
**Purpose**: Real-time data synchronization

**Key Features**:
- NoSQL JSON database
- Real-time sync via WebSocket
- Offline persistence
- Security Rules enforcement
- Presence tracking

**Data Types Stored**:
- User profiles
- Timer history
- Focus room data
- Achievements/gamification
- Active presence information

### 3. Cloud Storage
**Purpose**: File storage (backups, media)

**Buckets**:
- `timerapp-2997d-firebase-storage` - User backups and media

**Files Stored**:
- Timer backup exports
- User profile images
- Optional session recordings

### 4. Cloud Functions
**Purpose**: Server-side logic and automation

**Current Functions**:
- Background cleanup (scheduled)
- Data validation
- Notifications processing
- Aggregation jobs

### 5. Cloud Messaging
**Purpose**: Push notifications

**Capabilities**:
- Browser push notifications
- Achievement notifications
- Streak updates
- Room invitation notifications

### 6. Firebase Hosting
**Purpose**: Web app deployment

**Configuration**:
- Production URL: `https://timerapp-2997d.web.app`
- SSL/TLS enabled
- CDN globally distributed
- Automatic HTTPS

## Database Schema

### Real-time Database Structure

```json
{
  "users": {
    "UID": {
      "email": "user@example.com",
      "displayName": "John Doe",
      "photoURL": "https://...",
      "createdAt": 1700000000000,
      "totalTimers": 245,
      "currentStreak": 12,
      "preferences": {
        "theme": "midnight",
        "soundType": "bell",
        "volume": 80,
        "notifications": true
      }
    }
  },
  "timers": {
    "UID": {
      "TIMER_ID": {
        "name": "Quick Focus",
        "duration": 1500,
        "scene": "Deep Work",
        "color": "blue",
        "category": "work",
        "savedAt": 1700000000000,
        "usageCount": 15
      }
    }
  },
  "timerHistory": {
    "UID": {
      "SESSION_ID": {
        "timerId": "TIMER_ID",
        "duration": 1500,
        "completedAt": 1700000000000,
        "scene": "Deep Work",
        "streak": 12
      }
    }
  },
  "focusRooms": {
    "ROOM_ID": {
      "name": "Morning Focus Session",
      "ownerId": "UID",
      "createdAt": 1700000000000,
      "description": "Let's focus together",
      "participants": {
        "UID1": true,
        "UID2": true
      },
      "isActive": true,
      "maxParticipants": 20
    }
  },
  "presence": {
    "UID": {
      "lastSeen": 1700000000000,
      "isActive": true,
      "currentTimer": "TIMER_ID",
      "onlineTime": 300
    }
  },
  "achievements": {
    "UID": {
      "FirstSteps": true,
      "CenturyClub": false,
      "WeekWarrior": true,
      "MonthMaster": false,
      "Dedicated": false
    }
  },
  "notifications": {
    "UID": {
      "NOTIFICATION_ID": {
        "type": "achievement_unlocked",
        "title": "First Steps!",
        "message": "You completed your first timer",
        "createdAt": 1700000000000,
        "read": false
      }
    }
  }
}
```

### Data Types Reference

| Type | Description | Example |
|------|-------------|---------|
| String | Text data | "Quick Focus" |
| Number | Numeric value | 1500 |
| Boolean | true/false | true |
| Timestamp | Unix milliseconds | 1700000000000 |
| Object | Nested structure | { name: "X", ... } |
| Array | List of items | [id1, id2, ...] |

## Security Rules

### Rules Overview

Firebase Realtime Database uses rules to control access:

```
{
  "rules": {
    ".read": false,
    ".write": false,
    
    // User profiles
    "users": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid"
      }
    },
    
    // Timer history (user-specific)
    "timerHistory": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    
    // Focus rooms (shared)
    "focusRooms": {
      "$roomId": {
        ".read": "auth != null",
        ".write": "root.child('focusRooms').child($roomId).child('ownerId').val() === auth.uid"
      }
    },
    
    // Presence (read-accessible)
    "presence": {
      ".read": "auth != null",
      "$uid": {
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### Key Security Principles

1. **Authentication Required**: `auth != null`
   - All reads/writes require user login
   - Anonymous users cannot access data

2. **User Isolation**: `$uid === auth.uid`
   - Users can only modify their own data
   - Cannot access other users' private data

3. **Ownership Control**: `child('ownerId').val() === auth.uid`
   - Only owner can modify resource
   - Others can read/participate

4. **Public Access**: `"auth != null"` with read-only
   - Aggregate data readable by all authenticated users
   - Individual writes still restricted

### Rule Validation

**Test Rules**:
```bash
# In Firebase Console:
1. Go to Realtime Database → Rules
2. Click "Rules Playground"
3. Test read/write operations
4. See pass/fail results
```

## Setup & Configuration

### Local Development Setup

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase Project**:
   ```bash
   firebase init
   ```

3. **Authenticate**:
   ```bash
   firebase login
   ```

4. **Create `.env.local`**:
   ```env
   REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
   REACT_APP_FIREBASE_AUTH_DOMAIN=timerapp-2997d.firebaseapp.com
   REACT_APP_FIREBASE_DATABASE_URL=https://timerapp-2997d-terraform-rtdb.firebaseio.com
   REACT_APP_FIREBASE_PROJECT_ID=timerapp-2997d
   REACT_APP_FIREBASE_STORAGE_BUCKET=timerapp-2997d-firebase-storage
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
   REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
   ```

### Deploying Database Rules

1. **Update Rules File**:
   ```bash
   # Edit infrastructure/database-rules.json
   vim infrastructure/database-rules.json
   ```

2. **Deploy Rules**:
   ```bash
   firebase deploy --only database --project timerapp-2997d
   ```

3. **Verify Deployment**:
   - Check Firebase Console
   - Rules tab should show updates
   - Rules Playground for testing

### Setting Up Authentication

1. **Enable Email/Password**:
   - Firebase Console → Authentication
   - Sign-in method → Email/Password
   - Enable both options

2. **Enable Google OAuth**:
   - Authentication → Sign-in method
   - Google provider
   - Add OAuth credentials

3. **Configure Redirect URIs**:
   ```
   http://localhost:3000
   https://timerapp-2997d.web.app
   https://timerapp-2997d.firebaseapp.com
   ```

## Best Practices

### 1. Data Organization

✅ **DO**:
- Organize data by UID (user isolation)
- Use meaningful key names
- Flatten deeply nested structures
- Index frequently queried fields

❌ **DON'T**:
- Store sensitive data in plaintext
- Create deeply nested hierarchies (>5 levels)
- Store redundant copies of data
- Use large documents (>100KB)

### 2. Security Rules

✅ **DO**:
- Always require authentication
- Validate user ownership
- Use specific path rules
- Test rules in playground

❌ **DON'T**:
- Allow unrestricted write access
- Trust client-side validation alone
- Ignore security rule warnings
- Expose sensitive logic in rules

### 3. Performance

✅ **DO**:
- Use `.indexOn` for frequent queries
- Denormalize when appropriate
- Implement pagination
- Cache data client-side

❌ **DON'T**:
- Fetch entire datasets
- Query without indexes
- Store large files in database
- Make unnecessary reads/writes

### 4. Data Integrity

✅ **DO**:
- Use transactions for multi-step updates
- Validate data before writing
- Set timestamps for auditing
- Implement versioning

❌ **DON'T**:
- Assume operation success
- Mix units (timestamps, durations)
- Store outdated data
- Delete without backup

## Monitoring & Analytics

### Firebase Console Monitoring

1. **Real-time Database**:
   - Data tab: Browse structure
   - Rules tab: View/edit rules
   - Backups tab: Create/restore
   - Usage tab: Monitor quota

2. **Authentication**:
   - Users tab: Active users
   - Sign-in method: Auth providers
   - Templates: Email customization

3. **Hosting**:
   - Deployment history
   - Traffic analytics
   - Performance metrics

### Custom Analytics

**Key Metrics to Track**:
- Active daily users (DAU)
- Average session duration
- Timer completions per user
- Achievement unlock rates
- Focus room participation

## Troubleshooting

### Common Issues

#### "Permission denied" Errors

**Cause**: Security rules blocking access

**Solution**:
```javascript
// Check current user UID
firebase.auth().currentUser.uid

// Verify rule allows access
// Test in Rules Playground
```

#### High Database Quota Usage

**Cause**: Excessive read/write operations

**Solution**:
1. Implement pagination
2. Cache data client-side
3. Batch operations
4. Add indexes for queries

#### Authentication Not Working

**Cause**: Credential mismatch or configuration

**Solution**:
1. Verify `.env.local` variables
2. Check API Key restrictions
3. Test in Firebase Console
4. Review auth provider settings

#### Slow Data Sync

**Cause**: Network or database issues

**Solution**:
1. Check network connection
2. Verify database performance
3. Reduce query scope
4. Implement pagination

### Debug Mode

**Enable Firebase Debug Logging**:
```javascript
// In FirebaseService.js
firebase.database.enableLogging(true);
```

**View Logs**:
- Browser DevTools Console
- Firebase Emulator Suite
- Google Cloud Logging

---

**For more help**: [Firebase Documentation](https://firebase.google.com/docs)
