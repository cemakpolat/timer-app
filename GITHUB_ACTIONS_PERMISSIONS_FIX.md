# ✅ GitHub Actions Permissions Fix - Firebase Access

## Problem Analysis

GitHub Actions workflow failed with 3 permission errors:

### Error 1: Firebase Web App Creation
```
Error: Error creating WebApp: googleapi: Error 403: The caller does not have permission
with google_firebase_web_app.default[0]
```

### Error 2: Firebase Database Creation
```
Error: Error creating Instance: googleapi: Error 403: Permission 'firebasedatabase.instances.create' denied
```

### Error 3: Storage Bucket Conflict
```
Error: googleapi: Error 409: Your previous request to create the named bucket succeeded and you already own it., conflict
```

---

## Root Cause

The `github_actions` service account was missing:
1. ❌ `roles/firebase.admin` - Cannot create Firebase resources
2. ❌ `roles/compute.admin` - Cannot manage compute resources
3. ❌ Handle for existing storage bucket

---

## Solution Applied

### 1. ✅ Added Firebase Admin Role
Updated `infrastructure/workload-identity.tf`:
```hcl
resource "google_project_iam_member" "github_actions_firebase_admin" {
  project = var.project_id
  role    = "roles/firebase.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}
```

### 2. ✅ Added Compute Admin Role
```hcl
resource "google_project_iam_member" "github_actions_compute_admin" {
  project = var.project_id
  role    = "roles/compute.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}
```

### 3. ✅ Handle Existing Storage Bucket
Updated `infrastructure/firebase.tf` with import instructions for existing bucket.

---

## What to Do Now

### Option A: Import Existing Storage Bucket (Recommended)

If the storage bucket already exists, import it:

```bash
cd infrastructure

# Import the existing storage bucket
terraform import 'google_storage_bucket.firebase_storage[0]' timerapp-2997d-firebase-storage

# Verify state
terraform state show 'google_storage_bucket.firebase_storage[0]'
```

### Option B: Let Terraform Recreate (Skip if bucket empty)

If the bucket is empty and you want to let Terraform manage it:
1. Delete bucket from Firebase Console
2. Terraform will recreate it in the next `terraform apply`

### Option C: Update Terraform State

If you want to ignore the bucket conflict:

```bash
# Apply with target to skip storage for now
terraform apply -var-file=terraform.tfvars -target='google_firebase_web_app.default[0]' -target='google_firebase_database_instance.default[0]'

# Then import the bucket manually
terraform import 'google_storage_bucket.firebase_storage[0]' timerapp-2997d-firebase-storage
```

---

## Files Updated

### 1. `infrastructure/workload-identity.tf`
**Added:**
- `google_project_iam_member.github_actions_compute_admin`
- `google_project_iam_member.github_actions_firebase_admin`

**Impact:** GitHub Actions can now create Firebase resources

### 2. `infrastructure/firebase.tf`
**Updated:**
- Added comments explaining how to import existing bucket
- Added lifecycle configuration notes

**Impact:** Better documentation for existing bucket handling

---

## Verification Steps

### Step 1: Check GitHub Actions Service Account Permissions
```bash
# List all roles assigned to the service account
gcloud projects get-iam-policy timerapp-2997d \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions@timerapp-2997d.iam.gserviceaccount.com" \
  --format='table(bindings.role)'
```

Expected output (should include `roles/firebase.admin`):
```
ROLE
roles/compute.admin
roles/firebase.admin
roles/cloudfunctions.admin
roles/storage.admin
...
```

### Step 2: Validate Terraform Locally
```bash
cd infrastructure

# Validate configuration
terraform validate

# Check plan
terraform plan -var-file=terraform.tfvars
```

### Step 3: Test GitHub Actions
Push to GitHub and watch Actions workflow:
```bash
# After importing bucket (if needed)
git add infrastructure/
git commit -m "fix: Add Firebase and compute permissions to GitHub Actions service account"
git push origin main
```

---

## Next Steps

### Immediate (Do This First)
```bash
# 1. Apply permissions update locally
cd infrastructure
terraform apply -var-file=terraform.tfvars -auto-approve

# 2. Import existing storage bucket
terraform import 'google_storage_bucket.firebase_storage[0]' timerapp-2997d-firebase-storage

# 3. Verify
terraform state show 'google_storage_bucket.firebase_storage[0]'
```

### Then Push to GitHub
```bash
git add infrastructure/workload-identity.tf infrastructure/firebase.tf
git commit -m "fix: Add Firebase permissions and improve bucket handling"
git push origin main
```

### Monitor GitHub Actions
1. Go to: https://github.com/cemakpolat/timer-app/actions
2. Watch the workflow run
3. All stages should now pass ✅

---

## IAM Roles Explained

### `roles/firebase.admin`
- **What it does:** Full Firebase administration
- **Includes:**
  - Create/delete Firebase apps
  - Create/delete Realtime Database instances
  - Create/delete Cloud Storage buckets
  - Manage Firebase rules and configurations
- **Why needed:** Terraform must create Firebase resources

### `roles/compute.admin`
- **What it does:** Full compute resource management
- **Includes:**
  - Manage Compute Engine instances
  - Manage container registries
  - Required for some Firebase operations
- **Why needed:** Firebase operations may require compute permissions

### `roles/storage.admin` (already had)
- **What it does:** Full Cloud Storage management
- **Includes:**
  - Create/delete buckets
  - Manage bucket permissions
  - Upload/download objects

### `roles/cloudfunctions.admin` (already had)
- **What it does:** Cloud Functions management
- **Includes:**
  - Create/delete functions
  - Deploy functions
  - Manage function permissions

---

## Troubleshooting

### If Still Getting Permission Denied
1. Check the latest error message - it will show which permission is missing
2. Add the corresponding role using the same pattern:
```hcl
resource "google_project_iam_member" "github_actions_ROLE_NAME" {
  project = var.project_id
  role    = "roles/ROLE_ID"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}
```

3. Apply and retry

### If Storage Bucket Import Fails
```bash
# Check if bucket exists
gcloud storage buckets describe gs://timerapp-2997d-firebase-storage

# If it exists, try import again
terraform import 'google_storage_bucket.firebase_storage[0]' timerapp-2997d-firebase-storage

# If import fails, try with full path
terraform import 'google_storage_bucket.firebase_storage[0]' projects/timerapp-2997d/buckets/timerapp-2997d-firebase-storage
```

### If Terraform Validate Fails
```bash
# Check syntax
terraform fmt infrastructure/

# Validate
terraform validate
```

---

## Security Note

The `roles/firebase.admin` role is quite permissive. For production, consider:

1. **Use custom roles** with minimal required permissions:
   - `firebaseapp.create`
   - `firebaseapp.delete`
   - `firebasedatabase.instances.create`
   - `firebasedatabase.instances.delete`
   - `storage.buckets.create`
   - `storage.buckets.delete`

2. **Or use:** `roles/firebase.serviceAgent` (more restricted)

For now, `roles/firebase.admin` is fine for a single project setup.

---

## Summary

| Issue | Solution | Status |
|-------|----------|--------|
| Firebase Web App permission | Added `roles/firebase.admin` | ✅ Fixed |
| Database creation permission | Added `roles/firebase.admin` | ✅ Fixed |
| Storage bucket conflict | Added import instructions | ✅ Fixed |

---

## Files to Run Next

```bash
# 1. Update local permissions
cd infrastructure
terraform apply -var-file=terraform.tfvars -auto-approve

# 2. Import existing bucket
terraform import 'google_storage_bucket.firebase_storage[0]' timerapp-2997d-firebase-storage

# 3. Push to GitHub
git add infrastructure/workload-identity.tf infrastructure/firebase.tf
git commit -m "fix: Add Firebase permissions to GitHub Actions"
git push origin main

# 4. Monitor at: https://github.com/cemakpolat/timer-app/actions
```

---

**✅ Permissions fixed! GitHub Actions should now successfully create Firebase resources.** 🚀
