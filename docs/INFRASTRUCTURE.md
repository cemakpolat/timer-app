# 🏗️ Infrastructure Documentation

Comprehensive guide to Terraform configuration, GCP resources, and infrastructure setup.

## Table of Contents

- [Infrastructure Overview](#infrastructure-overview)
- [Architecture](#architecture)
- [Terraform Configuration](#terraform-configuration)
- [GCP Resources](#gcp-resources)
- [Service Accounts](#service-accounts)
- [Setup & Deployment](#setup--deployment)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## Infrastructure Overview

### Architecture Diagram

```
Google Cloud Platform (Project: timerapp-2997d)
│
├─ Identity & Access
│  ├─ Service Account (terraform)
│  └─ Workload Identity (GitHub Actions → GCP)
│
├─ Firebase Services
│  ├─ Web App
│  ├─ Realtime Database
│  └─ Storage Bucket
│
├─ Compute & Functions
│  ├─ Cloud Functions
│  ├─ Cloud Scheduler
│  └─ Pub/Sub Topics
│
└─ Storage & Artifacts
   ├─ Artifact Registry
   └─ Cloud Storage
```

### Project Details

| Field | Value |
|-------|-------|
| GCP Project ID | `timerapp-2997d` |
| Project Name | Timer App |
| Region | us-central1 |
| Terraform Version | 1.5.0+ |
| State Storage | Google Cloud Storage (GCS) |
| State Lock | DynamoDB (optional) |

## Architecture

### Components

```
┌────────────────────────────────────────────────────┐
│ GitHub Repository                                  │
│ ├─ infrastructure/ (Terraform code)                │
│ └─ .github/workflows/ (CI/CD pipeline)             │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ GitHub Actions (CI/CD)                             │
│ ├─ Authenticates with GCP via Workload Identity   │
│ └─ Runs: terraform init/plan/apply                │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ Google Cloud Platform                              │
│ │                                                  │
│ ├─ Service Account (Terraform)                    │
│ │  └─ Permissions: Firebase, Storage, Compute    │
│ │                                                  │
│ ├─ Firebase (Realtime Database + Storage)         │
│ │  ├─ Web App config                             │
│ │  ├─ Database instance                          │
│ │  └─ Storage bucket                             │
│ │                                                  │
│ ├─ Cloud Functions                                │
│ │  ├─ Background jobs                            │
│ │  └─ Data aggregation                           │
│ │                                                  │
│ ├─ Pub/Sub + Scheduler                            │
│ │  ├─ Message topics                             │
│ │  └─ Scheduled triggers                         │
│ │                                                  │
│ └─ Cloud Storage                                  │
│    └─ Artifact & backup storage                  │
│                                                   │
└────────────────────────────────────────────────────┘
```

## Terraform Configuration

### File Structure

```
infrastructure/
├─ providers.tf        # GCP provider config
├─ variables.tf        # Input variables
├─ terraform.tfvars    # Variable values
├─ outputs.tf          # Output values
├─ firebase.tf         # Firebase resources
├─ services.tf         # GCP service enablement
├─ iam-and-sa.tf       # Service accounts & IAM
├─ workload-identity.tf # GitHub ↔ GCP federation
├─ pubsub-and-scheduler.tf # Pub/Sub + Scheduler
├─ storage-and-artifact.tf # Cloud Storage
├─ terraform.tfstate   # Current state (don't edit!)
└─ README.md          # Setup instructions
```

### Core Modules

#### providers.tf - GCP Provider Configuration

**Purpose**: Configure Terraform to use Google Cloud

```hcl
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  
  backend "gcs" {
    bucket = "timerapp-state-storage"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
```

**Configuration Options**:
- `project`: GCP project ID
- `region`: Default region for resources
- `backend`: Where Terraform state is stored

#### variables.tf - Input Variables

**Key Variables**:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `gcp_project_id` | string | `timerapp-2997d` | GCP project ID |
| `gcp_region` | string | `us-central1` | GCP region |
| `firebase_project_id` | string | `timerapp-2997d` | Firebase project ID |
| `app_name` | string | `timer-app` | Application name |
| `environment` | string | `production` | Environment name |

#### terraform.tfvars - Variable Values

**Example Configuration**:
```hcl
gcp_project_id      = "timerapp-2997d"
gcp_region          = "us-central1"
firebase_project_id = "timerapp-2997d"
app_name            = "timer-app"
environment         = "production"
```

#### outputs.tf - Output Values

**Firebase Configuration Outputs**:
```hcl
output "firebase_api_key" {
  description = "Firebase API Key"
  value       = data.google_firebase_web_app_config.default.api_key
  sensitive   = true
}

output "firebase_auth_domain" {
  value = data.google_firebase_web_app_config.default.auth_domain
}

output "firebase_database_url" {
  value = google_firebase_database_instance.default.database_url
}

# ... more outputs for project_id, storage_bucket, etc.
```

**7 Key Outputs**:
1. `firebase_api_key` - Authentication key
2. `firebase_auth_domain` - Auth domain
3. `firebase_database_url` - Database URL
4. `firebase_project_id` - Project ID
5. `firebase_storage_bucket` - Storage bucket
6. `firebase_messaging_sender_id` - Messaging ID
7. `firebase_app_id` - App ID

### Firebase Resources (firebase.tf)

#### Firebase Web App

```hcl
resource "google_firebase_app" "default" {
  project       = var.gcp_project_id
  display_name = "Timer App"
}

resource "google_firebase_web_app" "default" {
  project     = var.gcp_project_id
  display_name = "Timer App Web"
  app_id      = google_firebase_app.default.app_id
}

data "google_firebase_web_app_config" "default" {
  web_app_id = google_firebase_web_app.default.app_id
  project    = var.gcp_project_id
}
```

**Purpose**: Creates Firebase Web App for browser-based timer application

#### Realtime Database

```hcl
resource "google_firebase_database_instance" "default" {
  project      = var.gcp_project_id
  region       = var.gcp_region
  instance_id  = "${var.firebase_project_id}-terraform-rtdb"
  database_url = "timerapp-2997d-terraform-rtdb.firebaseio.com"
  
  depends_on = [
    google_firebase_app.default
  ]
}
```

**Purpose**: NoSQL database for real-time data storage

**Key Properties**:
- Instance ID: `timerapp-2997d-terraform-rtdb`
- Region: us-central1
- Type: Realtime Database
- Access: HTTPS + WebSocket

#### Cloud Storage

```hcl
resource "google_storage_bucket" "firebase_storage" {
  project      = var.gcp_project_id
  name         = "${var.firebase_project_id}-firebase-storage"
  location     = var.gcp_region
  
  uniform_bucket_level_access = true
  
  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 90  # Delete objects after 90 days
    }
  }
}
```

**Purpose**: File storage for backups and media

**Features**:
- Automatic cleanup after 90 days
- Uniform bucket-level access control
- CORS enabled for web uploads

### Service Enablement (services.tf)

**Enabled APIs**:
```hcl
# Firebase APIs
google_project_service "firebase"
google_project_service "firebaseio"        # Realtime Database
google_project_service "cloudfunctions"    # Cloud Functions
google_project_service "cloudscheduler"    # Cloud Scheduler
google_project_service "pubsub"            # Pub/Sub

# GCP APIs
google_project_service "compute"           # Compute Engine
google_project_service "storage"           # Cloud Storage
google_project_service "artifactregistry"  # Artifact Registry
```

### IAM & Service Accounts (iam-and-sa.tf)

#### Service Account Creation

```hcl
resource "google_service_account" "terraform" {
  project     = var.gcp_project_id
  account_id  = "terraform"
  display_name = "Terraform Service Account"
}
```

#### IAM Roles

| Role | Scope | Purpose |
|------|-------|---------|
| `Firebase Admin` | Project | Manage Firebase services |
| `Storage Admin` | Project | Manage Cloud Storage |
| `Cloud Functions Developer` | Project | Manage functions |
| `Service Account User` | Project | Impersonate service account |

### Workload Identity (workload-identity.tf)

**GitHub → GCP Federation**

```hcl
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github"
  location                   = "global"
  display_name              = "GitHub Actions"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub Provider"
  
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.aud"        = "assertion.aud"
    "attribute.repository" = "assertion.repository"
  }
  
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}
```

**Benefit**: No credentials needed, GitHub Actions authenticates via OpenID Connect

## GCP Resources

### Resources Created

```
timerapp-2997d (Project)
│
├─ Firebase Web App
│  └─ Display Name: Timer App Web
│
├─ Firebase Realtime Database
│  └─ Instance: timerapp-2997d-terraform-rtdb
│
├─ Cloud Storage Bucket
│  └─ Name: timerapp-2997d-firebase-storage
│
├─ Service Account
│  ├─ Email: terraform@timerapp-2997d.iam.gserviceaccount.com
│  └─ Permissions: Firebase Admin, Storage Admin, etc.
│
├─ Workload Identity Pool
│  └─ Connects GitHub Actions to GCP
│
├─ Cloud Functions (optional)
│  ├─ Background cleanup jobs
│  └─ Data aggregation functions
│
└─ Pub/Sub & Scheduler (optional)
   ├─ Topics: data-events, notifications
   └─ Scheduled Jobs: daily cleanup, stats aggregation
```

## Service Accounts

### Terraform Service Account

**Email**: `terraform@timerapp-2997d.iam.gserviceaccount.com`

**Permissions**:
- Firebase Admin
- Storage Admin
- Cloud Functions Developer
- Service Account User

**Key Management**:
```bash
# Create JSON key (if not using Workload Identity)
gcloud iam service-accounts keys create terraform-key.json \
  --iam-account=terraform@timerapp-2997d.iam.gserviceaccount.com

# Store as GitHub Secret: GOOGLE_APPLICATION_CREDENTIALS_JSON
```

### Function Service Account

**Email**: `timerapp-function@timerapp-2997d.iam.gserviceaccount.com`

**Purpose**: Service account for Cloud Functions

**Permissions**:
- Firestore User
- Cloud Functions Invoker

## Setup & Deployment

### Local Development Setup

1. **Install Terraform**:
   ```bash
   brew install terraform
   terraform version  # Should be 1.5.0+
   ```

2. **Install Google Cloud CLI**:
   ```bash
   brew install google-cloud-sdk
   gcloud init
   gcloud auth application-default login
   ```

3. **Configure Project**:
   ```bash
   gcloud config set project timerapp-2997d
   ```

4. **Initialize Terraform**:
   ```bash
   cd infrastructure
   terraform init
   ```

### Deployment Steps

1. **Plan Changes**:
   ```bash
   terraform plan
   ```

2. **Review Output**:
   - Check resources to be created/modified/destroyed
   - Verify all changes are correct

3. **Apply Changes**:
   ```bash
   terraform apply
   ```

4. **Verify Resources**:
   ```bash
   # List outputs
   terraform output
   
   # Check Firebase in console
   # Verify Realtime Database is created
   # Confirm Storage bucket exists
   ```

### Automated Deployment

**GitHub Actions**:
```bash
# Automatically runs on push to main
git push origin main
# Workflow deploys infrastructure
```

## Maintenance

### State Management

**Terraform State File**:
- Location: `infrastructure/terraform.tfstate`
- Storage: Google Cloud Storage (GCS)
- Backup: `terraform.tfstate.backup`

**Backup State**:
```bash
# Manual backup
cp infrastructure/terraform.tfstate backup/terraform.tfstate.$(date +%Y%m%d)

# Verify state
terraform show
```

### Updating Resources

**Modify Configuration**:
```bash
# Edit terraform file
vim infrastructure/firebase.tf

# Plan changes
terraform plan

# Apply changes
terraform apply
```

**Example: Scale Storage**:
```hcl
# In storage-and-artifact.tf, modify lifecycle rule:
lifecycle_rule {
  action {
    type = "Delete"
  }
  condition {
    age = 180  # Changed from 90 to 180 days
  }
}
```

### Monitoring

**GCP Monitoring**:
1. Go to Google Cloud Console
2. Monitoring → Dashboards
3. Create custom dashboard
4. Add metrics:
   - Firestore usage
   - Cloud Storage usage
   - Function execution time

**Terraform Monitoring**:
```bash
# Show resource details
terraform show

# Output values
terraform output

# Refresh state
terraform refresh
```

## Troubleshooting

### Common Issues

#### 1. "Insufficient Permissions" Error

**Cause**: Service account lacks required roles

**Solution**:
```bash
# Add missing role
gcloud projects add-iam-policy-binding timerapp-2997d \
  --member=serviceAccount:terraform@timerapp-2997d.iam.gserviceaccount.com \
  --role=roles/firebase.admin
```

#### 2. "Workload Identity Token Failed" Error

**Cause**: GitHub Actions cannot authenticate

**Solution**:
1. Verify Workload Identity Pool created
2. Check OIDC provider configuration
3. Verify GitHub repository configured correctly

#### 3. "Resource Already Exists" Error

**Cause**: Resource created outside Terraform

**Solution**:
```bash
# Import existing resource
terraform import google_firebase_web_app.default <app-id>

# Update terraform.tfvars with resource IDs
```

#### 4. "State Lock" Error

**Cause**: Another Terraform operation in progress

**Solution**:
```bash
# Check lock status
terraform state list

# Force unlock (if lock is stale)
terraform force-unlock <LOCK-ID>
```

#### 5. "API Not Enabled" Error

**Cause**: Required GCP API not activated

**Solution**:
```bash
# Enable API
gcloud services enable firestore.googleapis.com

# Or update services.tf to include the API
```

### Debug Mode

**Enable Terraform Debug**:
```bash
# Set debug logging
export TF_LOG=DEBUG
export TF_LOG_PATH=/tmp/terraform.log

terraform apply

# View logs
tail -f /tmp/terraform.log
```

**Verify Configuration**:
```bash
# Validate syntax
terraform validate

# Check configuration
terraform fmt -check
```

---

**For more help**: [Terraform Docs](https://www.terraform.io/docs) | [Google Cloud Terraform Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs) | [Firebase Terraform](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/firebase_app)
