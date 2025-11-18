# Firebase Secrets Setup Guide

## Overview
This guide explains how to securely configure Firebase credentials using GitHub Secrets. This ensures your API keys and sensitive data are never hardcoded in the repository.

## Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **timerapp-2997d**
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll to "Your apps" section
5. Under your Web app, click the config button
6. Copy the configuration object

You'll need these values:
- `apiKey`
- `authDomain`
- `databaseURL`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

## Step 2: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/cemakpolat/timer-app
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret** and add each value:

| Secret Name | Value | Notes |
|---|---|---|
| `REACT_APP_FIREBASE_API_KEY` | Your Firebase API Key | Get from Firebase Console → Project Settings |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Format: `your-project.firebaseapp.com` |
| `REACT_APP_FIREBASE_DATABASE_URL` | Realtime Database URL | Format: `https://your-project-default-rtdb.firebaseio.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase Project ID | Your project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Storage Bucket | Format: `your-project.appspot.com` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID | Numeric ID from Firebase Console |
| `REACT_APP_FIREBASE_APP_ID` | Firebase App ID | Full app ID including prefix |

**Important:** Click "Add secret" after each entry!

## Step 3: Verify Secrets Are Set

After adding all 7 secrets, you should see them listed (values will be masked):

```
✓ REACT_APP_FIREBASE_API_KEY
✓ REACT_APP_FIREBASE_AUTH_DOMAIN
✓ REACT_APP_FIREBASE_DATABASE_URL
✓ REACT_APP_FIREBASE_PROJECT_ID
✓ REACT_APP_FIREBASE_STORAGE_BUCKET
✓ REACT_APP_FIREBASE_MESSAGING_SENDER_ID
✓ REACT_APP_FIREBASE_APP_ID
```

## Step 4: Local Development Setup

For local development, create a `.env.local` file in your project root:

```bash
# Copy from .env.example
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
nano .env.local
```

Fill in your actual Firebase values in `.env.local`. This file is **NEVER committed** (protected by `.gitignore`).

## Step 5: How It Works

### Local Development
- React reads from `.env.local` (local environment file)
- `.env.local` is in `.gitignore` - never committed

### GitHub Actions / Production Builds
- GitHub automatically injects secrets as environment variables
- React reads from these injected variables
- Code in `src/config/firebase.config.js` uses: `process.env.REACT_APP_FIREBASE_*`

### Code Example
```javascript
// src/config/firebase.config.js
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## Security Best Practices

✅ **DO:**
- Store sensitive values in GitHub Secrets
- Use `.env.example` as a template (no real values)
- Keep `.env.local` in `.gitignore`
- Review secrets are masked in logs
- Rotate keys if accidentally committed

❌ **DON'T:**
- Hardcode API keys in code
- Commit `.env.local`
- Share Firebase credentials via chat/email
- Use the same credentials across multiple environments

## Troubleshooting

**❌ "Firebase config is undefined"**
- Check `.env.local` exists and is readable
- Verify values match your Firebase project
- Restart dev server after creating `.env.local`

**❌ "GitHub Actions build fails with 'Cannot read property of undefined'"**
- Verify all 7 secrets are set in GitHub
- Check secret names are spelled exactly (case-sensitive)
- Ensure no typos in secret values

**❌ "Change secrets but old values still used"**
- Wait a few minutes for GitHub to propagate
- Run workflow again or push new commit

## Next Steps

1. ✅ Add all 7 Firebase secrets to GitHub
2. ✅ Create `.env.local` for local development
3. ✅ Test locally: `npm start`
4. ✅ Push to GitHub and watch workflow use secrets

Your Timer App now has **enterprise-grade security** for sensitive credentials! 🔐

---

For more info: [Firebase Console](https://console.firebase.google.com/) | [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
