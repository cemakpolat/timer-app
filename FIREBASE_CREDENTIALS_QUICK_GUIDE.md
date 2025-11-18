# Firebase Credentials: Quick Decision Guide

## 🤔 What Happens When You Deploy Firebase via Terraform?

```
terraform apply
    ↓
Creates Firebase infrastructure (Database, Storage, Web App)
    ↓
Terraform reads Firebase config automatically
    ↓
Outputs 7 credentials (apiKey, authDomain, etc.)
    ↓
YOU must decide: Where do these credentials go?
    ├─ Option A: GitHub Secrets (store newly generated ones)
    ├─ Option B: Terraform state file (encrypted backend)
    └─ Option C: Ignore Terraform output, keep manual secrets
```

---

## 🎯 Quick Decision Tree

```
Do you want Terraform to manage Firebase?
│
├─ YES → Go to "Strategy 1: Terraform-First"
│        (Delete old secrets, use Terraform output)
│
└─ NO  → Go to "Strategy 2: Secrets-First"
         (Keep manual secrets, Terraform reads them)
```

---

## ✨ Simple Implementation

### Scenario A: You Haven't Deployed Firebase Yet

```bash
# 1. Deploy Firebase via Terraform
cd infrastructure
terraform apply -var-file=terraform.tfvars -auto-approve

# 2. Get credentials
terraform output firebase_config

# 3. Add each value to GitHub Secrets
# Settings → Secrets and variables → Actions
# New secrets (copy from terraform output):
# - REACT_APP_FIREBASE_API_KEY
# - REACT_APP_FIREBASE_AUTH_DOMAIN
# - REACT_APP_FIREBASE_DATABASE_URL
# - REACT_APP_FIREBASE_PROJECT_ID
# - REACT_APP_FIREBASE_STORAGE_BUCKET
# - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
# - REACT_APP_FIREBASE_APP_ID

# 4. Deploy app (GitHub Actions will use secrets)
git push origin main
```

### Scenario B: You Already Have Manual Firebase Setup

```bash
# Option 1: Keep current setup (don't run terraform apply)
# - GitHub Secrets work as-is
# - No changes needed

# Option 2: Import into Terraform (advanced)
# See TERRAFORM_FIREBASE.md for import commands
```

---

## 🚨 The Key Problem

**GitHub Secrets vs Terraform Output = Inconsistency**

### What Currently Happens

```
GitHub Secrets (manually entered)        Terraform Output (auto-generated)
┌─────────────────────┐                  ┌──────────────────┐
│ REACT_APP_...       │                  │ terraform output │
│ (Old Firebase)      │ ≠                │ (New Firebase)   │
│                     │                  │                  │
│ apiKey: ****XYZ     │                  │ apiKey: ****ABC  │
│ projectId: old-id   │                  │ projectId: new-id│
└─────────────────────┘                  └──────────────────┘
        ↓                                         ↓
   React App                          Waiting to be used
  (uses old Firebase)               (loses generated creds)
```

### What Should Happen

```
One Source of Truth (choose one):

Option 1: Terraform Output → GitHub Secrets → React App
          ✅ Automated
          ✅ Reproducible
          ❌ State file has secrets

Option 2: GitHub Secrets → Terraform Variables → Terraform
          ✅ Secure (no secrets in state)
          ✅ Manual control
          ❌ Manual updates needed

Option 3: Terraform Code (no secrets) → GitHub Secrets → React App
          ✅ Infrastructure as Code
          ✅ Secrets managed separately
          ✅ Best practice
```

---

## 📋 Your Current Situation

### What You Have Now
- ✅ GitHub Secrets with 7 Firebase values (manually entered)
- ✅ React app reads from GitHub Secrets
- ✅ Terraform firebase.tf created (not deployed yet)

### What Happens If You Run `terraform apply`
- 🆕 Firebase gets created in GCP
- 🆕 Terraform generates 7 credential values
- ❓ But your app still uses OLD GitHub Secrets!

### The Sync Problem
```
Your GitHub Secrets:  from Firebase project X
Terraform creates:    Firebase project Y (different!)

React app connects to project X (old)
But infrastructure code manages project Y (new)
                    ↓
            MISMATCH! 💥
```

---

## ✅ Recommended Solution (Terraform-First)

### Step 1: Plan What Terraform Will Create
```bash
cd infrastructure
terraform plan -var-file=terraform.tfvars
# Review: Should create Firebase Web App, Database, Storage
```

### Step 2: Deploy It
```bash
terraform apply -var-file=terraform.tfvars -auto-approve
```

### Step 3: Extract Credentials
```bash
terraform output firebase_config

# Output looks like:
# {
#   "apiKey" = "AIzaSyD...new"
#   "authDomain" = "timerapp-2997d.firebaseapp.com"
#   "databaseURL" = "https://timerapp-2997d-default-rtdb.firebaseio.com"
#   ...
# }
```

### Step 4: Update GitHub Secrets
Go to GitHub → Settings → Secrets and variables → Actions

**Delete old values (if different from Terraform output)**

**Add new values from Terraform output:**
- `REACT_APP_FIREBASE_API_KEY` = `AIzaSyD...new`
- `REACT_APP_FIREBASE_AUTH_DOMAIN` = `timerapp-2997d.firebaseapp.com`
- `REACT_APP_FIREBASE_DATABASE_URL` = `https://timerapp-2997d-default-rtdb...`
- (and 4 more)

### Step 5: Verify
```bash
# Locally test
export REACT_APP_FIREBASE_API_KEY="..."
# ... set all 7
npm start

# Should connect to NEW Firebase (from Terraform)
```

### Step 6: Git Push
```bash
git add infrastructure/firebase.tf infrastructure/outputs.tf
git commit -m "Deploy: Firebase via Terraform"
git push origin main
# GitHub Actions will:
# 1. Run terraform plan
# 2. Build React app with GitHub Secrets
# 3. Deploy to Firebase
```

---

## ⚠️ Important: State File Security

When using Strategy 1 (Terraform-First), state file contains secrets!

### Protect Terraform State
```bash
# Option A: Use Google Cloud Storage (recommended)
cd infrastructure
gsutil mb gs://timerapp-2997d-tf-state

# Update providers.tf:
terraform {
  backend "gcs" {
    bucket = "timerapp-2997d-tf-state"
    prefix = "prod"
  }
}

# Migrate state:
terraform init
# Say YES to migrate existing state
```

### Option B: Use Terraform Cloud (easier)
```bash
# 1. Create account at app.terraform.io
# 2. Create organization
# 3. Update providers.tf:
terraform {
  cloud {
    organization = "your-org"
    workspaces {
      name = "timer-app"
    }
  }
}

# 4. Authenticate:
terraform login
# (follow prompts)

# 5. Migrate:
terraform init
```

### Option C: Keep State Local (NOT RECOMMENDED)
```bash
# Add to .gitignore:
echo "terraform.tfstate*" >> .gitignore
echo ".terraform/" >> .gitignore

# State stays local only
# Risk: credentials in state if shared
```

---

## 🔄 Credential Rotation

### Every 90 Days (Security Best Practice)

#### Strategy 1: Terraform-First
```bash
# 1. Delete Firebase app in GCP Console
# 2. Run terraform:
terraform destroy  # Removes Firebase
terraform apply    # Creates new Firebase with new credentials

# 3. Get new credentials:
terraform output firebase_config

# 4. Update GitHub Secrets with new values
# 5. Redeploy:
git push origin main
```

#### Strategy 2: Secrets-First
```bash
# 1. Update GitHub Secrets manually
# 2. Redeploy:
git push origin main

# OR rotate in Firebase Console → Project Settings
```

---

## 🚀 Final Checklist

- [ ] Decide: Terraform-First or Secrets-First?
- [ ] **If Terraform-First:**
  - [ ] Run `terraform plan`
  - [ ] Run `terraform apply`
  - [ ] Get `terraform output firebase_config`
  - [ ] Update GitHub Secrets (7 values)
  - [ ] Test locally: `npm start`
  - [ ] Push to GitHub
  - [ ] Verify GitHub Actions runs successfully

- [ ] **If Secrets-First:**
  - [ ] Keep current GitHub Secrets
  - [ ] Don't run `terraform apply`
  - [ ] Delete `infrastructure/firebase.tf`
  - [ ] Only use Terraform for other infrastructure

- [ ] Secure Terraform state (GCS or Terraform Cloud)
- [ ] Test that app connects to correct Firebase
- [ ] Document credential rotation schedule

---

## 📚 Related Documentation

- `FIREBASE_CREDENTIALS_STRATEGY.md` - Detailed comparison of 3 strategies
- `TERRAFORM_FIREBASE.md` - Complete Terraform Firebase guide
- `FIREBASE-SETUP.md` - Manual Firebase setup instructions

---

## ❓ Still Confused?

**Quick Questions:**

**Q: Do I run terraform apply?**
- If YES: Follow "Terraform-First" steps above
- If NO: Keep current GitHub Secrets, don't run terraform

**Q: What happens to my existing Firebase?**
- Terraform will CREATE NEW Firebase (separate from existing)
- You can import existing Firebase (see TERRAFORM_FIREBASE.md)

**Q: Will my app break?**
- Only if you don't update GitHub Secrets after running terraform apply
- If you keep old secrets, app uses old Firebase (still works)

**Q: How do I know it's working?**
- Check browser console: should connect to Firebase
- Check database: data syncs in real-time
- Check GitHub Actions logs: no authentication errors

---

**Ready to implement? Let me know which strategy you prefer!** 🚀
