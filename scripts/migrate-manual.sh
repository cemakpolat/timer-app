#!/bin/bash
# Quick reference: Manual deletion via CLI (Option 3)
# Use this if you prefer direct control without scripts or CI/CD

set -e

echo "🔐 Firebase Cloud Functions 1st Gen → 2nd Gen Migration (Manual)"
echo ""
echo "Prerequisites:"
echo "  ✓ firebase-tools installed (npm install -g firebase-tools)"
echo "  ✓ Authenticated (firebase login)"
echo "  ✓ In project directory (/Users/cemakpolat/Development/own-projects/timer-app)"
echo ""

# Confirm before proceeding
read -p "⚠️  Ready to delete 1st Gen functions? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

echo ""
echo "🗑️  Deleting 1st Gen Cloud Functions..."
echo ""

# Delete each function with feedback
echo "1/3 Deleting: activateScheduledRooms..."
firebase functions:delete activateScheduledRooms --region us-central1 --force || \
  echo "  ℹ️  Not found (already deleted or doesn't exist)"

echo ""
echo "2/3 Deleting: scheduledRoomCleanup..."
firebase functions:delete scheduledRoomCleanup --region us-central1 --force || \
  echo "  ℹ️  Not found (already deleted or doesn't exist)"

echo ""
echo "3/3 Deleting: scheduledUserCleanup..."
firebase functions:delete scheduledUserCleanup --region us-central1 --force || \
  echo "  ℹ️  Not found (already deleted or doesn't exist)"

echo ""
echo "✅ Function deletions complete!"
echo ""
echo "🚀 Now deploying 2nd Gen functions..."
firebase deploy --only functions --force

echo ""
echo "✅ Migration complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Open Firebase Console → Functions"
echo "  2. Verify all 3 functions show 'Generation: 2nd Gen'"
echo "  3. Wait ~15 min for scheduledRoomCleanup to execute"
echo "  4. Check logs to confirm successful execution"
echo ""
echo "📖 Full guide: see docs/MIGRATION_2ND_GEN.md"
