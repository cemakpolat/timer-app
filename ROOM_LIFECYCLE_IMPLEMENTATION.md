# Room Lifecycle Management Implementation

## Summary

Implemented **Phase 1 (Stale Participant Detection)** and **Phase 3 (Timer Expiration UI)** of the room cleanup feature. Phase 2 (Room Creation TTL + Future Scheduling) deferred for later implementation.

---

## Phase 1: Stale Participant Detection ✅ DONE

### What was implemented:
1. **Stale participant detection in Cloud Functions** (`functions/index.js`)
   - Participants with no presence update for **5+ minutes** are marked as "stale"
   - Stale participants are automatically removed from the room's participant list
   - If room owner is stale → flag `ownerDisconnected = true` is set on the room

2. **Improved cleanup logic**
   - After stale participant removal, room is re-evaluated for deletion
   - If room becomes empty after stale removal → room is deleted
   - If active participants remain → room continues

### Use case coverage:
- **Case 2 (Owner disconnects mid-session)**: ✅ Owner will be detected as stale after 5 minutes with no presence update. `ownerDisconnected` flag allows client-side UI to show "Owner disconnected" message.

### Configuration:
- **Stale threshold**: `5 * 60 * 1000` ms (5 minutes) - configurable in `functions/index.js` line 21
- **Runs every**: 15 minutes (scheduled Cloud Function)

### Code location:
- `functions/index.js`: `removeStaleParticipants()` helper function
- `scheduledRoomCleanup` logic updated to call stale removal before checking room eligibility

---

## Phase 3: Timer Expiration UI with Extension ✅ DONE

### What was implemented:

1. **RoomExpirationModal Component** (`src/components/FocusRooms/RoomExpirationModal.js`)
   - **For Owner**:
     - Shows timer countdown (2-min grace period before auto-close)
     - Dropdown to select extension (5, 10, 15, 20, 25, or 30 minutes)
     - "Extend Timer" button to add time
     - "Close Room Now" button to close immediately
   
   - **For Non-Owners**:
     - Shows "Owner is deciding..." message
     - "Leave Room" option
     - Cannot extend or close (owner-only privilege)

2. **Timer Extension Logic** (`src/services/firebase/FirebaseService.js`)
   - New `extendRoomTimer(roomId, extensionMs)` method
   - Validates: only room owner can extend
   - Enforces: max 30 minutes per extension
   - Updates: both `timer.endsAt` and `timer.duration` atomically
   - Adds: `extendedAt` timestamp for tracking

3. **App.js Integration** (`src/App.js`)
   - Real-time timer expiration detection (every 1 second)
   - Auto-shows modal when `timer.endsAt <= now`
   - Handlers:
     - `handleExtendTimer()`: Calls service, resets expiration state, shows success toast
     - `handleCloseRoom()`: Leaves room, closes modal, resets state
   - Modal auto-closes if all participants leave
   - Modal auto-closes if timer is extended

4. **useFocusRoom Hook Update** (`src/hooks/useFocusRoom.js`)
   - New `extendTimer(extensionMs)` function exposed
   - Calls Firebase service method
   - Error handling and state management

### Use case coverage:
- **Case 3 (Timer timeout with room closure)**: ✅ 
  - When timer ends, owner sees modal with options
  - Owner can extend (max 30 min each time)
  - Owner can close immediately
  - Non-owners see waiting message
  - Auto-close after 2 minutes if owner takes no action

### Configuration:
- **Grace period**: 120 seconds (configurable in RoomExpirationModal props)
- **Max extension**: 30 minutes (hardcoded: `MAX_EXTENSION_MS = 30 * 60 * 1000`)
- **Extension options**: 5, 10, 15, 20, 25, 30 minutes (configurable in RoomExpirationModal.js)

### UX Flow:
```
Timer Ends
    ↓
[Modal Appears]
    ↓
    ├─ Owner: [Extend 5-30 min] [Close Now] [Do Nothing]
    └─ Non-owner: [Leave Room] [Do Nothing]
    ↓
After 2 min (if no action) → Auto-close room
```

### Code locations:
- `src/components/FocusRooms/RoomExpirationModal.js`: Modal component
- `src/services/firebase/FirebaseService.js`: `extendRoomTimer()` method
- `src/hooks/useFocusRoom.js`: `extendTimer()` hook function
- `src/App.js`: Integration and event handling

---

## Phase 2: Room Creation TTL & Future Scheduling (Later) ⏸️

### What's NOT yet implemented (as requested - to implement later):

1. **Unstarted Room Cleanup**
   - Auto-delete rooms that:
     - Never started a timer
     - Created more than 10 minutes ago
     - No participants who recently joined

2. **Future Room Scheduling**
   - When creating a room, user can choose:
     - "Now" - room available immediately
     - "Future" - schedule for specific time (e.g., tomorrow at 11:00 AM)
   - For future rooms:
     - Export to Google Calendar
     - Room becomes available at scheduled time
     - User clicks calendar event → opens room

### Why deferred:
- Requires calendar API integration (Google Calendar)
- Requires scheduling UI/UX design
- Requires room state machine updates (scheduled → active)
- Can be implemented independently in later phase

---

## Testing Recommendations

### Phase 1 Testing:
1. Create a room with 2 participants
2. Have one participant close browser
3. Wait 5+ minutes
4. Verify participant is removed from `focusRooms/{roomId}/participants`
5. Verify room is deleted if all participants stale
6. Verify `ownerDisconnected` flag is set if owner is stale

### Phase 3 Testing:
1. Create a room and start a timer (short duration, e.g., 1 minute for testing)
2. As owner: verify modal appears when timer ends
3. Test extension: select 5 min, click "Extend Timer", verify timer extended
4. Test close: click "Close Room Now", verify room closes
5. Test auto-close: let timer end, wait 2 minutes, verify room auto-closes
6. Test non-owner: join as non-owner, let timer end, verify limited UI

---

## Database Schema Updates

### New Room Fields:
```
focusRooms/{roomId}:
  timer:
    startedAt: number (timestamp)
    endsAt: number (timestamp)
    duration: number (seconds)
    extendedAt: number (timestamp) ← NEW (when extended)
  
  ownerDisconnected: boolean ← NEW (set by Cloud Function if owner stale)
```

### No Firebase Database Rules changes needed - existing rules remain compatible.

---

## Environment Variables (if needed)

Currently hardcoded in code, can be moved to env vars if desired:
- `STALE_PARTICIPANT_MS`: 5 minutes (Cloud Functions)
- `GRACE_PERIOD_SEC`: 120 seconds (React modal)
- `MAX_EXTENSION_MS`: 30 minutes (React modal)

---

## Next Steps

### For Phase 2 (when ready):
1. Design room scheduling UI
2. Add future room creation option to CreateRoomModal
3. Integrate Google Calendar API
4. Add scheduled room cleanup in Cloud Functions
5. Add room activation trigger when scheduled time arrives

### For Production:
1. **Testing**: Run through test scenarios above
2. **Monitoring**: Check Cloud Function logs for stale removal operations
3. **Analytics**: Track extension patterns, closure reasons
4. **Feedback**: Gather user feedback on 5-minute stale threshold

---

## Commits

- `f3667bf`: Phase 1 - Stale participant detection in Cloud Functions
- `3ed01e1`: Phase 1 & 3 - Timer expiration modal + extension logic

## Files Modified

- `functions/index.js`: Added stale participant detection
- `src/components/FocusRooms/RoomExpirationModal.js`: New modal component
- `src/services/firebase/FirebaseService.js`: Added `extendRoomTimer()` method
- `src/hooks/useFocusRoom.js`: Added `extendTimer()` hook function
- `src/App.js`: Integrated timer expiration detection and modal handling
