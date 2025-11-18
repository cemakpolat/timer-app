# 🔧 Firebase Deployment Troubleshooting

## Error: Process completed with exit code 1

Your deployment failed. Here are the most common causes and solutions:

---

## ❌ Most Common Issue: Secret Not Added Yet

### Problem
If this is your first deployment after generating the token, GitHub Actions can't find the secret.

### Solution
1. **Verify the secret was added:**
   - Go to: https://github.com/cemakpolat/timer-app/settings/secrets/actions
   - Look for `FIREBASE_DEPLOY_TOKEN` in the list
   - Should show "Updated X minutes ago"

2. **If it's not there:**
   - Paste the token you got from `firebase login:ci`
   - The token starts with `1//` followed by a long string
   - **⚠️ Never commit this token to GitHub!**

3. **Retry the workflow:**
   - Make a new commit: `git commit --allow-empty -m "retry: trigger deployment"`
   - Push: `git push origin main`

---

## ❌ Issue: Build Artifacts Not Found

### Problem
The deploy stage can't download the built app from the build stage.

### Symptom in Logs
```
Error: artifact not found for name: react-build
```

### Solution
1. Check that the **build stage** succeeded
2. Look at GitHub Actions logs for "Upload Build Artifacts" step
3. If upload failed, the build probably failed

**Check the build logs for errors:**
- Go to Actions → Latest workflow run
- Click "build" job
- Scroll to "Build React App with Firebase Credentials" step
- Look for npm or compilation errors

---

## ❌ Issue: Invalid Firebase Token

### Problem
The token is expired, malformed, or incorrect.

### Symptom in Logs
```
Error: Invalid authentication credentials
Error: The provided authentication credentials are not valid
```

### Solution
1. **Generate a new token:**
   ```bash
   firebase logout
   firebase login:ci
   ```

2. **Update the GitHub secret:**
   - Copy the new token from terminal
   - Go to GitHub Secrets settings
   - Update `FIREBASE_DEPLOY_TOKEN` with new token

3. **Retry:**
   ```bash
   git commit --allow-empty -m "retry: deployment with fresh token"
   git push origin main
   ```

---

## ❌ Issue: Firebase Project Not Found

### Problem
The project ID in the workflow doesn't match your Firebase project.

### Symptom in Logs
```
Error: Unable to find project 'timerapp-2997d'
```

### Solution
1. **Verify your Firebase project:**
   - Go to: https://console.firebase.google.com
   - Look at the project ID
   - Should be: `timerapp-2997d`

2. **If it's different, update the workflow:**
   - Edit `.github/workflows/deploy.yml`
   - Line ~175: Change `--project timerapp-2997d` to your actual project ID
   - Commit and push

---

## ❌ Issue: Build Folder Empty or Missing

### Problem
The React build failed but the deploy stage didn't detect it.

### Solution
1. **Check build locally:**
   ```bash
   npm install
   npm run build
   ls -la build/
   ```

2. **Common build errors:**
   - Missing dependencies: `npm ci` (instead of `npm install`)
   - Wrong Node version: Should be 18.x
   - Syntax errors in code

3. **If it works locally:**
   - Check GitHub Actions logs for the Build stage
   - Look for "npm run build" output
   - Check for TypeScript/ESLint errors

---

## ✅ How to Debug

### View Full Workflow Logs

1. Go to: https://github.com/cemakpolat/timer-app/actions
2. Click on the failed workflow run
3. Click on the "deploy" job
4. Click "Deploy to Firebase Hosting" step
5. Expand and read the full output

### Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `artifact not found` | Build stage failed | Check build logs |
| `Invalid token` | Token expired/wrong | Regenerate with `firebase login:ci` |
| `Unable to find project` | Wrong project ID | Verify in Firebase Console |
| `EACCES: permission denied` | Rare - token issue | Regenerate token |

---

## 📋 Checklist Before Retry

- [ ] Secret `FIREBASE_DEPLOY_TOKEN` added to GitHub
- [ ] Token generated recently (not expired)
- [ ] Token pasted without extra spaces
- [ ] Build stage completed successfully
- [ ] `firebase.json` file exists (should be committed)
- [ ] `.firebaserc` file exists (should be committed)

---

## 🚀 Testing Locally (Before CI/CD)

If deployment keeps failing, test locally first:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Build the app
npm run build

# Deploy manually
firebase deploy --only hosting --token "YOUR_TOKEN_HERE"
```

If it works locally but fails in CI/CD, the issue is likely:
- Token not properly added to secrets
- Build artifacts not transferring between jobs

---

## Getting Help

Run this command locally to see detailed Firebase info:

```bash
firebase projects:list
firebase projects:describe timerapp-2997d
firebase hosting:channel:list --project timerapp-2997d
```

This shows you Firebase's view of your project and existing deployments.
