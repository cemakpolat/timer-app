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

/**
 * Firebase Configuration - All values come from environment variables
 * 
 * Set these GitHub Secrets in your repository:
 * - REACT_APP_FIREBASE_API_KEY
 * - REACT_APP_FIREBASE_AUTH_DOMAIN
 * - REACT_APP_FIREBASE_DATABASE_URL
 * - REACT_APP_FIREBASE_PROJECT_ID
 * - REACT_APP_FIREBASE_STORAGE_BUCKET
 * - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
 * - REACT_APP_FIREBASE_APP_ID
 */
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Room removal delay in seconds after timer end (can be overridden via env var)
firebaseConfig.roomRemovalDelaySec = parseInt(process.env.REACT_APP_ROOM_REMOVAL_DELAY_SEC || '30', 10);

// Enable/disable Firebase features
export const FIREBASE_FEATURES = {
  ENABLE_PRESENCE: true,
  ENABLE_FOCUS_ROOMS: true,
  PRESENCE_HEARTBEAT_INTERVAL: 60000, // 60 seconds
  ACTIVE_USER_THRESHOLD: 120000 // 2 minutes
};

export default firebaseConfig;
