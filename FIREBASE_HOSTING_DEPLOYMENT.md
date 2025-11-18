# 🚀 Firebase Hosting Deployment Setup

## Overview
Your GitHub Actions workflow is now configured to automatically deploy the built React app to Firebase Hosting on every push to `main` branch.

**3-Stage Pipeline:**
1. ✅ **Infrastructure** - Deploy Firebase resources via Terraform
2. ✅ **Build** - Compile React app with Firebase credentials
3. ✅ **Deploy** - Push built app to Firebase Hosting

---

## Setup Steps

### Step 1: Generate Firebase Deploy Token

Run this command locally to generate a deployment token:

```bash
firebase login:ci
```

This will:
- Open a browser window asking for authentication
- Generate a long-lived token for CI/CD
- Display the token in your terminal

**⚠️ Keep this token secret!**

### Step 2: Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Name: `FIREBASE_DEPLOY_TOKEN`
5. Paste the token you generated
6. Click **Add secret**

**URL:** https://github.com/cemakpolat/timer-app/settings/secrets/actions

---

## How It Works

### Workflow Stages

```
┌─────────────────────────────┐
│  STAGE 1: Infrastructure    │
│  - Authenticate to GCP      │
│  - terraform init           │
│  - terraform apply          │
│  - Extract credentials      │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  STAGE 2: Build             │
│  - npm install              │
│  - npm run build            │
│  - Upload build artifacts   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│  STAGE 3: Deploy            │
│  - Download build artifacts │
│  - firebase deploy          │
│  - Push to hosting          │
└─────────────────────────────┘
```

### Trigger Conditions

The deployment stage runs **only when:**
- ✅ Branch is `main`
- ✅ Event is a push (not a pull request)
- ✅ Build stage succeeds

This means:
- **Pull requests** → Builds test code but doesn't deploy
- **Commits to main** → Full deployment pipeline runs
- **Other branches** → Infrastructure & build stages run (no deploy)

---

## Deployment URL

Once deployed, your app will be live at:

**🌍 https://timerapp-2997d.web.app**

You can also access it via the project URL:
- https://timerapp-2997d.firebaseapp.com (older format)

---

## Configuration Files

### `.firebaserc`
Specifies the Firebase project:
```json
{
  "projects": {
    "default": "timerapp-2997d"
  }
}
```

### `firebase.json`
Configures hosting deployment:
- **public**: Points to `build/` folder (built React app)
- **rewrites**: Routes all requests to `index.html` (SPA routing)
- **headers**: Sets cache control for static assets
  - JS/CSS/fonts: Cached 1 year (immutable)
  - HTML: Cached 1 hour (must revalidate for updates)

---

## Manual Deployment (Optional)

If you need to deploy manually without GitHub Actions:

```bash
# Login locally
firebase login

# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting --project timerapp-2997d
```

---

## Environment Variables in Deployment

During the build stage, these Firebase credentials are injected:

```
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_DATABASE_URL
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
```

These are:
- ✅ **Masked in logs** (shown as `***`)
- ✅ **Embedded in built app** (public, safe to expose)
- ✅ **Extracted from Terraform** (no hardcoding)

---

## Monitoring Deployments

### GitHub Actions Dashboard
View deployment logs at:
https://github.com/cemakpolat/timer-app/actions

**Each run shows:**
- Infrastructure stage status
- Build stage output
- Deployment logs
- Live URL after successful deploy

### Firebase Console
Monitor hosting at:
https://console.firebase.google.com/project/timerapp-2997d/hosting

**Features:**
- Deployment history
- Rollback to previous versions
- Traffic analytics
- Custom domain setup (when ready)

---

## Common Tasks

### Rollback to Previous Deployment
1. Go to Firebase Console → Hosting
2. Find the deployment you want
3. Click the three dots → **Promote**

### Add Custom Domain
1. Firebase Console → Hosting → Connect domain
2. Point your domain's DNS to Firebase
3. SSL certificate auto-provisioned

### Check Deployment Size
```bash
du -sh build/
```
Firebase has a 1GB free tier per month (more than enough).

---

## Troubleshooting

### Deploy Token Issues
**Error:** `Error: Invalid authentication credentials`

**Solution:**
1. Regenerate token: `firebase login:ci`
2. Update GitHub secret with new token
3. Make sure token is pasted without extra spaces

### Build Fails During Deploy
**Check:**
- All npm dependencies installed
- Firebase credentials properly set
- `.env.example` → `.env` configured

### Can't Find App After Deploy
**Check:**
- Workflow completed all 3 stages
- No errors in GitHub Actions logs
- Wait 1-2 minutes (CDN propagation)
- Try incognito mode (cache clear)

---

## Next Steps

✅ Generate Firebase deploy token
✅ Add `FIREBASE_DEPLOY_TOKEN` to GitHub Secrets
✅ Push changes (will trigger full deployment)
✅ Monitor at GitHub Actions dashboard
✅ Access live app at https://timerapp-2997d.web.app

---

## Security Notes

### Token Safety
- The token is stored in GitHub Secrets (encrypted)
- Only used by GitHub Actions
- Can be regenerated/revoked anytime
- Never appears in logs (GitHub Actions handles it)

### Credentials in Built App
- Firebase config is public (safe by design)
- Contains no private keys
- Protected by Firestore rules (in database)
- Protected by Storage rules (in buckets)

---

## Cost Considerations

Firebase Hosting Free Tier:
- ✅ 10GB/month storage
- ✅ 360GB/month bandwidth
- ✅ Custom domains
- ✅ SSL/TLS (automatic)

Your timer app will easily fit within free tier!
