# Cloud Functions Environment Variables Configuration

This document describes all configurable environment variables for the Cloud Functions deployed to Firebase.

## Configuration Variables

### 1. **CLEANUP_SCHEDULE**
**Type**: String (Cloud Scheduler format)  
**Default**: `"every 15 minutes"`  
**Description**: Controls how often the `scheduledRoomCleanup` function runs. Uses Cloud Scheduler syntax for both human-readable and cron expressions.

**Examples**:
```
every 5 minutes     # Run every 5 minutes (more frequent cleanup, higher cost)
every 15 minutes    # Run every 15 minutes (default, balanced)
every 30 minutes    # Run every 30 minutes (less frequent, lower cost)
every 1 hour        # Run once per hour
0 * * * *           # Cron: Run at the top of every hour
*/5 * * * *         # Cron: Run every 5 minutes (cron syntax)
```

**When to change**:
- Increase (to 30 min or 1 hour) if you have few users and want to reduce costs
- Decrease (to 5 min) if you have many users and need faster room cleanup

---

### 2. **STALE_THRESHOLD_MS**
**Type**: Integer (milliseconds)  
**Default**: `300000` (5 minutes)  
**Description**: Time duration after which a participant is considered "stale" (no presence update). Stale participants are automatically removed from rooms.

**Examples**:
```
180000   # 3 minutes
300000   # 5 minutes (default - balances UX and cleanup)
600000   # 10 minutes (more lenient, users kept longer)
900000   # 15 minutes
```

**When to change**:
- Decrease (to 3 min) if you have unreliable network and want faster stale detection
- Increase (to 10+ min) if you want to be more lenient with disconnected users
- Correlates with user presence heartbeat interval (default 1 min in client)

---

### 3. **PRESENCE_INACTIVE_THRESHOLD_MS**
**Type**: Integer (milliseconds)  
**Default**: `120000` (2 minutes)  
**Description**: Time duration to check if a participant is still "active" (has recent presence update). Used to determine if room should be deleted after timer ends.

**Examples**:
```
60000    # 1 minute (strict)
120000   # 2 minutes (default)
180000   # 3 minutes
300000   # 5 minutes (lenient)
```

**When to change**:
- Decrease for stricter inactivity detection
- Increase if you want to keep rooms open longer when timer ends

**Note**: Different from `STALE_THRESHOLD_MS`:
- `STALE_THRESHOLD_MS`: Removes participants from participant list
- `PRESENCE_INACTIVE_THRESHOLD_MS`: Decides if room is deleted after timer ends

---

### 4. **EMPTY_ROOM_REMOVAL_DELAY_SEC**
**Type**: Integer (seconds)  
**Default**: `120` (2 minutes)  
**Description**: Delay (in seconds) after timer ends before an empty room is eligible for deletion. Gives users grace period before room is removed.

**Examples**:
```
60       # 1 minute (aggressive cleanup)
120      # 2 minutes (default, balanced)
300      # 5 minutes (lenient, users can rejoin)
600      # 10 minutes
```

**When to change**:
- Decrease for aggressive cleanup (free up DB space faster)
- Increase to give users more time to rejoin after accidental disconnect

---

## How to Set Environment Variables

### Option 1: Via `firebase.json` (Recommended for local development)
```json
{
  "functions": {
    "env": [
      "CLEANUP_SCHEDULE=every 30 minutes",
      "STALE_THRESHOLD_MS=300000",
      "PRESENCE_INACTIVE_THRESHOLD_MS=120000",
      "EMPTY_ROOM_REMOVAL_DELAY_SEC=120"
    ]
  }
}
```

### Option 2: Via Firebase Console (Production)
1. Go to Google Cloud Console → Cloud Functions
2. Click on `scheduledRoomCleanup` function
3. Edit → Runtime settings
4. Set Environment variables:
   - Key: `CLEANUP_SCHEDULE`, Value: `every 15 minutes`
   - Key: `STALE_THRESHOLD_MS`, Value: `300000`
   - Key: `PRESENCE_INACTIVE_THRESHOLD_MS`, Value: `120000`
   - Key: `EMPTY_ROOM_REMOVAL_DELAY_SEC`, Value: `120`

### Option 3: Via `gcloud` CLI
```bash
gcloud functions deploy scheduledRoomCleanup \
  --set-env-vars CLEANUP_SCHEDULE="every 15 minutes" \
  --set-env-vars STALE_THRESHOLD_MS="300000" \
  --set-env-vars PRESENCE_INACTIVE_THRESHOLD_MS="120000" \
  --set-env-vars EMPTY_ROOM_REMOVAL_DELAY_SEC="120" \
  --runtime nodejs20 \
  --project timerapp-2997d
```

### Option 4: Via GitHub Actions CI/CD (Automatic deployment)
Update `.github/workflows/deploy.yml` to pass env vars during `firebase deploy`:

```bash
firebase deploy --only functions \
  --env CLEANUP_SCHEDULE="every 15 minutes" \
  --env STALE_THRESHOLD_MS="300000" \
  --env PRESENCE_INACTIVE_THRESHOLD_MS="120000" \
  --env EMPTY_ROOM_REMOVAL_DELAY_SEC="120"
```

---

## Monitoring & Debugging

### Check Current Configuration
Cloud Functions logs will print configuration on each execution start:
```
Cloud Function Configuration:
  CLEANUP_SCHEDULE: every 15 minutes
  STALE_THRESHOLD_MS: 300000ms (5.0 min)
  PRESENCE_INACTIVE_THRESHOLD_MS: 120000ms (2.0 min)
  EMPTY_ROOM_REMOVAL_DELAY_SEC: 120s
```

View logs in Firebase Console → Functions → `scheduledRoomCleanup` → Logs tab

### Performance Tuning

**High DB costs?** → Increase `CLEANUP_SCHEDULE` to run less frequently  
**Users complaining about stale removal?** → Increase `STALE_THRESHOLD_MS`  
**Rooms not being deleted?** → Decrease `EMPTY_ROOM_REMOVAL_DELAY_SEC`  
**Too aggressive?** → Increase all thresholds

---

## Related Configuration (Client-side)

These environment variables work with client-side settings:
- **Presence heartbeat interval**: Default 1 minute (hardcoded in `src/hooks/usePresence.js`)
- **Timer expiration grace period**: Default 120 seconds (in `src/components/FocusRooms/RoomExpirationModal.js`)

If you change `STALE_THRESHOLD_MS` significantly, consider adjusting client presence heartbeat.

---

## Examples

### Scenario 1: High-traffic app (many rooms, want low costs)
```env
CLEANUP_SCHEDULE=every 1 hour
STALE_THRESHOLD_MS=600000        # 10 min - more lenient
PRESENCE_INACTIVE_THRESHOLD_MS=300000  # 5 min
EMPTY_ROOM_REMOVAL_DELAY_SEC=300  # 5 min
```

### Scenario 2: Low-latency app (fast cleanup, user experience priority)
```env
CLEANUP_SCHEDULE=every 5 minutes
STALE_THRESHOLD_MS=180000         # 3 min - stricter
PRESENCE_INACTIVE_THRESHOLD_MS=60000   # 1 min
EMPTY_ROOM_REMOVAL_DELAY_SEC=60   # 1 min
```

### Scenario 3: Development/Testing (aggressive cleanup)
```env
CLEANUP_SCHEDULE=every 1 minute
STALE_THRESHOLD_MS=60000          # 1 min
PRESENCE_INACTIVE_THRESHOLD_MS=30000   # 30 sec
EMPTY_ROOM_REMOVAL_DELAY_SEC=30   # 30 sec
```

---

## Deployment Example

To deploy with custom environment variables:

```bash
cd /path/to/timer-app/functions

# Deploy with environment variables
firebase deploy --only functions \
  --project timerapp-2997d \
  --token "$FIREBASE_DEPLOY_TOKEN" \
  --message "Custom cleanup config: 30 min schedule, 10 min stale threshold"
```

After deployment, verify in Cloud Console that env vars were applied.

---

## Notes

- All times are in **milliseconds** (except `EMPTY_ROOM_REMOVAL_DELAY_SEC` which is in seconds)
- Changes take effect on next function execution
- No code deployment required - just update env vars and redeploy
- Logs show configuration on startup for verification
