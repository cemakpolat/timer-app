/**
 * Firebase Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or use existing)
 * 3. Add a Web app to your project
 * 4. Copy the firebaseConfig object here
 * 5. Enable Realtime Database in Firebase Console
 * 6. Set database rules to allow read/write (see below)
 *
 * SECURITY RULES (for Realtime Database):
 * {
 *   "rules": {
 *     "presence": {
 *       ".read": true,
 *       "$userId": {
 *         ".write": "auth != null"
 *       }
 *     },
 *     "focusRooms": {
 *       ".read": true,
 *       "$roomId": {
 *         ".write": "auth != null"
 *       }
 *     }
 *   }
 * }
 */

const firebaseConfig = {
  // Replace with your Firebase project config
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://your-project-default-rtdb.firebaseio.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Enable/disable Firebase features
export const FIREBASE_FEATURES = {
  ENABLE_PRESENCE: true,
  ENABLE_FOCUS_ROOMS: true,
  PRESENCE_HEARTBEAT_INTERVAL: 60000, // 60 seconds
  ACTIVE_USER_THRESHOLD: 120000 // 2 minutes
};

export default firebaseConfig;
