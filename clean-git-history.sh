#!/bin/bash

# 🚨 WARNING: This script rewrites git history!
# After running, you MUST force push: git push --force-with-lease origin main
# All collaborators must re-clone the repository

set -e

echo "🧹 Starting comprehensive git history cleanup..."
echo ""

# Step 1: Create backup
if [ ! -d "backup-full-repo" ]; then
  echo "📦 Creating full repository backup..."
  git clone --mirror . backup-full-repo
  echo "✅ Backup created at: backup-full-repo"
else
  echo "⚠️  Backup already exists"
fi

echo ""
echo "🔄 Rewriting git history with git-filter-repo..."
echo ""

# Step 2: Remove unnecessary files from entire history
git filter-repo \
  --path-glob '*.txt' \
  --path-glob '.env' \
  --path-glob '.env.local' \
  --path-glob '.env.*.local' \
  --path-glob 'remove-credentials.sh' \
  --path-glob 'backup-before-filter' \
  --path-glob 'ci-deployer-fresh-key.json' \
  --invert-paths \
  --force

echo ""
echo "✅ History cleanup complete!"
echo ""
echo "🔄 Next steps:"
echo "1. Review the changes: git log --oneline -20"
echo "2. Force push to GitHub: git push --force-with-lease origin main"
echo "3. Notify collaborators to re-clone the repository"
echo ""
echo "📝 Backup is saved at: backup-full-repo"
echo ""
