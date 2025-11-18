# 🚀 Timer App - GitHub Actions Deployment Guide

## Overview

Your infrastructure is **fully deployed** on Google Cloud Platform (GCP). This guide will set up GitHub Actions for automated deployments.

---

## Step 1: Add GitHub Secrets (5 minutes)

Go to: **Settings → Secrets and variables → Actions**  
Click **"New repository secret"** three times and add:

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

✅ Verify all 3 secrets appear in your repository settings.

---

## Step 2: GitHub Actions Workflow

✅ File `.github/workflows/deploy.yml` is already created and configured!

The workflow:
- Authenticates using Workload Identity Federation (OIDC)
- Validates Terraform configuration
- Plans infrastructure changes
- Auto-applies changes on main branch pushes
- Shows plan on pull requests (no auto-apply)

---

## Step 3: Activate the Workflow

The workflow file is ready. Just push any commit to main:

```bash
git commit --allow-empty -m "Activate GitHub Actions workflow"
git push origin main
```

Then check: **https://github.com/cemakpolat/timer-app/actions**

✅ You should see the workflow running!

## Summary

You're all set! Here's what's been done:

✅ **Infrastructure**: 35 GCP resources deployed  
✅ **Workflow**: `.github/workflows/deploy.yml` ready  
✅ **Secrets**: Add the 3 GitHub secrets (see Step 1)  

Every push to `main` will now:
1. Validate Terraform configuration
2. Plan infrastructure changes
3. Apply changes to GCP automatically

---

## What to Do Now

1. ✅ Add the 3 GitHub secrets (Step 1 above)
2. ✅ Push any commit to main
3. ✅ Watch GitHub Actions automatically deploy!

That's it! Your infrastructure deployment is now fully automated. 🚀

Your GCP project `timerapp-2997d` now contains:

| Component | Status | Details |
|-----------|--------|---------|
| Workload Identity Pool | ✅ Active | OIDC provider for GitHub Actions |
| GitHub Actions SA | ✅ Active | `github-actions@timerapp-2997d.iam.gserviceaccount.com` |
| Cloud Function | ✅ Active | `scheduledRoomCleanup` (Node.js 20) |
| Cloud Scheduler | ✅ Active | Triggers every 15 minutes |
| Cloud Pub/Sub | ✅ Active | `cleanup-topic` |
| Cloud Storage | ✅ Active | `timerapp-2997d-artifacts` |

---

## Key Features

✅ **Zero Service Account Keys in Repository** - Uses OIDC tokens  
✅ **Auto-Rotating Credentials** - 1-hour token expiry, automatic refresh  
✅ **Least Privilege Access** - Minimal necessary permissions  
✅ **Fully Automated** - Plan on PRs, auto-apply on main  

---

## Useful Commands

```bash
# Check function status
gcloud functions describe scheduledRoomCleanup --region=us-central1 --project=timerapp-2997d

# Check scheduler
gcloud scheduler jobs describe cleanup-scheduler --location=us-central1 --project=timerapp-2997d

# Check WIF pool
gcloud iam workload-identity-pools describe github-pool --project=timerapp-2997d --location=global

# Validate Terraform locally
cd infrastructure && terraform validate

# Plan changes
cd infrastructure && terraform plan -var-file=terraform.tfvars
```

---

## Troubleshooting

**❌ "Workload identity provider not found"**
- Check secret names are spelled exactly (case-sensitive)
- Verify all 3 secrets are set

**❌ "Permission denied"**
- Service account needs roles - already configured ✅
- Give GCP a few minutes to propagate changes

**❌ "Terraform command not found"**
- Workflow has `setup-terraform` step - should work
- Check runner has internet access

---

## Files in Your Repository

```
├── .github/
│   └── workflows/
│       └── deploy.yml          (New - CI/CD workflow)
│
├── infrastructure/
│   ├── *.tf                    (All Terraform configs)
│   ├── terraform.tfvars        (Project values)
│   └── terraform.tfstate       (Current state)
│
├── README.md                   (Original)
└── [other project files]
```

---

## Next Steps

1. ✅ Add the 3 GitHub secrets
2. ✅ Create `.github/workflows/deploy.yml`
3. ✅ Push to main
4. ✅ Watch GitHub Actions tab
5. ✅ Infrastructure updates automatically!

---

**That's it!** Your Timer App is now deployed with fully automated CI/CD. 🎉

Every push to `main` will automatically:
- Validate Terraform configuration
- Plan infrastructure changes
- Apply changes to GCP

Questions? Check `infrastructure/README.md` for technical details.
