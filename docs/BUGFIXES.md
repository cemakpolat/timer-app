# Bug Fixes & Patches

This document tracks critical bug fixes and patches applied to the Timer App.

## Empty Room Cleanup Bug Fix ✅

### Problem Description

Empty rooms were not being deleted by the `scheduledRoomCleanup` Cloud Function, even when they should have been. The function was processing rooms but performing 0 deletions.

**Symptom**:
- 2 rooms showing in the system
- But only 1 actual room being used
- Empty/stale rooms persisting indefinitely

**Root Cause**: The cleanup function had an early exit condition that skipped any room that didn't have a timer started:

```javascript
if (!room || !room.timer || !room.timer.endsAt) continue;
```

This meant that:
- Rooms created but never joined (0 participants, no timer started) were skipped
- Scheduled rooms that weren't activated yet were skipped
- Any room without an active timer was ignored

### Solution

Added a **new cleanup logic** that removes empty rooms based on their age, **before** checking for timer status:

#### New Logic Flow

```
For each room:
  1. Check if room is EMPTY (0 participants)
     - If empty AND created > 1 hour ago → DELETE
     - If empty AND recent → SKIP

  2. If room HAS NO TIMER START TIME
     - SKIP (room is still in scheduled/active state)

  3. If room HAS TIMER END TIME
     - Check if timer deadline passed
     - Remove stale participants
     - If now empty → DELETE
     - If all inactive → DELETE
```

#### Key Changes

**File**: `functions/index.js` in `scheduledRoomCleanup()` function

**Before**:
```javascript
for (const [roomId, room] of Object.entries(rooms)) {
  try {
    if (!room || !room.timer || !room.timer.endsAt) continue;
    // ... rest of cleanup
  }
}
```

**After**:
```javascript
for (const [roomId, room] of Object.entries(rooms)) {
  try {
    if (!room) continue;

    // NEW: Clean up empty rooms that never had participants
    const participants = room.participants || {};
    let participantIds = Object.keys(participants);

    if (participantIds.length === 0) {
      const createdAt = room.createdAt || Date.now();
      const ageMs = now - createdAt;
      const emptyRoomThresholdMs = 60 * 60 * 1000; // 1 hour

      if (ageMs > emptyRoomThresholdMs) {
        console.log(`Deleting empty room ${roomId} (age: ${Math.floor(ageMs / 1000)}s)`);
        deletions.push({ roomId, room });
        continue;
      }
    }

    // If room has no timer, skip normal cleanup
    if (!room.timer || !room.timer.endsAt) continue;

    // ... rest of existing cleanup
  }
}
```

### What Gets Cleaned Up

#### Type 1: Empty Rooms (Never Joined)
- **Condition**: 0 participants, created > 1 hour ago
- **Example**: User creates room, closes app, room sits empty
- **Action**: Deleted after 1 hour

#### Type 2: Empty After Timer Ends
- **Condition**: Started timer, all participants left, grace period passed
- **Example**: User runs timer alone, closes app
- **Action**: Deleted after grace period (default: 2 min)

#### Type 3: Stale Participants Only
- **Condition**: Timer ended, only inactive participants remain (no presence > 2 min)
- **Example**: Users disconnect without leaving, presence times out
- **Action**: Participants removed, room deleted

#### Type 4: Scheduled Rooms (NOT Cleaned)
- **Condition**: `status: "scheduled"`, not yet time to activate
- **Action**: LEFT ALONE (not deleted until they're activated or 1+ hour old)

### Threshold Values

| Scenario | Threshold | Why |
|----------|-----------|-----|
| Empty room age | 1 hour | Grace period for user to rejoin before deletion |
| Stale participant | 5 minutes | Presence update timeout (configurable) |
| Inactive threshold | 2 minutes | Presence considered inactive (configurable) |
| Grace period | 2 minutes | Wait after timer ends before cleanup (configurable) |

### Impact

#### Before Fix
- Empty rooms accumulated indefinitely
- Only rooms with started timers were cleaned
- User confusion with phantom rooms

#### After Fix
- Empty rooms deleted after 1 hour
- Scheduled rooms kept until activated or very old
- Rooms with timers cleaned as expected
- System stays clean automatically

### Testing the Fix

```bash
# Deploy updated functions
cd functions && npm install && firebase deploy --only functions

# Monitor logs
firebase functions:log

# Expected output:
# "Deleting empty room room_xxx (created at ..., age: 3600s)"
# "After removing stale participants, room_yyy has 0 active participants"
```

#### Manual Testing

1. **Create a room** but don't join it
2. **Wait 1 hour** (or manually adjust in code for testing)
3. **Check cleanup logs**: Should see deletion message
4. **Verify in Firebase Console**: Room should be gone

### Edge Cases Handled

✅ Room with participants who all left
✅ Empty room that was never joined
✅ Scheduled room not yet activated
✅ Room with one stale participant
✅ Room that had timer but was never started
✅ Recently created empty room (kept, not deleted)

### Rollback

If needed, revert to previous version:
```bash
# Use previous functions/index.js
git checkout HEAD~1 functions/index.js
firebase deploy --only functions
```

### Future Improvements

1. **Configurable empty room threshold**: Allow setting via env variable
2. **Scheduled room auto-cleanup**: Delete scheduled rooms older than X days
3. **Owner-based cleanup**: Delete rooms where owner is inactive
4. **Analytics**: Track deletion reasons (empty, timeout, stale, etc.)

### Deployment Notes

- ✅ **No database schema changes**
- ✅ **Backwards compatible** with existing rooms
- ✅ **Zero impact** on running rooms or active timers