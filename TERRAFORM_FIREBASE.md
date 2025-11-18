# Firebase Infrastructure as Code (Terraform)

## Overview

The `firebase.tf` file provisions Firebase services automatically via Terraform, including:

- ✅ Firebase Web App
- ✅ Realtime Database
- ✅ Cloud Storage Bucket
- ✅ Firebase Authentication (configured in console)

## What Gets Created

When you run `terraform apply`, this module creates:

1. **Firebase Web App** - Web application registration in Firebase
2. **Realtime Database** - `{project-id}-default-rtdb.firebaseio.com`
3. **Cloud Storage** - `{project-id}.appspot.com`
4. **API Enablement** - Enables all required Firebase APIs

## Configuration

### Enable/Disable Firebase

Edit `terraform.tfvars`:

```hcl
# To provision Firebase
enable_firebase = true

# To skip Firebase (if already created manually)
enable_firebase = false
```

### Firebase Region

```hcl
firebase_region = "us-central1"  # Default
# Supported: us-central1, europe-west1, asia-southeast1, etc.
```

## Usage

### Initial Setup (Create Firebase)

```bash
cd infrastructure

# Plan the changes
terraform plan -var-file=terraform.tfvars

# Apply the changes
terraform apply -var-file=terraform.tfvars -auto-approve
```

### Get Firebase Configuration

After Terraform creates Firebase, get the config for React app:

```bash
terraform output firebase_config
```

This outputs the complete Firebase config for `.env.local`:

```javascript
{
  "REACT_APP_FIREBASE_API_KEY" = "AIza..."
  "REACT_APP_FIREBASE_AUTH_DOMAIN" = "your-project.firebaseapp.com"
  "REACT_APP_FIREBASE_DATABASE_URL" = "https://your-project-default-rtdb.firebaseio.com"
  "REACT_APP_FIREBASE_PROJECT_ID" = "your-project"
  "REACT_APP_FIREBASE_STORAGE_BUCKET" = "your-project.appspot.com"
  "REACT_APP_FIREBASE_MESSAGING_SENDER_ID" = "..."
  "REACT_APP_FIREBASE_APP_ID" = "1:...:web:..."
}
```

### Import Existing Firebase

If Firebase was created manually, import it:

```bash
# Get the Firebase Web App ID
gcloud firebase apps list --project=YOUR_PROJECT

# Import the Firebase App
terraform import google_firebase_web_app.default[0] YOUR_APP_ID

# Import Realtime Database
terraform import google_firebase_database_instance.default[0] \
  YOUR_PROJECT:YOUR_PROJECT-default-rtdb

# Import Storage Bucket
terraform import google_storage_bucket.firebase_storage[0] \
  YOUR_PROJECT.appspot.com
```

## Files Modified

- **`firebase.tf`** - New: Firebase resource provisioning
- **`variables.tf`** - Updated: Added firebase_region and enable_firebase
- **`outputs.tf`** - Updated: Added firebase_config and related outputs

## API Dependencies

The following APIs must be enabled (auto-enabled by Terraform):

- ✅ `firebase.googleapis.com` - Firebase Management
- ✅ `firestore.googleapis.com` - Firestore
- ✅ `firebasedatabase.googleapis.com` - Realtime Database
- ✅ `firebasestorage.googleapis.com` - Cloud Storage

## Authentication Setup (Manual)

After Terraform creates Firebase, you'll need to set up authentication in Firebase Console:

1. Go to Firebase Console → Your Project
2. Click "Authentication"
3. Click "Sign-in method"
4. Enable desired providers (Email/Password, Google, etc.)

This can't be automated via Terraform currently but will be available in future versions.

## Outputs Available

```bash
# Get all Firebase outputs
terraform output

# Get specific outputs
terraform output firebase_database_url
terraform output firebase_storage_bucket
terraform output firebase_config
```

## Terraform State Management

The Firebase resources are tracked in `terraform.tfstate`. To prevent accidental deletion:

- ✅ Database has `desired_state = "ACTIVE"` (protects from removal)
- ✅ Storage bucket has `force_destroy = false` (prevents deletion with data)

## Troubleshooting

### "Permission denied" creating Firebase App

You need these roles:
- `roles/firebase.admin` - Firebase Admin
- `roles/resourcemanager.projectIamAdmin` - Project IAM Admin
- `roles/storage.admin` - Storage Admin

### "API not enabled" error

Terraform automatically enables APIs. If you still get this error:

```bash
# Manually enable APIs
gcloud services enable firebase.googleapis.com --project=YOUR_PROJECT
gcloud services enable firebasedatabase.googleapis.com --project=YOUR_PROJECT
gcloud services enable firebasestorage.googleapis.com --project=YOUR_PROJECT
```

### Rollback Firebase

To remove all Firebase resources created by Terraform:

```bash
# Plan deletion
terraform plan -destroy -var-file=terraform.tfvars

# Destroy only Firebase
terraform destroy -var-file=terraform.tfvars \
  -target=google_firebase_web_app.default \
  -target=google_firebase_database_instance.default \
  -target=google_storage_bucket.firebase_storage
```

## Next Steps

1. ✅ Review `firebase.tf` configuration
2. ✅ Set `enable_firebase = true` in `terraform.tfvars`
3. ✅ Run `terraform apply` to create Firebase
4. ✅ Get configuration with `terraform output firebase_config`
5. ✅ Add config to GitHub Secrets
6. ✅ Set up Authentication in Firebase Console (manual step)

---

**Now Firebase is Infrastructure as Code!** 🚀
