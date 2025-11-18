# Infrastructure Destroy Workflow

## Overview

The destroy workflow provides a safe, controlled way to delete all GCP infrastructure. It's designed with multiple safety layers to prevent accidental destruction.

## Safety Features

### 1. Admin-Only Access
- Only repository admins/owners can trigger the workflow
- GitHub Actions prevents non-admins from running `workflow_dispatch` events
- Enforced by GitHub repository settings

### 2. Explicit Confirmation
- Requires typing exact confirmation string: `destroy-all`
- Typos or incorrect strings will abort the process
- Prevents accidental clicks

### 3. Reason Logging
- Requires specifying a reason for destruction
- Reason is logged in audit trail
- Helps track why infrastructure was destroyed

### 4. Pre-Destruction Review
- Displays full Terraform destruction plan BEFORE any deletions
- Shows exactly what will be destroyed
- 5-second pause for final review

### 5. Audit Trail
- Logs destruction event with:
  - Timestamp
  - User who triggered it
  - Reason provided
  - GitHub Actions workflow run ID
  - Final status (success/failure)

## How to Use

### Step 1: Trigger the Workflow

```
1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Destroy Infrastructure (Admin Only)"
4. Click "Run workflow"
```

### Step 2: Fill in Requirements

```
Confirmation: destroy-all
   (EXACTLY this string - typos will be rejected)

Reason: e.g., "Cleanup old environment" or "Cost reduction test"
   (This is logged for audit purposes)
```

### Step 3: Review the Plan

The workflow will:
1. Initialize Terraform
2. Show destruction plan
3. Display resources to be deleted
4. Wait 5 seconds before proceeding
5. Await final confirmation

### Step 4: Destruction Executes

Once confirmed, Terraform destroys:
- ✅ Firebase Web Apps
- ✅ Realtime Database
- ✅ Cloud Storage
- ✅ Cloud Functions
- ✅ Cloud Scheduler Jobs
- ✅ Pub/Sub Topics
- ✅ IAM Service Accounts
- ✅ Workload Identity configuration

### Step 5: Post-Destruction

After successful destruction:
- ✅ Audit log is created
- ✅ Workflow completes
- ✅ Infrastructure is gone

**To restore**: Simply run the normal Deploy workflow (push to main branch)

## What Gets Destroyed

### Firebase Services
- Web App configuration
- Realtime Database (data will be lost!)
- Cloud Storage bucket
- Authentication settings

### Cloud Functions
- All deployed functions
- Function storage buckets
- Scheduled jobs

### IAM & Permissions
- Service accounts
- IAM role bindings
- Workload Identity pools/providers

### Monitoring
- Cloud Scheduler jobs
- Pub/Sub topics

## Important Warnings

### ⚠️ Data Loss
```
Destroying the Realtime Database will DELETE ALL DATA
There is NO automatic backup or recovery
Only proceed if you have manually backed up important data
```

### ⚠️ Downtime
```
All users will lose access to the application
Consider scheduling this during maintenance window
Notify users before destruction
```

### ⚠️ Re-provisioning Time
```
After destruction, re-provisioning takes 10-20 minutes
- GCP services initialization: 5-10 min
- Terraform apply: 5-10 min
- Firebase deployment: 2-5 min
```

## Recovery After Destruction

### Option 1: Restore from Git

```bash
# 1. Ensure all code is committed
git status

# 2. Trigger the normal deploy workflow
git push origin main

# 3. GitHub Actions will:
#    - Provision new infrastructure
#    - Deploy database rules
#    - Deploy Cloud Functions
#    - Deploy React app to hosting
#    - Everything will be back online

# Expected time: 15-20 minutes
```

### Option 2: Manual Restoration

```bash
# 1. Create GCP credentials
gcloud auth application-default login

# 2. Deploy infrastructure
cd infrastructure
terraform apply -var-file=terraform.tfvars

# 3. Deploy database rules
firebase deploy --only database --project timerapp-2997d

# 4. Deploy Cloud Functions
firebase deploy --only functions --project timerapp-2997d

# 5. Deploy React app
npm run build
firebase deploy --only hosting --project timerapp-2997d
```

## Audit Trail

All destruction events are logged. To check audit logs:

```
GitHub > Repository > Settings > Audit log
Filter by: Destroy Infrastructure workflow runs
```

View details:
- Who triggered it
- When it was triggered
- Success or failure status
- Workflow run ID for full logs

## Cost Implications

### Before Destruction
- Firebase services incur ongoing costs
- Cloud Functions may have invocation costs
- Cloud Scheduler invocations billed

### After Destruction
- ✅ All services stopped
- ✅ No more charges
- ✅ Storage costs cease

**Note**: Deleted data cannot be recovered unless explicitly backed up

## Emergency Destruction

For emergency scenarios where you need immediate destruction:

```bash
# If workflow access is unavailable:
1. Go to GCP Console
2. Manually delete resources:
   - Firebase project (or disable services)
   - Delete Cloud Functions
   - Delete Pub/Sub topics
   - Delete Cloud Scheduler jobs
   - Revoke IAM bindings

# Or via gcloud:
gcloud firebase database delete timerapp-2997d-default-rtdb
gcloud functions delete scheduledRoomCleanup --region us-central1
gcloud scheduler jobs delete cleanup-scheduler
```

## Frequently Asked Questions

### Q: Can I destroy just part of the infrastructure?

**A**: No, the current destroy workflow is all-or-nothing for safety. To selectively destroy resources, use:

```bash
# Destroy specific resource
cd infrastructure
terraform destroy -target=RESOURCE_TYPE.RESOURCE_NAME
```

### Q: How long does destruction take?

**A**: Typically 5-10 minutes for Terraform destruction plus GCP cleanup time.

### Q: What if destruction fails halfway?

**A**: Check the logs, fix any issues, and try again. Terraform tracks state, so re-running will clean up any remaining resources.

### Q: Can destruction be canceled?

**A**: Once Terraform apply begins, it cannot be canceled. The 5-second pause is your last chance to stop it.

### Q: Is there a way to prevent accidental destruction?

**A**: Multiple ways:
1. Use GitHub branch protection rules
2. Require pull request reviews
3. Restrict admin status to limited team members
4. Enable "Admin approval required" in branch settings

## See Also

- [Deploy Workflow Documentation](./../docs/CICD.md)
- [Infrastructure as Code Guide](./../docs/INFRASTRUCTURE.md)
- [Terraform Documentation](https://www.terraform.io/docs/cli/state)
