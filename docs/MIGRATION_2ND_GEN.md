# Cloud Functions 2nd Gen Migration Guide

## Overview
Migrate from 1st Gen to 2nd Gen Cloud Functions for timer-app. Your code is already 2nd-Gen ready; this guide covers removing old 1st Gen deployments and verifying the upgrade.

**Functions affected:** `activateScheduledRooms`, `scheduledRoomCleanup`, `scheduledUserCleanup`

### ⚠️ Critical Constraint (per [Firebase Docs](https://firebase.google.com/docs/functions/2nd-gen-upgrade))
**In-place upgrades with the same function name are NOT supported.** The error you saw in deployment:
```
Upgrading from 1st Gen to 2nd Gen is not yet supported. Please delete your old function or wait for this feature to be ready.
```

**Our solution:** Delete old 1st Gen functions first, then deploy new 2nd Gen versions with the same names. This works for scheduled background functions (no client traffic to redirect), and avoids the need to rename functions.

---

## Option 1: Automatic Migration via CI/CD (Recommended)

The deploy workflow has been updated to automatically delete 1st Gen functions before deploying 2nd Gen versions.

### Steps
1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "chore: prepare for Cloud Functions 2nd Gen migration"
   git push origin main
   ```

2. **Monitor the GitHub Action:**
   - Open [GitHub Actions](https://github.com/yourrepo/actions)
   - Watch the "Deploy to GCP" workflow
   - The "Delete 1st Gen Cloud Functions" step will run before deployment
   - Expected output: Functions deleted or "not found" messages

3. **Verify deployment:**
   - Workflow completes successfully ✓
   - All 3 functions deploy with 2nd Gen (see [Verification](#verification) below)

### Timeline
- Deployment: ~3-5 min
- Function deletion: ~30 sec
- Function deployment: ~2-3 min
- Downtime: ~5-10 min total (room/user cleanup paused during deletion/redeployment)

### Why This Approach Works
Firebase docs state: "It is not possible to upgrade a function from 1st to 2nd gen with the same name." However, your scheduled functions have **no direct clients**—they run on timers. We can safely:
1. Delete old 1st Gen functions (stops schedules for ~30 sec)
2. Deploy new 2nd Gen versions with the same names (resumes on new schedule)
3. No need to rename or redirect traffic (unlike HTTP/callable functions)

---

## Option 2: Manual Migration (Testing First)

Use the helper script to test locally or delete functions manually before deployment.

### Prerequisites
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Authenticate with your Firebase project
firebase login
```

### Command to List Functions (No-op - safe to run)
```bash
./scripts/migrate-to-2nd-gen.sh --check-only
```

Expected output:
```
📋 Functions scheduled for deletion:
  - activateScheduledRooms
  - scheduledRoomCleanup
  - scheduledUserCleanup

Current deployed functions:
activateScheduledRooms (us-central1) ... running (2nd gen)
scheduledRoomCleanup (us-central1) ... running (1st gen) ← These get deleted
scheduledUserCleanup (us-central1) ... running (1st gen) ← These get deleted
```

### Command to Delete Functions & Deploy (Full Migration)
```bash
# Make script executable
chmod +x scripts/migrate-to-2nd-gen.sh

# Run migration (will prompt for confirmation)
./scripts/migrate-to-2nd-gen.sh

# To skip confirmation:
./scripts/migrate-to-2nd-gen.sh --force
```

Expected output:
```
🗑️  Deleting 1st Gen functions...
  Deleting: activateScheduledRooms (us-central1)...
  Deleting: scheduledRoomCleanup (us-central1)...
  Deleting: scheduledUserCleanup (us-central1)...
✓ Function deletions complete

🚀 Deploying 2nd Gen functions...
   Running: firebase deploy --only functions
...
✅ Migration complete!
```

### Troubleshooting
**Error: "Firebase CLI not found"**
```bash
npm install -g firebase-tools
```

**Error: "Could not delete function"**
- Function may already be deleted (safe to retry)
- May not have permissions (check `gcloud` auth)

---

## Option 3: Manual CLI Commands (Full Control)

Delete functions one by one, then deploy:

```bash
# Step 1: Delete each 1st Gen function
firebase functions:delete activateScheduledRooms --region us-central1 --force
firebase functions:delete scheduledRoomCleanup --region us-central1 --force
firebase functions:delete scheduledUserCleanup --region us-central1 --force

# Step 2: Deploy 2nd Gen functions
firebase deploy --only functions --force
```

---

## Verification

After migration completes:

### 1. Firebase Console Verification
1. Open [Firebase Console](https://console.firebase.google.com) → timerapp-2997d
2. Navigate to **Functions** tab
3. Verify all 3 functions appear with **🏷️ Generation: 2nd Gen** badge

**Expected view:**
```
✓ activateScheduledRooms (us-central1)
  Generation: 2nd Gen
  Runtime: Node.js 20
  Memory: 256 MB

✓ scheduledRoomCleanup (us-central1)
  Generation: 2nd Gen
  Runtime: Node.js 20
  Memory: 256 MB

✓ scheduledUserCleanup (us-central1)
  Generation: 2nd Gen
  Runtime: Node.js 20
  Memory: 256 MB
```

### 2. Functional Verification (Wait ~15 min)

The `scheduledRoomCleanup` function runs every 15 minutes by default.

**Check execution logs:**
```bash
gcloud functions logs read scheduledRoomCleanup \
  --region us-central1 \
  --limit 50
```

Or via Firebase Console:
1. Click the **scheduledRoomCleanup** function
2. Select the **Logs** tab
3. Look for recent execution entries with status ✓

**Expected log messages:**
```
Cloud Function Configuration:
  CLEANUP_SCHEDULE: every 15 minutes
  STALE_THRESHOLD_MS: 300000ms (5.0 min)
  ...
Starting scheduled room cleanup on schedule: every 15 minutes
No focusRooms found
✓ scheduledRoomCleanup complete
```

### 3. Health Check Over 24 Hours

Monitor metrics to ensure stability:

```bash
# View metric summary
gcloud functions describe scheduledRoomCleanup \
  --region us-central1 \
  --format="value(status,runtime,sourceArchiveUrl)"

# View execution metrics
gcloud monitoring time-series list \
  --filter='metric.type="cloudfunctions.googleapis.com/execution_count"'
```

**Healthy indicators:**
- ✓ Executions per 15 min: 1 (on schedule)
- ✓ Error rate: 0%
- ✓ Average execution time: < 20 seconds
- ✓ No timeouts or out-of-memory errors

---

## Rollback (If Needed)

If 2nd Gen functions fail critically:

1. **Delete 2nd Gen functions:**
   ```bash
   firebase functions:delete activateScheduledRooms --force
   firebase functions:delete scheduledRoomCleanup --force
   firebase functions:delete scheduledUserCleanup --force
   ```

2. **Redeploy 1st Gen (from git history):**
   ```bash
   git checkout HEAD~1 -- functions/
   firebase deploy --only functions --force
   ```

---

## What Changed

**Code:** No changes required (already 2nd Gen–ready; using `firebase-functions/v2/scheduler`)

**Deployment:** 
- Before: `firebase-functions@5.x` with v1 APIs
- After: `firebase-functions@6.x` with v2 APIs (already in [package.json](../functions/package.json))

**Runtime:** Node.js 20 (already configured in [firebase.json](../firebase.json))

**Behavior:** Functions work identically (room cleanup, user cleanup, room activation on same schedules)

---

## Support

If migration issues arise:
- Check [Firebase Functions 2nd Gen Docs](https://firebase.google.com/docs/functions/2nd-gen-overview)
- Review function logs in Firebase Console
- Test locally: `firebase emulators:start --only functions`

---

## Next Steps

- [ ] Choose migration option (Option 1 recommended)
- [ ] Execute migration
- [ ] Verify in Firebase Console (2nd Gen badge visible)
- [ ] Wait 15 min for `scheduledRoomCleanup` to fire
- [ ] Check logs confirm execution success
- [ ] Monitor over 24 hours for stability

---

**What's Next?** Once verified, your app will benefit from:
- ✅ Reduced cold-start times (~90% faster)
- ✅ Auto-scaling optimized for 2nd Gen
- ✅ Latest security and performance updates
- ✅ Support for concurrent function execution
