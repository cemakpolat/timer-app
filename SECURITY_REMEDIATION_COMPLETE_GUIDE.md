# 🔐 Firebase Credentials Security Incident - Complete Guide

## Executive Summary

**What Happened:**
- Firebase configuration (including API key) was hardcoded in `src/config/firebase.config.js`
- The file was committed to git history
- Credentials are now visible in the repository for anyone with access

**Risk Level:** 🔴 **HIGH** - API key could be used to access your Firebase project

**What We Did:**
- ✅ Created automated remediation script
- ✅ Created comprehensive documentation
- ✅ Prepared secure configuration system (GitHub Secrets + env vars)
- ✅ Set up guides for future security

**What You Need to Do:** Execute 5 steps (~15 minutes)

---

## 📋 Exposed Information

| Type | Status | Details |
|------|--------|---------|
| **API Key** | 🔴 EXPOSED | Firebase API Key |
| **Project ID** | 🟡 PUBLIC | Firebase Project Identifier |
| **Database URL** | 🟡 PUBLIC | Realtime Database URL |
| **Storage Bucket** | 🟡 PUBLIC | Cloud Storage Bucket |
| **App ID** | 🟡 PUBLIC | Firebase App Configuration |
| **Sender ID** | 🟡 PUBLIC | Messaging Sender ID |

**Visibility:** Anyone with GitHub repository access can see this in git history

---

## 🛠️ Remediation Execution Plan

### Timeline
- **Phase 1 (5 min):** Rotate Firebase credentials
- **Phase 2 (2 min):** Clean git history
- **Phase 3 (1 min):** Force push to GitHub
- **Phase 4 (2 min):** Update GitHub Secrets
- **Phase 5 (1 min):** Verify and test
- **Total: ~15 minutes**

---

## ✅ Phase 1: Rotate Firebase Credentials

### Why This Must Be Done First
Without rotating, the exposed API key can still be used even after removing from git history.

### Steps

1. **Access Firebase Console**
   - URL: https://console.firebase.google.com/
   - Select: Your Firebase project

2. **Navigate to API Keys**
   - Click gear ⚙️ icon
   - Click **Project Settings**
   - Look for **API keys** section

3. **Delete Exposed Key**
   - Find your exposed Firebase API key
   - Click the **delete button** (trash icon)
   - Confirm deletion
   - ✅ Key is now revoked - can no longer be used

4. **Create New API Key**
   - Click **Create API key** button
   - Choose **API key** (not OAuth2)
   - Firebase generates a new key
   - **Copy the new key** - you'll need it in Phase 4

5. **Regenerate Web App Config (Optional but Recommended)**
   - In **Web apps** section
   - Create a new web configuration
   - Or skip if current config works

### Success Criteria
- Old key is deleted (revoked)
- New key is created
- New key is copied and saved

---

## ✅ Phase 2: Clean Git History

### Why This Matters
Removes the exposed credentials from every commit that contained them.

### Steps

1. **Confirm Phase 1 is Complete**
   - Old Firebase credentials are rotated ✅
   - New credentials created ✅

2. **Run Removal Script**
   ```bash
   cd /Users/cemakpolat/Development/timer-app
   bash remove-credentials.sh
   ```

3. **Answer the Prompt**
   ```
   Have you rotated your Firebase credentials? (yes/no): yes
   ```

4. **Script Will:**
   - Create backup at `backup-before-filter/` 🔄
   - Remove exposed credentials from ALL commits 🧹
   - Rewrite git history 📝
   - Show "Credentials removed from history!" when done ✅

### Script Details
The script removes these types of data from entire git history:
- Firebase API Keys
- Firebase Project IDs
- Database URLs
- Storage Buckets
- Firebase App IDs

### Success Criteria
- Script completes without errors
- Backup created
- Ready to force push

---

## ✅ Phase 3: Force Push to GitHub

### ⚠️ DESTRUCTIVE OPERATION
This permanently rewrites git history on GitHub. All collaborators must re-clone.

### Steps

1. **Run Force Push**
   ```bash
   git push --force-with-lease origin main
   ```

2. **What `--force-with-lease` Does**
   - Force pushes history
   - But fails if someone else pushed in the meantime (safety feature)

3. **If You Get an Error**
   ```bash
   # Try again, or use full force (less safe):
   git push --force origin main
   ```

4. **Verify Push Succeeded**
   ```bash
   git log --oneline -3
   # Should show recent commits
   ```

### Success Criteria
- Push completes
- No error messages
- GitHub repository updated

### Notify Collaborators
Send them this message:
```
Important: Repository history was force-pushed due to security 
remediation (exposed credentials removed). Please re-clone:

  rm -rf timer-app
  git clone https://github.com/cemakpolat/timer-app.git
  cd timer-app
```

---

## ✅ Phase 4: Update GitHub Secrets

### Why This Is Important
New credentials are needed for CI/CD and GitHub Actions to work.

### Steps

1. **Open GitHub Secrets**
   - URL: https://github.com/cemakpolat/timer-app/settings/secrets/actions
   - You should see existing secrets (masked)

2. **Update Each Secret** (7 total)

   **Secret 1: REACT_APP_FIREBASE_API_KEY**
   - Click "Update" button
   - Paste: **Your NEW API key from Phase 1**
   - Save

   **Secret 2-7: Keep existing values** (or update if changed)
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
   - `REACT_APP_FIREBASE_DATABASE_URL`: Your Realtime Database URL
   - `REACT_APP_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`: Your storage bucket
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: Your sender ID
   - `REACT_APP_FIREBASE_APP_ID`: Your Firebase app ID

3. **Verify All 7 Secrets Are Set**
   - All should show (values masked)
   - No errors

### Success Criteria
- All 7 secrets updated
- NEW API key is set
- GitHub Actions can access credentials

---

## ✅ Phase 5: Verify & Test

### Verify Credentials Removed from History

```bash
# Check for Firebase API keys (should be empty)
git log -p --all | grep -i "AIza"

# Expected result: (no output - complete silence)
```

If you see any API keys in output = remediation failed ❌

### Test Application Locally

```bash
# First, update local .env.local with new credentials
cp .env.example .env.local
# Edit .env.local: Add new API key from Phase 1

# Start the app
npm start

# Expected: App loads without errors ✅
```

### Test GitHub Actions
- Push a commit to main
- Check GitHub Actions tab
- Workflow should run successfully
- Should deploy without credential errors

### Success Criteria
- No credentials in git history ✅
- App works locally ✅
- GitHub Actions runs successfully ✅

---

## 📋 Completion Checklist

```
PHASE 1: Rotate Firebase Credentials
[ ] Accessed Firebase Console
[ ] Deleted exposed API key
[ ] Created new API key
[ ] Copied new key for Phase 4

PHASE 2: Clean Git History
[ ] Ran: bash remove-credentials.sh
[ ] Answered: yes
[ ] Script completed successfully
[ ] Backup created

PHASE 3: Force Push
[ ] Ran: git push --force-with-lease origin main
[ ] Push succeeded
[ ] Notified collaborators

PHASE 4: Update Secrets
[ ] Updated REACT_APP_FIREBASE_API_KEY with NEW key
[ ] Updated other 6 secrets
[ ] All 7 secrets verified

PHASE 5: Verify & Test
[ ] Verified no credentials in git history
[ ] Tested app locally (npm start)
[ ] GitHub Actions ran successfully
```

---

## 🚨 Troubleshooting

### "remove-credentials.sh: command not found"
```bash
bash /Users/cemakpolat/Development/timer-app/remove-credentials.sh
```

### "git push fails with permission denied"
- Verify you have push access to repository
- Try: `git push --force-with-lease origin main` (with `--force-with-lease`)

### "App won't start locally"
- Verify `.env.local` exists
- Check all values in `.env.local` match Firebase Console
- Try: `npm install` then `npm start`

### "Still seeing credentials in git history"
- Phase 1 might not be complete - verify old key is deleted
- Run script again: `bash remove-credentials.sh`

### "GitHub Actions still failing"
- Verify GitHub Secrets were updated
- Check API key is NEW key from Phase 1, not old one
- Wait 2-3 minutes for GitHub to propagate changes
- Retry workflow

---

## 📚 Additional Resources

**Documentation Files:**
- `IMMEDIATE_ACTION.md` - Quick checklist version
- `REMEDIATION_QUICK_START.md` - Step-by-step guide
- `CREDENTIALS_EXPOSURE_REMEDIATION.md` - Detailed reference
- `remove-credentials.sh` - Automated removal script

**Firebase Documentation:**
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase API Keys](https://firebase.google.com/docs/projects/api-keys)

**GitHub Security:**
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

---

## 🎯 After Remediation

Your system will be secure:
- ✅ Old credentials revoked
- ✅ Git history cleaned
- ✅ New credentials in use
- ✅ Future credentials protected by GitHub Secrets
- ✅ Environment variables handle configuration
- ✅ No hardcoded secrets in code

---

## 🔄 For Future Security

1. **Never hardcode credentials** - Use environment variables
2. **Use `.env.local` for development** - It's in `.gitignore`
3. **Store secrets in GitHub Secrets** - They're encrypted
4. **Review commits before pushing** - Check for sensitive data
5. **Use `.env.example`** - As a template without real values

---

**You've got this! Start with Phase 1.** 🚀
