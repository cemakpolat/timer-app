const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize app using default credentials when deployed to Firebase.
// For local testing set GOOGLE_APPLICATION_CREDENTIALS env pointing to a service account JSON file.
try {
  admin.initializeApp();
} catch (e) {
  // already initialized
}

const db = admin.database();

// Cleanup configuration
const DEFAULT_EMPTY_REMOVAL_SEC = 120; // fallback if room not set
const PRESENCE_INACTIVE_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Helper to remove a room and associated userRooms entries atomically via multi-path update
 */
async function removeRoomAndUserMappings(roomId, room) {
  const updates = {};
  updates[`focusRooms/${roomId}`] = null;
  const participants = room.participants || {};
  Object.keys(participants).forEach((uid) => {
    updates[`userRooms/${uid}`] = null;
  });
  // apply update
  await db.ref('/').update(updates);
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
  const now = Date.now();
  const snapshot = await db.ref('focusRooms').get();
  if (!snapshot.exists()) {
    console.log('No focusRooms found');
    return null;
  }

  const rooms = snapshot.val();
  const presenceSnap = await db.ref('presence').get();
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

  // Apply deletions in batches
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
});
