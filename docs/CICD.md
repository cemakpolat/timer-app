# 🚀 CI/CD Pipeline Documentation

Comprehensive guide to GitHub Actions, deployment process, and credentials management.

## Table of Contents

- [Pipeline Overview](#pipeline-overview)
- [Architecture](#architecture)
- [Workflow Stages](#workflow-stages)
- [Credentials Management](#credentials-management)
- [Deployment Process](#deployment-process)
- [Troubleshooting](#troubleshooting)
- [Security](#security)

## Pipeline Overview

### Purpose

The CI/CD pipeline automates:
- Infrastructure provisioning via Terraform
- React app building and testing
- Firebase deployment
- Credential management and encryption

### Pipeline Trigger

```
Event: Push to main branch
↓
Workflow: .github/workflows/deploy.yml
↓
3 Sequential Jobs:
1. infrastructure (provisioning)
2. build (React compilation)
3. deploy (Firebase hosting)
```

### Key Technologies

| Tool | Purpose | Version |
|------|---------|---------|
| GitHub Actions | CI/CD orchestration | Latest |
| Terraform | Infrastructure as Code | 1.5.0 |
| Node.js | React build environment | 18.x |
| Firebase CLI | Firebase deployment | Latest |
| OpenSSL | Credential encryption | Default |

## Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────┐
│ Developer pushes to main branch                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Job 1: Infrastructure                                   │
│ ├─ Run Terraform apply                                  │
│ ├─ Extract Firebase credentials (7 values)              │
│ ├─ Encrypt credentials with AES-256-CBC                 │
│ └─ Upload encrypted artifact                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Job 2: Build (depends on infrastructure)                │
│ ├─ Download encrypted artifact                          │
│ ├─ Decrypt credentials                                  │
│ ├─ Load into environment variables                      │
│ ├─ Install dependencies                                 │
│ ├─ Run tests                                            │
│ └─ Build React app                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Job 3: Deploy (depends on build)                        │
│ ├─ Download build artifacts                             │
│ ├─ Download decrypted credentials                       │
│ ├─ Deploy to Firebase Hosting                           │
│ └─ Post deployment tests (optional)                     │
└─────────────────────────────────────────────────────────┘
```

## Workflow Stages

### Job 1: Infrastructure

**Purpose**: Provision GCP resources and extract configuration

**Steps**:
```yaml
1. Checkout repository
2. Setup Google Cloud credentials
3. Run Terraform init/plan/apply
4. Extract Terraform outputs (7 Firebase config values)
5. Mask sensitive values with ::add-mask::
6. Encrypt credentials with OpenSSL AES-256-CBC
7. Upload encrypted artifact to GitHub
```

**Outputs**:
- Encrypted artifact: `firebase-config.env.enc`
- Terraform state: `terraform.tfstate`
- GCP resources provisioned

**Service Account Permissions**:
- Compute → Instance Admin
- Firebase → Editor
- Storage → Admin
- Service Accounts → Service Account User

### Job 2: Build

**Purpose**: Build React application with credentials

**Steps**:
```yaml
1. Checkout repository
2. Download encrypted artifact from previous job
3. Decrypt artifact with matching secret key
4. Load credentials into $GITHUB_ENV
5. Setup Node.js 18.x
6. Install dependencies: npm ci
7. Run tests: npm test -- --coverage
8. Build app: npm run build
9. Upload build artifacts
```

**Environment Variables Loaded**:
```env
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_DATABASE_URL
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
```

**Artifacts Created**:
- Build output in `build/` directory
- `asset-manifest.json`
- Static CSS/JS files

### Job 3: Deploy

**Purpose**: Deploy build to Firebase Hosting

**Steps**:
```yaml
1. Checkout repository
2. Setup Node.js 18.x
3. Install Firebase CLI: npm install -g firebase-tools
4. Download build artifacts
5. Download and decrypt credentials
6. Authenticate with Firebase (using service account)
7. Deploy to Firebase Hosting: firebase deploy
8. Post-deployment verification
```

**Firebase Deployment**:
- Hosting: `build/` → `timerapp-2997d.web.app`
- Database rules: `infrastructure/database-rules.json`
- Functions: `functions/` → Google Cloud Functions

## Credentials Management

### Credential Flow

```
GitHub Secret (CREDENTIALS_ENCRYPTION_KEY)
        ↓
Infrastructure Job (encrypt with AES-256-CBC)
        ↓
Artifact (firebase-config.env.enc)
        ↓
Build Job (decrypt and load to env)
        ↓
React Build (uses via process.env)
        ↓
Deployed App (credentials embedded in config)
```

### Required GitHub Secrets

#### 1. GOOGLE_APPLICATION_CREDENTIALS_JSON

**Purpose**: GCP service account for Terraform

**Format**: JSON key file content

**Example**:
```json
{
  "type": "service_account",
  "project_id": "timerapp-2997d",
  "private_key_id": "key123",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "terraform@timerapp-2997d.iam.gserviceaccount.com",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**Setup**:
```bash
# In Google Cloud Console
1. Create service account
2. Create JSON key
3. Copy JSON content
4. Add to GitHub Secrets as GOOGLE_APPLICATION_CREDENTIALS_JSON
```

#### 2. CREDENTIALS_ENCRYPTION_KEY

**Purpose**: AES-256-CBC encryption key for credential files

**Format**: Base64-encoded 32-byte string

**Generate**:
```bash
openssl rand -base64 32
```

**Setup**:
```bash
# In GitHub repository settings
1. Go to Secrets and variables → Actions
2. Click New repository secret
3. Name: CREDENTIALS_ENCRYPTION_KEY
4. Value: (paste generated key)
5. Click Add secret
```

#### 3. FIREBASE_TOKEN

**Purpose**: Firebase CLI authentication token

**Format**: Authentication token

**Generate**:
```bash
firebase login:ci
```

**Setup**:
```bash
# Paste token to GitHub Secrets
```

### Credential Encryption/Decryption

#### Encryption Process (Infrastructure Job)

```bash
# Step 1: Create credentials file
cat > /tmp/credentials/firebase-config.env << EOF
REACT_APP_FIREBASE_API_KEY=$API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=$AUTH_DOMAIN
REACT_APP_FIREBASE_DATABASE_URL=$DATABASE_URL
REACT_APP_FIREBASE_PROJECT_ID=$PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=$APP_ID
EOF

# Step 2: Mask sensitive values BEFORE output
echo "::add-mask::$API_KEY"
echo "::add-mask::$AUTH_DOMAIN"
# ... more masking

# Step 3: Encrypt file
openssl enc -aes-256-cbc -salt \
  -in /tmp/credentials/firebase-config.env \
  -out /tmp/credentials/firebase-config.env.enc \
  -pass pass:"${{ secrets.CREDENTIALS_ENCRYPTION_KEY }}" \
  -md sha256

# Step 4: Remove plaintext
rm /tmp/credentials/firebase-config.env
```

#### Decryption Process (Build Job)

```bash
# Step 1: Verify artifact exists
ls -la /tmp/credentials/firebase-config.env.enc

# Step 2: Decrypt file
openssl enc -aes-256-cbc -d \
  -in /tmp/credentials/firebase-config.env.enc \
  -out /tmp/credentials/firebase-config.env \
  -pass pass:"${{ secrets.CREDENTIALS_ENCRYPTION_KEY }}" \
  -md sha256

# Step 3: Load into GitHub environment
cat /tmp/credentials/firebase-config.env >> $GITHUB_ENV

# Step 4: Clean up
rm /tmp/credentials/firebase-config.env
rm /tmp/credentials/firebase-config.env.enc
```

## Deployment Process

### Full Deployment Cycle

1. **Developer Actions**:
   ```bash
   git add .
   git commit -m "feat: new feature"
   git push origin main
   ```

2. **GitHub Detects Push**:
   - Triggers workflow: `.github/workflows/deploy.yml`
   - Runs on `main` branch only

3. **Infrastructure Job** (5-10 minutes):
   - Authenticates with GCP
   - Runs Terraform apply
   - Provisions/updates resources
   - Encrypts credentials
   - Uploads artifact

4. **Build Job** (depends on infrastructure) (3-5 minutes):
   - Waits for infrastructure job
   - Downloads encrypted artifact
   - Decrypts credentials
   - Installs dependencies
   - Runs tests
   - Builds React app
   - Uploads build artifacts

5. **Deploy Job** (depends on build) (2-3 minutes):
   - Waits for build job
   - Downloads build artifacts
   - Authenticates with Firebase
   - Deploys to Hosting
   - Verifies deployment

**Total Time**: ~10-20 minutes

### Manual Deployment (if needed)

```bash
# Deploy only infrastructure
terraform apply -auto-approve

# Deploy only Firebase Hosting
npm run build
firebase deploy --only hosting --project timerapp-2997d

# Deploy database rules
firebase deploy --only database --project timerapp-2997d

# Deploy functions
firebase deploy --only functions --project timerapp-2997d
```

## Troubleshooting

### Common Issues

#### 1. "REACT_APP_FIREBASE_API_KEY Missing" Error

**Cause**: Credentials not properly decrypted or loaded

**Solution**:
1. Verify `CREDENTIALS_ENCRYPTION_KEY` secret exists
2. Check encryption command output (infrastructure job)
3. Verify decryption command (build job)
4. Check `$GITHUB_ENV` file contents

**Debug**:
```bash
# In build job, add debug step:
- name: Debug credentials
  run: |
    echo "Checking credentials:"
    cat /tmp/credentials/firebase-config.env || echo "File not found"
    echo "Environment variables:"
    env | grep REACT_APP || echo "No REACT_APP variables"
```

#### 2. "GCP Authentication Failed" Error

**Cause**: Service account key not configured

**Solution**:
1. Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` secret
2. Check service account permissions
3. Verify key not expired

**Debug**:
```bash
# Test GCP auth locally:
echo $GOOGLE_APPLICATION_CREDENTIALS | base64 -d > /tmp/key.json
gcloud auth activate-service-account --key-file=/tmp/key.json
```

#### 3. "Permission Denied" at Firebase Deploy

**Cause**: Service account lacks required permissions

**Solution**:
1. Add `Firebase Admin` role to service account
2. Add `Service Account User` role
3. Verify OAuth credentials

#### 4. Terraform "State Lock" Error

**Cause**: Previous run didn't complete cleanly

**Solution**:
```bash
# In infrastructure/terraform.tfstate, find lock:
terraform force-unlock LOCK_ID

# Or manually remove lock in Google Cloud Storage
```

#### 5. Build Fails with "npm install" Error

**Cause**: Dependency conflicts or network issues

**Solution**:
1. Clear npm cache: `npm cache clean --force`
2. Check `package-lock.json`
3. Verify Node.js version compatibility
4. Check network connectivity

### Viewing Logs

**GitHub Actions Logs**:
1. Go to repository → Actions
2. Select workflow run
3. Click job to see logs
4. Search for specific errors

**View Specific Step**:
- Click expand arrow on step name
- See full command output and errors

**Download Logs**:
1. Click "..." on workflow run
2. Select "Download logs"
3. Extracts .zip with all logs

## Security

### Best Practices

✅ **DO**:
- Rotate encryption keys monthly
- Limit secret access to necessary workflows
- Use branch protection rules
- Enable required reviews
- Monitor secret access logs
- Encrypt all sensitive data
- Use short-lived tokens

❌ **DON'T**:
- Commit credentials to repository
- Share secrets in pull requests
- Log sensitive values to console
- Store backups unencrypted
- Use same key for multiple purposes
- Disable secret masking

### Secret Rotation

**Monthly Rotation Process**:
```bash
# Generate new encryption key
NEW_KEY=$(openssl rand -base64 32)

# Update GitHub Secret:
# 1. Go to Secrets → CREDENTIALS_ENCRYPTION_KEY
# 2. Update with new value
# 3. Run deployment (re-encrypts credentials)
```

### Audit Trail

**Check who accessed secrets**:
1. Repository Settings → Audit log
2. Filter for secret access
3. Review timestamp and actor
4. Investigate unauthorized access

### Network Security

**GitHub Actions Network**:
- Runs on GitHub-hosted runners
- Default internet access enabled
- Can restrict to GitHub IPs if needed
- All communication encrypted (HTTPS)

---

**For more help**: [GitHub Actions Docs](https://docs.github.com/en/actions) | [Firebase Deployment](https://firebase.google.com/docs/hosting/deploying)
