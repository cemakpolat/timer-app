# Firebase Credentials: Implementation Walkthrough

## The Problem You Asked About

> "If we create the firebase via terraform, how do you manage the firebase credentials that i entered in the github secret?"

**Answer:** You need to decide:
1. Keep using GitHub Secrets (ignore Terraform output)
2. Use Terraform output (replace GitHub Secrets)
3. Use both (GitHub Secrets for credentials, Terraform for infrastructure)

---

## Your Current Setup

```
Currently Working:
├─ GitHub Secrets (7 Firebase values) ✅
├─ React App (reads from secrets) ✅
├─ GitHub Actions (injects secrets) ✅
└─ Firebase (manually created) ✅

Terraform firebase.tf:
├─ Created ✅
├─ NOT deployed ❌
└─ Would create NEW Firebase ⚠️
```

---

## The Decision Tree (START HERE)

```
┌─ Have you already deployed Firebase via Terraform?
│  ├─ NO (you haven't) → Go to "Scenario A" below
│  └─ YES (already deployed) → Go to "Scenario B" below
│
└─ Do you WANT to deploy Firebase via Terraform?
   ├─ YES → Choose Strategy 1 → Go to "Strategy 1 Steps"
   ├─ NO → Choose Strategy 2 → Go to "Strategy 2 Steps"
   └─ MAYBE → Choose Strategy 3 → Go to "Strategy 3 Steps"
```

---

## Scenario A: Haven't Deployed Yet (MOST LIKELY YOU)

### Current State
- ✅ GitHub Secrets exist with Firebase credentials
- ✅ React app works with those credentials
- ❓ Wondering if you should deploy via Terraform

### Your Options

#### Option 1: Deploy Terraform (Recommended for fresh projects)
```
Advantage: Infrastructure as Code, automated credentials
Disadvantage: Overwrites GitHub Secrets, requires state file management
Cost: 30 minutes setup time
Risk: Medium (if done correctly)
```

**Do this if:**
- ✅ You want reproducible infrastructure
- ✅ You want to learn Terraform
- ✅ You want automated deployments
- ✅ You're okay updating GitHub Secrets

#### Option 2: Keep Manual (Simplest)
```
Advantage: No changes needed, simple
Disadvantage: Manual management, not in code
Cost: 0 minutes
Risk: Low (no changes)
```

**Do this if:**
- ✅ Current setup works fine
- ✅ You want minimal changes
- ✅ You're not ready for IaC yet
- ✅ You want to revisit later

---

## Strategy 1: Deploy Terraform (RECOMMENDED)

### Step-by-Step Walkthrough

#### Step 1: See What Terraform Will Create
```bash
cd infrastructure
terraform plan -var-file=terraform.tfvars
```

**What to look for:**
```
Plan: 8 to add, 0 to change, 0 to destroy.

Resources that will be created:
  + google_firebase_web_app.default[0]
  + google_firebase_database_instance.default[0]
  + google_storage_bucket.firebase_storage[0]
  + google_project_service.firebase
  + (others for API enablement)
```

**If you see this:** ✅ Good, proceed to Step 2

#### Step 2: Deploy It
```bash
terraform apply -var-file=terraform.tfvars -auto-approve
```

**Wait for it to complete (~2-5 minutes)**

**You should see:**
```
Apply complete! Resources added: 8.
Outputs:

firebase_config = {
  "apiKey" = "AIzaSyD...NEWKEY"
  "appId" = "1:..."
  "authDomain" = "timerapp-2997d.firebaseapp.com"
  "databaseURL" = "https://timerapp-2997d-default-rtdb.firebaseio.com"
  "messagingSenderId" = "..."
  "projectId" = "timerapp-2997d"
  "storageBucket" = "timerapp-2997d.appspot.com"
}
```

#### Step 3: Copy the Credentials

**The 7 values Terraform just generated:**

From output above, extract:
1. `apiKey` → Copy this
2. `authDomain` → Copy this
3. `databaseURL` → Copy this
4. `projectId` → Copy this
5. `storageBucket` → Copy this
6. `messagingSenderId` → Copy this
7. `appId` → Copy this

#### Step 4: Update GitHub Secrets

**Go to:** GitHub.com → Your Repository → Settings

**Click:** "Secrets and variables" → "Actions"

**For EACH of the 7 values above:**

1. Click "New repository secret"
2. Name: `REACT_APP_FIREBASE_API_KEY`
3. Value: Paste the `apiKey` from Terraform output
4. Click "Add secret"

**Repeat for all 7:**
- `REACT_APP_FIREBASE_API_KEY` = apiKey
- `REACT_APP_FIREBASE_AUTH_DOMAIN` = authDomain
- `REACT_APP_FIREBASE_DATABASE_URL` = databaseURL
- `REACT_APP_FIREBASE_PROJECT_ID` = projectId
- `REACT_APP_FIREBASE_STORAGE_BUCKET` = storageBucket
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` = messagingSenderId
- `REACT_APP_FIREBASE_APP_ID` = appId

⚠️ **Important:** If the values are DIFFERENT from your old secrets, update them!

#### Step 5: Test Locally

```bash
# Set environment variables from Terraform output
export REACT_APP_FIREBASE_API_KEY="AIzaSyD...NEWKEY"
export REACT_APP_FIREBASE_AUTH_DOMAIN="timerapp-2997d.firebaseapp.com"
export REACT_APP_FIREBASE_DATABASE_URL="https://timerapp-2997d-default-rtdb.firebaseio.com"
export REACT_APP_FIREBASE_PROJECT_ID="timerapp-2997d"
export REACT_APP_FIREBASE_STORAGE_BUCKET="timerapp-2997d.appspot.com"
export REACT_APP_FIREBASE_MESSAGING_SENDER_ID="..."
export REACT_APP_FIREBASE_APP_ID="1:..."

# Run app
npm start
```

**Verify:**
- App loads without errors ✅
- Console no Firebase errors ✅
- Can connect to Realtime Database ✅
- Can connect to Cloud Storage ✅

#### Step 6: Commit and Push

```bash
cd /path/to/timer-app

# Stage Terraform changes
git add infrastructure/firebase.tf infrastructure/outputs.tf infrastructure/variables.tf

# Commit
git commit -m "Deploy: Firebase infrastructure via Terraform"

# Push
git push origin main
```

**GitHub Actions will:**
1. Run `terraform plan` ✅
2. Build React app with GitHub Secrets ✅
3. Show success! ✅

---

## Strategy 2: Keep Manual Setup

### Step-by-Step

#### Step 1: Don't Deploy Terraform
```bash
# DO NOT RUN THIS:
# terraform apply -var-file=terraform.tfvars

# Your GitHub Secrets stay as-is ✅
# Your app continues working ✅
```

#### Step 2: Keep Current GitHub Secrets
Leave them unchanged. They work fine.

#### Step 3: Document Your Choice

Create file `FIREBASE_DEPLOYMENT_CHOICE.md`:
```markdown
# Firebase Deployment Choice: Manual

We chose to keep Firebase as manually managed (not Terraform).

Reason: Existing setup works, no need to change.

If later we want to move to Terraform:
1. Export current Firebase credentials
2. Run terraform apply
3. Update GitHub Secrets with new values
4. Done!

Current Setup:
- GitHub Secrets: 7 values (active)
- Firebase: Manually created in console
- React App: Reads from GitHub Secrets
- Status: Working ✅
```

Then commit:
```bash
git add FIREBASE_DEPLOYMENT_CHOICE.md
git commit -m "Docs: Document Firebase deployment choice (manual)"
git push origin main
```

---

## Strategy 3: Hybrid (Terraform Creates, Secrets Manage)

### For This Strategy

This is the most secure but also most complex. It means:
- Terraform creates Firebase infrastructure
- GitHub Secrets stores the credentials
- React app uses secrets (not Terraform output)
- State file doesn't contain secrets

### Implementation

#### Step 1: Secure Terraform State

Update `infrastructure/providers.tf`:

```hcl
terraform {
  required_version = ">= 1.5.0"
  
  backend "gcs" {
    bucket = "timerapp-2997d-tf-state"
    prefix = "prod"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.85.0"
    }
  }
}
```

Create GCS bucket:
```bash
gsutil mb gs://timerapp-2997d-tf-state
```

Migrate state:
```bash
cd infrastructure
terraform init
# Answer YES to copy state
```

#### Step 2: Deploy Terraform

```bash
terraform apply -var-file=terraform.tfvars -auto-approve
```

#### Step 3: Get Output Values

```bash
terraform output firebase_config
```

#### Step 4: Update GitHub Secrets

Same as Strategy 1, Step 4.

#### Step 5: Secure Terraform State

Verify state is encrypted:
```bash
gsutil iam ch serviceAccount:github-actions@timerapp-2997d.iam.gserviceaccount.com:roles/storage.objectAdmin gs://timerapp-2997d-tf-state
```

Now state file is:
- ✅ In GCS (not in Git)
- ✅ Encrypted at rest
- ✅ Access controlled via IAM

---

## After Implementation

### Verification Checklist

- [ ] App starts without errors: `npm start`
- [ ] Check browser console: no Firebase errors
- [ ] Check Realtime Database: data syncs
- [ ] Check Cloud Storage: files upload/download
- [ ] Run GitHub Actions: `git push origin main`
- [ ] Check Actions logs: no failures
- [ ] Deploy successful: app works in production

### Documentation Checklist

- [ ] Document which strategy you chose
- [ ] Document when credentials expire (usually 90 days)
- [ ] Document credential rotation procedure
- [ ] Document rollback procedure
- [ ] Add team member access instructions

### Security Checklist

- [ ] GitHub Secrets are not public
- [ ] Terraform state is protected (not in Git)
- [ ] `.gitignore` includes `terraform.tfstate*`
- [ ] No credentials in code or commits
- [ ] Terraform state has proper encryption
- [ ] Only necessary people have access to secrets

---

## Credential Rotation (Every 90 Days)

### For Strategy 1 & 3

```bash
# 1. Delete old Firebase in GCP Console
# Settings → Delete Project

# 2. Run Terraform to create new Firebase
cd infrastructure
terraform destroy -auto-approve
terraform apply -var-file=terraform.tfvars -auto-approve

# 3. Get new credentials
terraform output firebase_config

# 4. Update GitHub Secrets with new values
# (see Step 4 above)

# 5. Verify app works
npm start

# 6. Commit (optional, if changes to Terraform)
git push origin main
```

### For Strategy 2

```bash
# 1. In Firebase Console, delete and recreate app
# 2. Copy new credentials
# 3. Update GitHub Secrets
# 4. Verify app works
```

---

## Troubleshooting

### Problem: "Error: Unauthorized" when running terraform apply

**Cause:** Missing GCP permissions

**Fix:**
```bash
# Authenticate first
gcloud auth application-default login

# Or use service account
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
terraform apply -var-file=terraform.tfvars -auto-approve
```

### Problem: "React app can't connect to Firebase"

**Cause:** GitHub Secrets don't match Terraform output

**Fix:**
1. Verify Terraform output: `terraform output firebase_config`
2. Compare with GitHub Secrets values
3. If different, update GitHub Secrets
4. Redeploy: `git push origin main`

### Problem: "State file contains different credentials"

**Cause:** Firebase was changed manually in console

**Fix:**
```bash
# Option 1: Import existing Firebase
terraform import google_firebase_web_app.default[0] YOUR_APP_ID

# Option 2: Destroy and recreate
terraform destroy -auto-approve
terraform apply -var-file=terraform.tfvars -auto-approve
```

### Problem: "Can't decide which strategy"

**Fix:** Pick Strategy 1 (Terraform-First)
- It's the most maintainable
- It's worth learning
- You can always switch later

---

## Decision Flowchart (Final)

```
START HERE ↓

"Should I deploy Firebase via Terraform?"
  │
  ├─→ "I want infrastructure as code" → Strategy 1 ✅
  │   "I want automated deployments"
  │   "I want reproducible setup"
  │
  ├─→ "I want simplicity" → Strategy 2 ✅
  │   "I want no changes now"
  │   "Current setup works"
  │
  └─→ "I want security + IaC" → Strategy 3 ✅
      "I want no secrets in state"
      "I want best practices"

Choose ONE ↓

Follow steps for YOUR strategy ↓

Done! 🎉
```

---

## Next Steps (Right Now!)

1. ✅ Read this document (you're reading it!)
2. ✅ Choose your strategy (1, 2, or 3)
3. ⏭️ Go to the relevant section above
4. ⏭️ Follow the step-by-step instructions
5. ⏭️ Verify everything works
6. ⏭️ Commit and push

---

## Questions?

- **Strategy confusion?** → Read FIREBASE_CREDENTIALS_VISUAL.md
- **Terraform questions?** → Read TERRAFORM_FIREBASE.md
- **GitHub Secrets help?** → See GitHub docs on Secrets
- **Still stuck?** → Pick Strategy 2 (no changes needed)

---

**Ready to implement?** Pick your strategy above and follow the steps! 🚀
