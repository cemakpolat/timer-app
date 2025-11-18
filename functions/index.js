const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize app using default credentials when deployed to Firebase.
// For local testing set GOOGLE_APPLICATION_CREDENTIALS env pointing to a service account JSON file.
try {
  admin.initializeApp();
} catch (e) {
  // already initialized
}

// Get database lazily to avoid errors during initialization
// The database URL is determined at runtime from the Firebase project
function getDatabase() {
  return admin.database();
}

// Cleanup configuration
const DEFAULT_EMPTY_REMOVAL_SEC = 120; // fallback if room not set
const PRESENCE_INACTIVE_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Retry helper with exponential backoff
 * Retries up to maxAttempts with exponential backoff (100ms, 200ms, 400ms, 800ms, etc.)
 */
async function retryWithBackoff(fn, maxAttempts = 5, initialDelayMs = 100) {
  let lastError;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = initialDelayMs * Math.pow(2, attempt);
      const jitter = Math.random() * delay * 0.1; // Add 10% jitter to prevent thundering herd
      const waitTime = delay + jitter;
      
      console.log(`Attempt ${attempt + 1}/${maxAttempts} failed: ${error.message}. Retrying in ${Math.round(waitTime)}ms...`);
      
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw new Error(`Failed after ${maxAttempts} attempts: ${lastError.message}`);
}

/**
 * Helper to remove a room and associated userRooms entries atomically via multi-path update
 * Includes retry logic for transient failures
 */
async function removeRoomAndUserMappings(roomId, room) {
  return retryWithBackoff(async () => {
    const updates = {};
    updates[`focusRooms/${roomId}`] = null;
    const participants = room.participants || {};
    Object.keys(participants).forEach((uid) => {
      updates[`userRooms/${uid}`] = null;
    });
    // apply update
    await getDatabase().ref('/').update(updates);
  });
}

/**
 * Scheduled job that runs periodically and removes or marks completed rooms whose timer ended and
 * have passed their empty-room removal grace period.
 *
 * Behavior:
 * - For each room where timer.endsAt exists and now >= endsAt + delay:
 *   - If there are no participants -> delete the room
 *   - If participants exist -> check presence timestamps. If all participants inactive for PRESENCE_INACTIVE_MS (or no presence entries), remove participants and delete room.
 *
 * The room-level `emptyRoomRemovalDelaySec` is respected if present. Otherwise fallback to environment or default.
 */
// Run the cleanup every 15 minutes to reduce invocation and DB read volume (cost control)
exports.scheduledRoomCleanup = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
  console.log('Starting scheduled room cleanup...');
  
  try {
    // Get database with retry logic
    const db = await retryWithBackoff(() => Promise.resolve(getDatabase()), 3, 100);
    
    const now = Date.now();
    
    // Fetch focusRooms with retry
    const snapshot = await retryWithBackoff(
      () => db.ref('focusRooms').get(),
      3,
      200
    );
    
    if (!snapshot.exists()) {
      console.log('No focusRooms found');
      return null;
    }

    const rooms = snapshot.val();
    
    // Fetch presence with retry
    const presenceSnap = await retryWithBackoff(
      () => db.ref('presence').get(),
      3,
      200
    );
    
    const presence = presenceSnap.exists() ? presenceSnap.val() : {};

    const deletions = [];

    for (const [roomId, room] of Object.entries(rooms)) {
      try {
        if (!room || !room.timer || !room.timer.endsAt) continue;
        // compute delay
        const delaySec = (typeof room.emptyRoomRemovalDelaySec === 'number' && room.emptyRoomRemovalDelaySec) || parseInt(process.env.EMPTY_ROOM_REMOVAL_DELAY_SEC || '', 10) || DEFAULT_EMPTY_REMOVAL_SEC;
        const deadline = room.timer.endsAt + (delaySec * 1000);
        if (now < deadline) continue; // not eligible yet

        const participants = room.participants || {};
        const participantIds = Object.keys(participants);

        if (participantIds.length === 0) {
          console.log(`Deleting empty room ${roomId} (no participants, timer ended at ${room.timer.endsAt})`);
          deletions.push({ roomId, room });
          continue;
        }

        // if participants exist, check presence timestamps; if all inactive long enough, delete
        let anyActive = false;
        for (const uid of participantIds) {
          const p = presence[uid];
          if (p && p.lastSeen && (now - p.lastSeen) < PRESENCE_INACTIVE_MS) {
            anyActive = true;
            break;
          }
        }

        if (!anyActive) {
          console.log(`Deleting room ${roomId} (participants inactive after timer end)`);
          deletions.push({ roomId, room });
        } else {
          console.log(`Skipping room ${roomId}: participants still active after timer end`);
        }
      } catch (e) {
        console.error('Error evaluating room', roomId, e);
      }
    }

    // Apply deletions in batches with retry
    for (const d of deletions) {
      try {
        await removeRoomAndUserMappings(d.roomId, d.room);
        console.log(`Removed room ${d.roomId} and user mappings`);
      } catch (e) {
        console.error('Failed to remove room', d.roomId, e);
      }
    }

    console.log('scheduledRoomCleanup complete. Rooms processed:', Object.keys(rooms).length, 'deletions:', deletions.length);
    return null;
  } catch (error) {
    console.error('Fatal error in scheduledRoomCleanup:', error);
    // Rethrow so Cloud Functions knows this invocation failed
    throw error;
  }
});
