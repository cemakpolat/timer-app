# 🔍 Firebase Credentials CI/CD Issue - Root Cause Analysis

## Current Problem
GitHub Actions workflow is not passing Firebase credentials from infrastructure job to build job. All `REACT_APP_FIREBASE_*` environment variables are empty in build stage.

## What We Know
1. ✅ Local: `.env.local` has credentials and app works
2. ✅ Terraform: `terraform output firebase_config` returns credentials locally
3. ❌ GitHub Actions: Build job doesn't receive any credentials

## Likely Root Causes (in order)

### Cause #1: Terraform State File Not Committed to Git
**Symptom**: `terraform output firebase_config` returns empty in GitHub Actions

**Why**: GitHub Actions checks out fresh repository. If `terraform.tfstate` not in git, no resources exist in that workspace.

**How to Check**:
```bash
git log --oneline infrastructure/terraform.tfstate
```

Should show recent commits. If not, state file not in git.

**Fix**:
```bash
cd infrastructure
git add terraform.tfstate .terraform.lock.hcl
git commit -m "infrastructure: Track Terraform state in git"
git push
```

### Cause #2: Firebase Resources Not Created Yet
**Symptom**: `terraform plan` in GitHub Actions would show "will be created"

**Why**: Maybe `enable_firebase = false` in tfvars, or first deploy hasn't run

**How to Check**:
```bash
cat infrastructure/terraform.tfvars | grep enable_firebase
```

Should show: `enable_firebase = true`

**Fix**:
```bash
# Edit tfvars
enable_firebase = true

# Apply locally
cd infrastructure
terraform apply -var-file=terraform.tfvars
git add terraform.tfstate
git commit -m "infrastructure: Create Firebase resources"
git push
```

### Cause #3: Sensitive Output Causing Issues
**Symptom**: `terraform output -json` returns error or empty

**Why**: Outputs marked `sensitive = true` might need special handling

**Check Firebase outputs**:
```bash
cd infrastructure
terraform output -json firebase_config
terraform output firebase_api_key
terraform output firebase_database_url
```

## Debugging Steps (Run These Locally First)

### Step 1: Verify State File Exists
```bash
ls -la /Users/cemakpolat/Development/timer-app/infrastructure/terraform.tfstate
```

Should show file with recent timestamp.

### Step 2: Verify Firebase Output
```bash
cd infrastructure
terraform output -json firebase_config | jq '.'
```

Should show valid JSON with all 7 values.

### Step 3: Check if State is in Git
```bash
git log --all -- infrastructure/terraform.tfstate | head -5
```

Should show recent commits with state file.

### Step 4: Manually Test Extraction
```bash
cd infrastructure
OUTPUT=$(terraform output -json firebase_config)
echo "$OUTPUT" | jq '.databaseURL'
```

Should output: `https://timerapp-2997d-terraform-rtdb.firebaseio.com`

## What the Latest Workflow Changes Do

The workflow now has better debugging:

1. **Verify Terraform State** step - Checks if `terraform.tfstate` exists
2. **List All Terraform Outputs** step - Shows what `terraform output` returns
3. **Extract Firebase Credentials** step - Tries to extract and write to outputs
4. **Build stage debug** - Shows which env vars are received

## How to View GitHub Actions Logs

1. Go to: https://github.com/cemakpolat/timer-app/actions
2. Click latest workflow run
3. Click "infrastructure" job
4. Expand each step to see output

Look for:
- ✅ "terraform.tfstate exists" - State file is available
- ✅ "firebase_config =" - Output was found
- ✅ "Credentials set as outputs" - Extraction succeeded
- ✅ In build job: env vars are SET (not missing)

## Most Likely Fix

Based on the symptoms, the most likely issue is **terraform.tfstate not in git**.

**To fix:**
```bash
cd /Users/cemakpolat/Development/timer-app/infrastructure

# Check if state file exists locally
ls -la terraform.tfstate

# If it exists, add to git
git add terraform.tfstate .terraform.lock.hcl
git status  # Should show both files as new/modified

# Commit and push
git commit -m "infrastructure: Add Terraform state to git for CI/CD"
git push origin main

# Now trigger workflow
git commit --allow-empty -m "trigger: Test workflow with state file"
git push origin main
```

Then watch the workflow at: https://github.com/cemakpolat/timer-app/actions

## Next Steps

1. **Run diagnostic steps above** locally
2. **Check what's in git**: `git ls-files infrastructure/ | grep tfstate`
3. **View GitHub Actions logs** from latest workflow
4. **Share the output** of steps 1-3 if still not working

The new workflow has much better logging that will show exactly where the issue is.
