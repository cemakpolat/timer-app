#!/bin/bash

# 🚨 FIREBASE CREDENTIALS REMOVAL SCRIPT
# This script removes exposed Firebase credentials from git history
# 
# IMPORTANT: 
# 1. YOU MUST ROTATE THE FIREBASE CREDENTIALS FIRST in Firebase Console
# 2. This will rewrite git history (force push required)
# 3. All collaborators must re-clone the repository

set -e

echo "🔍 Firebase Credentials Removal Script"
echo "======================================"
echo ""
echo "⚠️  IMPORTANT WARNINGS:"
echo "1. You MUST have rotated Firebase credentials FIRST"
echo "2. This will rewrite git history"
echo "3. You will need to force push to GitHub"
echo "4. All collaborators must re-clone"
echo ""
read -p "Have you rotated your Firebase credentials? (yes/no): " confirm
if [[ "$confirm" != "yes" ]]; then
  echo "❌ STOPPED: Please rotate credentials first in Firebase Console"
  exit 1
fi

echo ""
echo "Creating backup of repository..."
if [ ! -d "backup-before-filter" ]; then
  git clone --mirror . backup-before-filter
  echo "✅ Backup created at: backup-before-filter"
else
  echo "⚠️  Backup already exists, skipping"
fi

echo ""
echo "Creating patterns file for credential removal..."
cat > /tmp/remove-patterns.txt << 'EOF'
AIzaSyDS9NXmEZxyaWT3dE4E14u_43ZHptR18cs
timerapp-2997d.firebaseapp.com
timerapp-2997d-default-rtdb.firebaseio.com
timerapp-2997d.appspot.com
timerapp-2997d.firebasestorage.app
02b636c85719a526b2e293
EOF

echo "✅ Patterns file created"
echo ""
echo "Removing credentials from git history..."
echo "This may take a moment..."

git filter-repo --replace-text /tmp/remove-patterns.txt --force

echo ""
echo "✅ Credentials removed from history!"
echo ""
echo "🔄 Next steps:"
echo "1. Verify credentials are removed: git log -p --all | grep AIzaSyDS9NXmEZxyaWT3dE4E14u_43ZHptR18cs"
echo "2. Force push to GitHub: git push --force-with-lease origin main"
echo "3. Update GitHub Secrets with NEW credentials"
echo "4. Test locally: npm start"
echo ""
echo "⚠️  Don't forget to notify collaborators to re-clone the repository!"
echo ""
