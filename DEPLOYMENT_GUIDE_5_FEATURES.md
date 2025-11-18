# Deployment Guide for 5 New Features

## Quick Summary of Changes

This deployment includes 5 features for the Timer App:
1. Cancel button for timer creation
2. Hide sequences in composite mode
3. Phase 2a room scheduling
4. Room creation limits
5. Calendar export functionality

---

## Pre-Deployment Checklist

- [ ] Review all changes in `FEATURE_IMPLEMENTATION_SUMMARY.md`
- [ ] Run tests for all 5 features
- [ ] Verify Firebase Database Rules are up-to-date
- [ ] Ensure Cloud Functions have correct environment variables
- [ ] Backup current Firebase Realtime Database

---

## Deployment Steps

### 1. Deploy Frontend (React App)

```bash
cd /Users/cemakpolat/Development/timer-app

# Install dependencies (if needed)
npm install

# Build the production bundle
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

**Expected Output**: "Deploy complete!"

### 2. Deploy Cloud Functions

```bash
# Ensure you're in the functions directory
cd functions

# Install dependencies
npm install

# Deploy functions
firebase deploy --only functions
```

**Expected Output**: 
- `activateScheduledRooms` function deployed
- `scheduledRoomCleanup` function deployed

### 3. Verify Deployment

After deployment, verify the features:

```bash
# Check function logs
firebase functions:log

# Test Cloud Functions in Firebase Console
# - Go to Cloud Functions > activateScheduledRooms
# - Verify it runs on schedule (default: every 15 minutes)
```

---

## Feature Validation

### After Deployment Checklist

#### Task 1: Cancel Button
- [ ] Open app in browser
- [ ] Go to Timer tab → Create button
- [ ] Verify "Cancel" button appears next to "Create Timer"
- [ ] Click Cancel and verify form closes

#### Task 2: Hide Sequences
- [ ] Go to Timer tab → create a sequence
- [ ] Switch to Composite tab
- [ ] Try to create a timer → verify "Sequences" not in group dropdown
- [ ] Switch back to Timer tab → verify "Sequences" appears

#### Task 3: Room Scheduling
- [ ] Go to Focus Rooms → Create Room
- [ ] Toggle "Schedule for Later" button
- [ ] Pick a future date/time
- [ ] Create room
- [ ] Verify room shows "📅 Scheduled" badge
- [ ] Verify "Not Ready" button (disabled)
- [ ] Wait for scheduled time or manually trigger `activateScheduledRooms`
- [ ] Verify room becomes "active" and Join button is enabled

#### Task 4: Room Limits
- [ ] Create one active room
- [ ] Try creating another → verify error: "You already have an active room"
- [ ] Leave the room
- [ ] Create new room → verify success
- [ ] (Optional) Create many rooms to test 100 limit

#### Task 5: Calendar Export
- [ ] Create a scheduled room
- [ ] Look for green "Export" button on the room card
- [ ] Click Export → verify modal opens
- [ ] Click "Download .ics File" → verify file downloads
- [ ] Click Export again on same/different room
- [ ] Click "Add to Google Calendar" → verify Google Calendar opens
- [ ] Add event to your calendar and verify

---

## Rollback Procedure

If issues occur, rollback is straightforward:

```bash
# Revert to previous build
firebase deploy --only hosting

# To revert functions (if needed)
cd functions
npm install
firebase deploy --only functions
```

---

## Environment Variables (Cloud Functions)

Verify these are set (check in Firebase Cloud Functions settings):

```
CLEANUP_SCHEDULE=every 15 minutes
STALE_THRESHOLD_MS=300000
PRESENCE_INACTIVE_THRESHOLD_MS=120000
EMPTY_ROOM_REMOVAL_DELAY_SEC=120
```

If not set, the functions will use defaults (which is fine).

---

## Database Changes

**New Room Fields** (automatically added on first room creation):
```javascript
{
  scheduledFor: number (timestamp), // When room becomes active
  status: "scheduled|active|completed" // Room status
}
```

Old rooms without these fields still work fine (fields are optional).

---

## Monitoring After Deployment

### Cloud Functions Logs

Check logs regularly:
```bash
firebase functions:log
```

Look for:
- ✅ `activateScheduledRooms` running every 15 minutes
- ✅ No error messages in logs
- ✅ Correct count of activated rooms

### Firebase Console

Go to Firebase Console → Realtime Database → Data:
1. Look for `focusRooms` with `status: "scheduled"`
2. Verify `scheduledFor` timestamps are set correctly
3. Monitor room count to ensure < 100

### User Analytics

Monitor in Firebase Analytics:
- New event: "calendar_export" (custom event)
- New event: "room_scheduled" (custom event)

---

## Known Limitations & Notes

1. **Timezone Handling**: Currently uses browser timezone for date/time picker
   - Future enhancement: Add timezone selector
   
2. **Google Calendar Rate Limits**: API has rate limits for direct integration
   - Current approach opens calendar in browser (no rate limits)
   
3. **ICS Import Compatibility**: Most calendar apps support ICS, but:
   - Some older apps may not parse all fields
   - Test with your primary calendar app
   
4. **Room Cleanup**: Scheduled rooms that aren't joined are eventually deleted
   - Cleanup happens after timer ends + grace period
   - Scheduled rooms that never activate can accumulate (consider adding purge for very old scheduled rooms)

---

## Support & Troubleshooting

### Issue: Scheduled rooms not activating

**Cause**: Cloud Functions not running
**Solution**:
1. Check Cloud Functions logs: `firebase functions:log`
2. Verify `activateScheduledRooms` is deployed
3. Check `CLEANUP_SCHEDULE` environment variable
4. Manually trigger: Go to Google Cloud Console → Cloud Functions → Run function

### Issue: Calendar export not working

**Cause**: JavaScript error or browser permission
**Solution**:
1. Check browser console for errors (F12)
2. Verify ICS file format in Network tab
3. Check user has Google account logged in (for Google Calendar export)

### Issue: Room creation limit errors

**Cause**: Stale rooms in database
**Solution**:
1. Check if old completed rooms are being counted
2. Verify cleanup function is running
3. Manually delete completed rooms if needed

---

## Performance Considerations

- **Cloud Functions**: Activate function runs every 15 min (configurable)
- **Database Queries**: Minimal impact (only reads on schedule)
- **Frontend**: Calendar service is client-side (no server load)

---

## Security Notes

- All room limits are enforced server-side in Cloud Functions
- Database rules prevent unauthorized access
- ICS export only uses public room information
- Google Calendar integration uses standard OAuth flow

---

## Version Compatibility

- React: 17.0+
- Firebase: 9.0+
- Node.js: 16+ (Cloud Functions)
- Supported Browsers: Chrome, Firefox, Safari, Edge (all recent versions)

---

## Next Steps

After successful deployment:

1. ✅ Announce new features in app changelog
2. ✅ Monitor user adoption of calendar export
3. ✅ Gather user feedback on room scheduling
4. ✅ Consider adding recurring room schedules (future feature)
5. ✅ Monitor room limits (adjust if needed based on usage)

---

## Quick Reference Links

- Feature Summary: `FEATURE_IMPLEMENTATION_SUMMARY.md`
- Previous Room Lifecycle: `ROOM_LIFECYCLE_IMPLEMENTATION.md`
- Cloud Functions Env Vars: `CLOUD_FUNCTIONS_ENV_VARS.md`
- Firebase Setup: `FIREBASE-SETUP.md`
- README: `README.md`

---

**Deployment Date**: November 18, 2025
**Last Updated**: November 18, 2025
