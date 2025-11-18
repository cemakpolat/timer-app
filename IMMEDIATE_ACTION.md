# 🔐 IMMEDIATE ACTION REQUIRED: Credentials Removal Steps

## Summary
Your Firebase credentials (API key, project ID, etc.) were hardcoded and committed to git. They're now exposed in the repository history.

**Status:** Ready for remediation (guides created, script ready)

---

## STEP-BY-STEP EXECUTION

### ✅ Step 1: Rotate Firebase Credentials (5 minutes)

**THIS MUST BE DONE FIRST!**

1. Open: https://console.firebase.google.com/
2. Select: Your Firebase project
3. Click gear ⚙️ → **Project Settings**
4. Go to: **API keys** tab
5. **DELETE** the exposed Firebase API key
6. Click **Create API key** → Generate **NEW key**
7. **COPY** the new API key
8. Also check: **Web apps** section and regenerate web app config if needed

✅ **When done:** The old key no longer works (revoked)

---

### ✅ Step 2: Run Credentials Removal Script (2 minutes)

**Only after Step 1 is complete!**

```bash
cd /Users/cemakpolat/Development/timer-app
bash remove-credentials.sh
```

The script will ask: **"Have you rotated your Firebase credentials? (yes/no):"**
- Type: `yes`
- Script will backup repo and remove all exposed credentials from git history

✅ **When done:** Backup created at `backup-before-filter`, history cleaned

---

### ✅ Step 3: Force Push Cleaned History (1 minute)

**After removal script completes:**

```bash
git push --force-with-lease origin main
```

⚠️ **Warning:** This overwrites history on GitHub. Tell collaborators to re-clone.

✅ **When done:** Credentials removed from GitHub repository

---

### ✅ Step 4: Update GitHub Secrets (2 minutes)

1. Go to: https://github.com/cemakpolat/timer-app/settings/secrets/actions
2. For each secret, click **Update** and change the value:

| Secret | New Value |
|--------|-----------|
| `REACT_APP_FIREBASE_API_KEY` | **← NEW API KEY from Step 1** |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain |
| `REACT_APP_FIREBASE_DATABASE_URL` | Your Realtime Database URL |
| `REACT_APP_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Your storage bucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
| `REACT_APP_FIREBASE_APP_ID` | Your app ID |

✅ **When done:** GitHub Actions will use new credentials

---

### ✅ Step 5: Verify Everything (1 minute)

Check no credentials remain:
```bash
git log -p --all | grep -i "AIza"
```

Expected result: **Empty (no output)**

Test locally:
```bash
npm start
```

Expected result: **App loads without errors** ✅

---

## 📋 Quick Checklist

```
[ ] Step 1: Rotated Firebase credentials (old key deleted, new key created)
[ ] Step 2: Ran bash remove-credentials.sh (answered "yes")
[ ] Step 3: Force pushed with git push --force-with-lease origin main
[ ] Step 4: Updated all 7 GitHub Secrets with new values
[ ] Step 5: Verified no credentials in history + app works locally
```

---

## ⏱️ Total Time: ~15 minutes

## 📚 Documentation

If you need more details:
- **Full Guide:** `CREDENTIALS_EXPOSURE_REMEDIATION.md`
- **Quick Start:** `REMEDIATION_QUICK_START.md`
- **Removal Script:** `remove-credentials.sh`

---

## 🚨 IMPORTANT NOTES

1. **Must do Step 1 first** - Without rotating credentials, the old key can still be used maliciously
2. **No going back** - The force push rewrites history permanently
3. **Tell collaborators** - They must re-clone the repository
4. **Test afterwards** - Verify app still works with new credentials

---

**Ready? Start with Step 1!** 🚀
