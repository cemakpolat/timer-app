# Cloud Functions Configuration Quick Reference

## Environment Variables Added ✅

| Variable | Default | Unit | Purpose |
|----------|---------|------|---------|
| **CLEANUP_SCHEDULE** | `every 15 minutes` | String | How often cleanup runs (e.g., `every 5 minutes`, `*/10 * * * *`) |
| **STALE_THRESHOLD_MS** | `300000` | ms | Time before participant marked as stale (5 min) |
| **PRESENCE_INACTIVE_THRESHOLD_MS** | `120000` | ms | Time before presence considered inactive (2 min) |
| **EMPTY_ROOM_REMOVAL_DELAY_SEC** | `120` | sec | Delay before empty room deleted (2 min) |

---

## Quick Setup

### ✅ Option 1: Firebase Console (Easiest)
1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Go to **Cloud Functions** → `scheduledRoomCleanup`
3. Click **Edit** → **Runtime settings**
4. Add environment variables:
   ```
   CLEANUP_SCHEDULE = every 15 minutes
   STALE_THRESHOLD_MS = 300000
   PRESENCE_INACTIVE_THRESHOLD_MS = 120000
   EMPTY_ROOM_REMOVAL_DELAY_SEC = 120
   ```
5. **Save and Deploy**

### ✅ Option 2: gcloud CLI
```bash
gcloud functions deploy scheduledRoomCleanup \
  --set-env-vars CLEANUP_SCHEDULE="every 15 minutes",STALE_THRESHOLD_MS="300000" \
  --runtime nodejs20 --project timerapp-2997d
```

### ✅ Option 3: GitHub Actions (Automatic)
Update `.github/workflows/deploy.yml` deploy step:
```bash
firebase deploy --only functions \
  --env CLEANUP_SCHEDULE="every 15 minutes" \
  --env STALE_THRESHOLD_MS="300000"
```

---

## Common Tuning Scenarios

### 💰 Reduce Costs (High traffic)
```
CLEANUP_SCHEDULE=every 1 hour
STALE_THRESHOLD_MS=600000          # 10 min
PRESENCE_INACTIVE_THRESHOLD_MS=300000  # 5 min
EMPTY_ROOM_REMOVAL_DELAY_SEC=300   # 5 min
```

### ⚡ Faster Cleanup (Low latency)
```
CLEANUP_SCHEDULE=every 5 minutes
STALE_THRESHOLD_MS=180000          # 3 min
PRESENCE_INACTIVE_THRESHOLD_MS=60000   # 1 min
EMPTY_ROOM_REMOVAL_DELAY_SEC=60    # 1 min
```

### 🧪 Development/Testing
```
CLEANUP_SCHEDULE=every 1 minute
STALE_THRESHOLD_MS=60000           # 1 min
PRESENCE_INACTIVE_THRESHOLD_MS=30000   # 30 sec
EMPTY_ROOM_REMOVAL_DELAY_SEC=30    # 30 sec
```

---

## Verification

After setting env vars, check Cloud Function logs:
- Go to [Cloud Functions Console](https://console.cloud.google.com/functions)
- Click `scheduledRoomCleanup` → **Logs**
- Look for output like:
  ```
  Cloud Function Configuration:
    CLEANUP_SCHEDULE: every 15 minutes
    STALE_THRESHOLD_MS: 300000ms (5.0 min)
    PRESENCE_INACTIVE_THRESHOLD_MS: 120000ms (2.0 min)
    EMPTY_ROOM_REMOVAL_DELAY_SEC: 120s
  ```

---

## What Each Variable Controls

### CLEANUP_SCHEDULE
**When to change**:
- Increase (1-2 hours) → Lower DB read costs, slower cleanup
- Decrease (5-10 min) → Higher costs, faster cleanup

### STALE_THRESHOLD_MS
**When to change**:
- Increase (10+ min) → Users kept in participant list longer after disconnect
- Decrease (3 min) → Faster stale detection, users removed from rooms quickly

### PRESENCE_INACTIVE_THRESHOLD_MS
**When to change**:
- Increase (5+ min) → Room stays open longer even with inactive users
- Decrease (30 sec) → More aggressive room deletion

### EMPTY_ROOM_REMOVAL_DELAY_SEC
**When to change**:
- Increase (5+ min) → Users have more time to rejoin after accidental close
- Decrease (30 sec) → Quick room cleanup, immediate DB space freed

---

## No Code Redeployment Needed! 🎉

Just update env vars in Cloud Console and the next execution will use new values. Logs confirm which config is active.

For detailed info, see `functions/CLOUD_FUNCTIONS_CONFIG.md`
