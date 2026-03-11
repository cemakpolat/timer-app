#!/bin/bash
# Migrate Cloud Functions from 1st Gen to 2nd Gen
# This script deletes existing 1st Gen function deployments before redeploying as 2nd Gen
# 
# Usage:
#   ./scripts/migrate-to-2nd-gen.sh [--check-only] [--force]
#
# Options:
#   --check-only   List functions without deleting them
#   --force        Skip confirmation prompt and delete immediately

set -e

FORCE=false
CHECK_ONLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --force)
      FORCE=true
      shift
      ;;
    --check-only)
      CHECK_ONLY=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--check-only] [--force]"
      exit 1
      ;;
  esac
done

echo "🔍 Checking Firebase CLI availability..."
if ! command -v firebase &> /dev/null; then
  echo "❌ Firebase CLI not found. Install it: npm install -g firebase-tools"
  exit 1
fi

echo "✓ Firebase CLI found"
echo ""

# List functions to be deleted
FUNCTIONS_TO_DELETE=(
  "activateScheduledRooms"
  "scheduledRoomCleanup"
  "scheduledUserCleanup"
)

echo "📋 Functions scheduled for deletion:"
for func in "${FUNCTIONS_TO_DELETE[@]}"; do
  echo "  - $func"
done
echo ""

if [ "$CHECK_ONLY" = true ]; then
  echo "ℹ️  Running in CHECK-ONLY mode (no deletions)"
  echo ""
  echo "Current deployed functions:"
  firebase functions:list || echo "⚠️  Failed to list functions (may not be authenticated)"
  echo ""
  echo "To proceed with deletion, run:"
  echo "  ./scripts/migrate-to-2nd-gen.sh --force"
  exit 0
fi

# Confirmation
if [ "$FORCE" = false ]; then
  echo "⚠️  WARNING: This will delete 1st Gen Cloud Functions and redeploy as 2nd Gen."
  echo "   Deployment downtime: ~5-10 minutes"
  echo "   No data will be deleted (only function code)"
  echo ""
  read -p "Continue? (type 'yes' to confirm): " -r confirm
  if [[ ! $confirm =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Cancelled."
    exit 0
  fi
fi

echo ""
echo "🗑️  Deleting 1st Gen functions..."
for func in "${FUNCTIONS_TO_DELETE[@]}"; do
  echo ""
  echo "  Deleting: $func (us-central1)..."
  firebase functions:delete "$func" --region us-central1 --force 2>/dev/null || {
    echo "  ⚠️  Could not delete $func (may not exist or already deleted)"
  }
done

echo ""
echo "✓ Function deletions complete"
echo ""
echo "🚀 Deploying 2nd Gen functions..."
echo "   Running: firebase deploy --only functions"
firebase deploy --only functions

echo ""
echo "✅ Migration complete!"
echo ""
echo "📊 Verification steps:"
echo "  1. Open Firebase Console → Functions"
echo "  2. Verify all 3 functions show 'Generation: 2nd Gen' badge"
echo "  3. Wait ~15 min for scheduledRoomCleanup to trigger"
echo "  4. Check Cloud Functions logs for successful execution"
echo ""
