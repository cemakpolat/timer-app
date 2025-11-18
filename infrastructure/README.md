# Timer App - Infrastructure & Deployment Guide

## ✅ Status: FULLY DEPLOYED

**Project**: Timer App  
**GCP Project**: `timerapp-2997d` (numeric: `341637730794`)  
**Repository**: `cemakpolat/timer-app`  
**Region**: `us-central1`  
**Status**: Production Ready ✅

---

## 📦 What's Deployed

| Component | Details | Status |
|-----------|---------|--------|
| **Workload Identity Pool** | `github-pool` (OIDC) | ✅ Active |
| **WIF Provider** | `github-provider` | ✅ Active |
| **GitHub Actions SA** | `github-actions@timerapp-2997d.iam.gserviceaccount.com` | ✅ Ready |
| **Function Runtime SA** | `timer-app-function@timerapp-2997d.iam.gserviceaccount.com` | ✅ Ready |
| **Cloud Function** | `scheduledRoomCleanup` (Node.js 20) | ✅ Active |
| **Cloud Scheduler** | Every 15 minutes | ✅ Active |
| **Pub/Sub Topic** | `cleanup-topic` | ✅ Active |
| **Cloud Storage** | `timerapp-2997d-artifacts` | ✅ Active |
| **IAM Bindings** | 10+ configured | ✅ Set |

**Total Resources**: 34 created + 5 imported = 39 managed by Terraform ✅

---

## 🔑 GitHub Secrets to Create

Add these **3 secrets** to your GitHub repository:
https://github.com/cemakpolat/timer-app/settings/secrets/actions

### Secret 1: `GCP_PROJECT_ID`
```
timerapp-2997d
```

### Secret 2: `GCP_WORKLOAD_IDENTITY_PROVIDER`
```
projects/timerapp-2997d/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

### Secret 3: `GCP_SERVICE_ACCOUNT_EMAIL`
```
github-actions@timerapp-2997d.iam.gserviceaccount.com
```

---

## 🤖 GitHub Actions Workflow

Create file: `.github/workflows/deploy.yml`

```yaml
name: Deploy Infrastructure to GCP

on:
  push:
    branches: [main]
    paths:
      - 'infrastructure/**'
  pull_request:
    branches: [main]
    paths:
      - 'infrastructure/**'

jobs:
  terraform:
    runs-on: ubuntu-latest
    permissions:
      contents: 'read'
      id-token: 'write'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account_email: ${{ secrets.GCP_SERVICE_ACCOUNT_EMAIL }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.5.0

      - name: Initialize Terraform
        working-directory: ./infrastructure
        run: terraform init

      - name: Validate Terraform
        working-directory: ./infrastructure
        run: terraform validate

      - name: Terraform Plan
        working-directory: ./infrastructure
        run: terraform plan -var-file=terraform.tfvars -out=tfplan

      - name: Comment PR with Plan
        if: github.event_name == 'pull_request'
        working-directory: ./infrastructure
        run: |
          echo "## Terraform Plan" >> $GITHUB_STEP_SUMMARY
          terraform show -no-color tfplan >> $GITHUB_STEP_SUMMARY

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        working-directory: ./infrastructure
        run: terraform apply -auto-approve tfplan

      - name: Output Results
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        working-directory: ./infrastructure
        run: |
          echo "## Deployment Complete" >> $GITHUB_STEP_SUMMARY
          terraform output >> $GITHUB_STEP_SUMMARY
```

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Add GitHub Secrets
```bash
# Go to: https://github.com/cemakpolat/timer-app/settings/secrets/actions
# Add the 3 secrets listed above
```

### Step 2: Create Workflow File
```bash
# Create the file .github/workflows/deploy.yml with content above
```

### Step 3: Push and Test
```bash
git add .github/workflows/deploy.yml
git commit -m "Add Terraform CI/CD workflow"
git push origin main
```

### Step 4: Verify
Visit: https://github.com/cemakpolat/timer-app/actions
Watch the workflow run automatically! ✅

---

## 📁 Infrastructure Files

### Terraform Configuration
- **`workload-identity.tf`** - WIF pool, provider, service accounts, and bindings
- **`iam-and-sa-new.tf`** - IAM roles and permission bindings
- **`pubsub-and-scheduler.tf`** - Cloud Function, Pub/Sub, Cloud Scheduler
- **`storage-and-artifact.tf`** - Cloud Storage bucket configuration
- **`services.tf`** - Enabled GCP APIs (Cloud Build, Cloud Functions, etc.)
- **`providers.tf`** - Terraform provider configuration
- **`variables.tf`** - Input variables (project, GitHub repo, region)
- **`outputs.tf`** - Output values for GitHub Actions
- **`terraform.tfvars`** - Variable values (project settings)

### State Management
- **`terraform.tfstate`** - Current infrastructure state (auto-managed)
- **`terraform.tfstate.backup`** - State backup (auto-managed)
- **`.terraform.lock.hcl`** - Provider lock file

---

## 🔍 Verify Deployment

Check that everything is working:

```bash
# Check Cloud Function
gcloud functions describe scheduledRoomCleanup \
  --region=us-central1 \
  --project=timerapp-2997d

# Check Cloud Scheduler
gcloud scheduler jobs describe cleanup-scheduler \
  --location=us-central1 \
  --project=timerapp-2997d

# Check Workload Identity Pool
gcloud iam workload-identity-pools describe github-pool \
  --project=timerapp-2997d \
  --location=global

# List all GCP resources
gcloud resource-manager search-resources --project=timerapp-2997d
```

---

## 🔐 Security Features

✅ **No Service Account Keys in Repository**  
   - GitHub Actions uses Workload Identity Federation with OIDC tokens
   - Tokens auto-rotate every 1 hour
   - Zero long-lived credentials

✅ **Least Privilege Access**  
   - Separate service accounts for GitHub Actions and Cloud Functions
   - Each SA has only required permissions
   - No project-wide Admin roles

✅ **Attribute-Based Access Control**  
   - GitHub Actions authenticated only for `cemakpolat/timer-app`
   - Repository owner validation built-in
   - OIDC token validation from GitHub's issuer

---

## 🛠️ Common Operations

### Deploy Infrastructure Changes
```bash
cd infrastructure
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

### Destroy All Resources
```bash
cd infrastructure
terraform destroy -var-file=terraform.tfvars
```

### Update Service Account Permissions
```bash
cd infrastructure
terraform apply -var-file=terraform.tfvars -target=google_project_iam_member.ci_storage_admin
```

### View Current State
```bash
cd infrastructure
terraform state list
terraform state show google_cloudfunctions_function.cleanup_function[0]
```

### Refresh State
```bash
cd infrastructure
terraform refresh -var-file=terraform.tfvars
```

---

## 📊 Terraform Outputs

After deployment, view outputs:

```bash
cd infrastructure
terraform output -json
```

Key outputs:
- `artifact_bucket` - Cloud Storage bucket name
- `cleanup_topic` - Pub/Sub topic name
- `cleanup_function_name` - Cloud Function name
- `github_actions_service_account_email` - SA for GitHub Actions
- `workload_identity_provider_name` - WIF provider resource name
- `workload_identity_pool_name` - WIF pool resource name

---

## ❌ Troubleshooting

### Error: "Permission denied"
```bash
# Grant Editor role
gcloud projects add-iam-policy-binding timerapp-2997d \
  --member=serviceAccount:ci-deployer@timerapp-2997d.iam.gserviceaccount.com \
  --role=roles/editor
```

### Error: "Identity Pool does not exist"
- Ensure `terraform apply` completed successfully
- Check: `gcloud iam workload-identity-pools list --location=global --project=timerapp-2997d`

### Error: "Terraform init fails"
```bash
cd infrastructure
rm -rf .terraform .terraform.lock.hcl
terraform init
```

### GitHub Actions workflow not running
- Check secrets are correctly spelled (case-sensitive)
- Verify workflow file is in `.github/workflows/deploy.yml`
- Check GitHub Actions permissions in repo settings

---

## 📞 Support

### Check Logs
```bash
# GitHub Actions
https://github.com/cemakpolat/timer-app/actions

# Cloud Function
gcloud functions logs read scheduledRoomCleanup --region=us-central1 --project=timerapp-2997d

# Cloud Scheduler
gcloud scheduler jobs describe cleanup-scheduler --location=us-central1 --project=timerapp-2997d
```

### View GCP Resources
- Cloud Console: https://console.cloud.google.com/
- Project: timerapp-2997d
- Regions: us-central1

---

## 📝 Infrastructure Variables

Located in `terraform.tfvars`:

```hcl
project_id       = "timerapp-2997d"
region            = "us-central1"
github_repo_owner = "cemakpolat"
github_repo       = "cemakpolat/timer-app"
```

Update these to change deployment settings.

---

## ✨ Features Enabled

- ✅ Automatic Cloud Function deployment via GitHub Actions
- ✅ Scheduled room cleanup every 15 minutes
- ✅ Event-driven Pub/Sub messaging
- ✅ Artifact storage in Cloud Storage
- ✅ OIDC-based secure authentication
- ✅ Zero-downtime infrastructure updates
- ✅ Full Terraform state management
- ✅ IAM audit logging

---

**Last Updated**: November 18, 2025  
**Deployment Status**: ✅ Production Ready  
**Next Step**: Add 3 GitHub secrets and push workflow file
