# 📚 Documentation Guide

## Quick Start (5 minutes) ⚡

👉 **Start here**: [`SETUP.md`](./SETUP.md)
- Add 3 GitHub secrets
- Create GitHub Actions workflow (already provided!)
- Deploy & done

## Essential Docs

| File | Purpose |
|------|---------|
| **`SETUP.md`** | Complete setup guide for GitHub Actions |
| **`CHECKLIST.md`** | Deployment checklist & verification |
| **`README.md`** | Project overview |
| **`infrastructure/README.md`** | Terraform configuration details |

## Feature Documentation

| File | Purpose |
|------|---------|
| `FIREBASE-SETUP.md` | Firebase configuration & authentication |
| `FOCUS-ROOMS-COMPLETE.md` | Focus Rooms feature documentation |
| `REALTIME-FEATURES.md` | Real-time database features |
| `REFACTORING_GUIDE.md` | Code refactoring improvements |

---

## Infrastructure Overview

### Deployed Resources (35 total)

```
✅ Workload Identity Federation (WIF)
✅ GitHub Actions Service Account
✅ Cloud Function Runtime Service Account  
✅ Cloud Function (Node.js 20)
✅ Cloud Scheduler (15-min intervals)
✅ Cloud Pub/Sub Topic
✅ Cloud Storage Bucket
✅ IAM Bindings (10+)
✅ Project Services (8+)
```

### Key Values

| Item | Value |
|------|-------|
| **GCP Project** | `timerapp-2997d` |
| **GitHub Repo** | `cemakpolat/timer-app` |
| **Region** | `us-central1` |
| **Function** | `scheduledRoomCleanup` |

---

## GitHub Secrets (Required)

Add these 3 secrets to your repository:

```
GCP_PROJECT_ID = timerapp-2997d

GCP_WORKLOAD_IDENTITY_PROVIDER = 
projects/timerapp-2997d/locations/global/workloadIdentityPools/github-pool/providers/github-provider

GCP_SERVICE_ACCOUNT_EMAIL = 
github-actions@timerapp-2997d.iam.gserviceaccount.com
```

**Where**: Settings → Secrets and variables → Actions

---

## What's New

✅ **Fully Automated** - No manual deployments needed  
✅ **WIF Security** - No service account keys in repo  
✅ **Zero Downtime** - Plan first, then apply  
✅ **Full CI/CD** - Test on PRs, deploy to main  

---

## File Structure

```
timer-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions (auto-deployment)
│
├── infrastructure/
│   ├── *.tf                    ← Terraform configs (35 resources)
│   ├── terraform.tfvars        ← Project values
│   └── terraform.tfstate       ← Current state
│
├── functions/                  ← Cloud Function code
├── src/                        ← React app
├── public/                     ← Static assets
│
└── docs/
    ├── SETUP.md               ← START HERE
    ├── CHECKLIST.md           ← Verification
    ├── README.md              ← Project overview
    └── [other docs]
```

---

## Next Steps

**Step 1**: Open [`SETUP.md`](./SETUP.md)  
**Step 2**: Add the 3 GitHub secrets  
**Step 3**: Commit & push to main  
**Step 4**: Watch GitHub Actions  
**Step 5**: Done! ✅  

Time needed: **~5 minutes**

---

## Support

- **Terraform issues**: Check `infrastructure/README.md`
- **GCP console**: https://console.cloud.google.com/
- **GitHub Actions**: Check the Actions tab in your repo
- **Docs**: See feature-specific files listed above

---

## Key Commands

```bash
# Verify Terraform locally
cd infrastructure && terraform validate

# Plan infrastructure changes
terraform plan -var-file=terraform.tfvars

# Check GCP resources
gcloud functions describe scheduledRoomCleanup --region=us-central1 --project=timerapp-2997d
```

---

**Last Updated**: November 2025  
**Status**: ✅ Production Ready
