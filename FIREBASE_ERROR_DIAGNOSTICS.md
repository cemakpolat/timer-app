# 🔍 Firebase Initialization Error - Diagnostics

## Error Message
```
FIREBASE FATAL ERROR: Cannot parse Firebase url. 
Please use https://<YOUR FIREBASE>.firebaseio.com
```

## What This Means

Your React app can't connect to Firebase because one of these values is missing or wrong:
- ❌ `REACT_APP_FIREBASE_DATABASE_URL` is undefined
- ❌ `REACT_APP_FIREBASE_DATABASE_URL` is malformed  
- ❌ `REACT_APP_FIREBASE_API_KEY` is undefined (causes init to fail)

---

## Quick Fix: Test Locally

### Step 1: Get Your Credentials

Run this command to see what Terraform generated:

```bash
cd /Users/cemakpolat/Development/timer-app/infrastructure
terraform output firebase_config
```

**Expected output:**
```
{
  "apiKey" = "AIzaSyD..."
  "authDomain" = "timerapp-2997d.firebaseapp.com"
  "databaseURL" = "https://timerapp-2997d-terraform-rtdb.firebaseio.com"
  "projectId" = "timerapp-2997d"
  "storageBucket" = "timerapp-2997d-firebase-storage"
  "messagingSenderId" = "341637730794"
  "appId" = "1:341637730794:web:7fde5fc1e9595734b2e293"
}
```

**If you see:**
- `firebaseio.com` URL ✅ Good!
- Empty values ❌ Problem - Firebase not created
- Error message ❌ Problem - Check step 2

### Step 2: Check if Firebase Exists

```bash
cd infrastructure
terraform state list | grep firebase
```

**Expected output:**
```
google_firebase_web_app.default[0]
google_firebase_database_instance.default[0]
google_storage_bucket.firebase_storage[0]
```

**If you see nothing:**
```bash
# Firebase not created. Enable it:
# Edit terraform.tfvars and set:
enable_firebase = true

# Then run:
terraform apply -var-file=terraform.tfvars
```

### Step 3: Test With Local Environment Variables

```bash
# Navigate to app directory
cd /Users/cemakpolat/Development/timer-app

# Create .env.local with your credentials
cat > .env.local << 'EOF'
REACT_APP_FIREBASE_API_KEY=AIzaSyD...
REACT_APP_FIREBASE_AUTH_DOMAIN=timerapp-2997d.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://timerapp-2997d-terraform-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=timerapp-2997d
REACT_APP_FIREBASE_STORAGE_BUCKET=timerapp-2997d-firebase-storage
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=341637730794
REACT_APP_FIREBASE_APP_ID=1:341637730794:web:7fde5fc1e9595734b2e293
EOF

# Start the app
npm start
```

**If it works locally**, the issue is in GitHub Actions (see "Deployment Issues" below).

**If it still fails**, one of your credentials is wrong (see "Verify Credentials" below).

---

## ✅ Verify Credentials Format

Each credential must match this format:

| Credential | Format | Example |
|-----------|--------|---------|
| API_KEY | `AIzaSy...` (starts with AIza) | ✓ Starts with AIza |
| AUTH_DOMAIN | `{project}.firebaseapp.com` | timerapp-2997d.firebaseapp.com |
| DATABASE_URL | `https://{rtdb-name}.firebaseio.com` | https://timerapp-2997d-terraform-rtdb.firebaseio.com |
| PROJECT_ID | `{project-id}` | timerapp-2997d |
| STORAGE_BUCKET | `{project}.appspot.com` OR `{custom-bucket}` | timerapp-2997d-firebase-storage |
| MESSAGING_SENDER_ID | Numeric string | 341637730794 |
| APP_ID | `1:{number}:web:{hex}` | 1:341637730794:web:7fde5fc1e9595734b2e293 |

---

## 🐛 Debugging in React App

Add this to `src/App.js` temporarily:

```javascript
console.log('Firebase Config:');
console.log('API_KEY:', process.env.REACT_APP_FIREBASE_API_KEY ? '✓ Set' : '❌ Missing');
console.log('AUTH_DOMAIN:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '❌ Missing');
console.log('DATABASE_URL:', process.env.REACT_APP_FIREBASE_DATABASE_URL ? '✓ Set' : '❌ Missing');
console.log('PROJECT_ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✓ Set' : '❌ Missing');
console.log('STORAGE_BUCKET:', process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '❌ Missing');
console.log('MESSAGING_SENDER_ID:', process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '❌ Missing');
console.log('APP_ID:', process.env.REACT_APP_FIREBASE_APP_ID ? '✓ Set' : '❌ Missing');
```

Check browser console and see which ones are missing.

---

## 🚀 Deployment Issues (GitHub Actions)

If it works locally but fails in deployed app:

### Issue 1: Credentials Not Passing to Build

**Symptom:** App builds but credentials are undefined

**Check:**
1. Go to GitHub Actions workflow logs
2. Find "Extract Firebase Credentials" step
3. Look for error messages
4. Check if terraform output shows valid credentials

**Fix:**
```bash
# Verify locally first
cd infrastructure
terraform output -json firebase_config
```

### Issue 2: Build Not Using Environment Variables

**Symptom:** Build succeeds but app doesn't have values

**Check in `.github/workflows/deploy.yml`:**
```yaml
  build:
    env:
      REACT_APP_FIREBASE_API_KEY: ${{ needs.infrastructure.outputs.firebase-api-key }}
      # ... all 7 variables
```

All 7 must be passed to the build job.

### Issue 3: Terraform Not Creating Firebase

**Symptom:** Terraform outputs are empty

**Check `terraform.tfvars`:**
```hcl
# Must be set to true
enable_firebase = true
```

**Run:**
```bash
terraform plan -var-file=terraform.tfvars | grep firebase
```

Should show `will be created` for Firebase resources.

---

## 🔗 Where Credentials Flow

```
Terraform Output
    ↓
GitHub Actions Infrastructure Job
    ↓
Extract Firebase Credentials
    ↓
Pass to Build Job (environment variables)
    ↓
npm run build (reads from process.env)
    ↓
React App (uses credentials)
```

**Any break in this chain causes the error.**

---

## ✅ Checklist

- [ ] `terraform output firebase_config` returns valid credentials
- [ ] `enable_firebase = true` in `terraform.tfvars`
- [ ] `.firebaserc` file exists with correct project ID
- [ ] `firebase.json` file exists
- [ ] All 7 credentials have values (not empty or undefined)
- [ ] DATABASE_URL has `firebaseio.com` domain
- [ ] GitHub Actions shows credentials in outputs (masked)
- [ ] Build job receives all 7 environment variables
- [ ] React app builds without errors

---

## 🆘 Still Not Working?

Collect this info and share:

1. **Terraform output:**
   ```bash
   cd infrastructure
   terraform output firebase_config
   ```

2. **GitHub Actions logs** - Infrastructure stage, "Extract Firebase Credentials" step

3. **Browser console error** when app loads (full stack trace)

4. **Local .env.local test result** (does it work with hardcoded values?)
