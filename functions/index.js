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

// Cleanup configuration - can be overridden with environment variables
const DEFAULT_EMPTY_REMOVAL_SEC = 120; // fallback if room not set
const PRESENCE_INACTIVE_MS = 2 * 60 * 1000; // 2 minutes
const STALE_PARTICIPANT_MS = 5 * 60 * 1000; // 5 minutes - participant is considered stale if no presence update

// Parse environment variables with fallbacks
const CLEANUP_SCHEDULE = process.env.CLEANUP_SCHEDULE || 'every 15 minutes';
const STALE_THRESHOLD_MS = parseInt(process.env.STALE_THRESHOLD_MS || '300000', 10); // 5 minutes
const PRESENCE_INACTIVE_THRESHOLD_MS = parseInt(process.env.PRESENCE_INACTIVE_THRESHOLD_MS || '120000', 10); // 2 minutes
const EMPTY_ROOM_REMOVAL_DELAY_SEC = parseInt(process.env.EMPTY_ROOM_REMOVAL_DELAY_SEC || '120', 10); // 2 minutes

// Log configuration on function load (useful for debugging)
console.log('Cloud Function Configuration:');
console.log(`  CLEANUP_SCHEDULE: ${CLEANUP_SCHEDULE}`);
console.log(`  STALE_THRESHOLD_MS: ${STALE_THRESHOLD_MS}ms (${(STALE_THRESHOLD_MS / 60000).toFixed(1)} min)`);
console.log(`  PRESENCE_INACTIVE_THRESHOLD_MS: ${PRESENCE_INACTIVE_THRESHOLD_MS}ms (${(PRESENCE_INACTIVE_THRESHOLD_MS / 60000).toFixed(1)} min)`);
console.log(`  EMPTY_ROOM_REMOVAL_DELAY_SEC: ${EMPTY_ROOM_REMOVAL_DELAY_SEC}s`);

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
 * Helper to remove stale participants from a room (those not present in presence DB for 5+ min)
 * Returns { staleParticipants: [uid], ownerStale: boolean }
 */
async function removeStaleParticipants(roomId, room, presence, now) {
  const staleParticipants = [];
  let ownerStale = false;
  const updates = {};

  const participants = room.participants || {};
  for (const uid of Object.keys(participants)) {
    const presenceData = presence[uid];
    
    // If participant has no presence entry or lastSeen is stale (configurable threshold), they're stale
    const lastSeen = presenceData?.lastSeen || 0;
    const isStale = (now - lastSeen) > STALE_THRESHOLD_MS;

    if (isStale) {
      staleParticipants.push(uid);
      updates[`focusRooms/${roomId}/participants/${uid}`] = null;
      
      // Track if owner is stale
      if (uid === room.createdBy) {
        ownerStale = true;
      }

      console.log(`Marked participant ${uid} as stale (lastSeen: ${lastSeen}, now: ${now}, delta: ${now - lastSeen}ms, threshold: ${STALE_THRESHOLD_MS}ms)`);
    }
  }

  // Apply updates if there are stale participants
  if (Object.keys(updates).length > 0) {
    try {
      await retryWithBackoff(async () => {
        await getDatabase().ref('/').update(updates);
      });
      console.log(`Removed ${staleParticipants.length} stale participants from room ${roomId}`);
    } catch (e) {
      console.error(`Failed to remove stale participants from room ${roomId}:`, e);
    }
  }

  return { staleParticipants, ownerStale };
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
// Run the cleanup on a configurable schedule (default: every 15 minutes)
// Schedule can be changed via environment variable CLEANUP_SCHEDULE
// Examples: 'every 5 minutes', 'every 30 minutes', '*/10 * * * *' (cron)
exports.scheduledRoomCleanup = functions.pubsub.schedule(CLEANUP_SCHEDULE).onRun(async (context) => {
  console.log(`Starting scheduled room cleanup on schedule: ${CLEANUP_SCHEDULE}`);
  
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
        let participantIds = Object.keys(participants);

        // FIRST: Remove stale participants (5+ min no presence update)
        if (participantIds.length > 0) {
          const { staleParticipants, ownerStale } = await removeStaleParticipants(roomId, room, presence, now);
          
          if (staleParticipants.length > 0) {
            // Re-fetch the room to get updated participant list
            const updatedSnap = await retryWithBackoff(
              () => getDatabase().ref(`focusRooms/${roomId}`).get(),
              2,
              100
            );
            if (updatedSnap.exists()) {
              const updatedRoom = updatedSnap.val();
              participantIds = Object.keys(updatedRoom.participants || {});
              console.log(`After removing stale participants, room ${roomId} has ${participantIds.length} active participants`);
              
              // If owner was stale and removed, mark room for potential deletion
              if (ownerStale) {
                console.log(`Owner ${room.createdBy} is stale in room ${roomId}. Setting ownerDisconnected flag.`);
                try {
                  await retryWithBackoff(async () => {
                    await getDatabase().ref(`focusRooms/${roomId}/ownerDisconnected`).set(true);
                  });
                } catch (e) {
                  console.error(`Failed to set ownerDisconnected flag for room ${roomId}:`, e);
                }
              }
            }
          }
        }

        // SECOND: Check if room is now empty after stale removal
        if (participantIds.length === 0) {
          console.log(`Deleting empty room ${roomId} (no active participants, timer ended at ${room.timer.endsAt})`);
          deletions.push({ roomId, room });
          continue;
        }

        // THIRD: If participants exist but all are inactive, still delete
        let anyActive = false;
        for (const uid of participantIds) {
          const p = presence[uid];
          if (p && p.lastSeen && (now - p.lastSeen) < PRESENCE_INACTIVE_THRESHOLD_MS) {
            anyActive = true;
            break;
          }
        }

        if (!anyActive) {
          console.log(`Deleting room ${roomId} (all participants inactive after timer end)`);
          deletions.push({ roomId, room });
        } else {
          console.log(`Skipping room ${roomId}: active participants detected after timer end`);
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
