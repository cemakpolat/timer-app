# Timer App Cloud Functions

This folder contains a scheduled Cloud Function that cleans up finished/empty focus rooms.

How it works

- The scheduled function `scheduledRoomCleanup` runs every 5 minutes.
- It scans `/focusRooms` and finds rooms whose `timer.endsAt` + `delay` has passed.
- The delay is determined by, in order of precedence:
  1. `focusRooms/{roomId}/emptyRoomRemovalDelaySec` (per-room setting)
  2. `EMPTY_ROOM_REMOVAL_DELAY_SEC` environment variable for the function
  3. Default of 120 seconds
- If the room has no participants it is deleted. If it has participants, the function checks `/presence/{uid}.lastSeen` and will delete the room only if participants have been inactive for at least 2 minutes.

Deployment

1. Install Firebase CLI and log in:

   npm install -g firebase-tools
   firebase login

2. From this `functions` folder, install dependencies and deploy the function:

   cd functions
   npm install
   firebase deploy --only functions:scheduledRoomCleanup

Cost & budget recommendations

- Schedule frequency: the function is configured to run every 15 minutes by default to balance responsiveness and cost. If you don't need aggressive cleanup, consider increasing this to every 30 minutes.
- Budget & alerts: enable a billing budget in the GCP Console to get notified if spend approaches a threshold. Steps:
   1. Open the Google Cloud Console for your Firebase project.
   2. Go to Billing → Budgets & alerts.
   3. Create a budget for the project and set a low amount (for example, $5/month) to get early warnings.
   4. Configure alert thresholds (50%, 80%, 100%) and add email recipients.

- Monitoring: use Firebase Console → Usage and billing and GCP Monitoring to watch function invocations, execution time, and Realtime Database bandwidth.

Deploying after changes

1. From the `functions` folder:
    npm install
    firebase deploy --only functions:scheduledRoomCleanup

2. After deploy, check Logs in the Firebase Console → Functions to verify the scheduled runs and any deletions.
Local testing

- To test locally, set `GOOGLE_APPLICATION_CREDENTIALS` to a service account key JSON file with Realtime Database access and run a one-off script or use the emulator. The function uses the Admin SDK and requires appropriate permissions.

Notes

- This function performs multi-path updates to remove the room and associated `userRooms/{uid}` entries.
- It intentionally does a full scan of `focusRooms` for simplicity; if your dataset grows large, we should convert rooms to smaller indexable shapes or use Firestore for better query support.
