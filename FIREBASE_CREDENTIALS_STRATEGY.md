# Firebase Credentials Management Strategy

## The Problem

You have two potential sources of Firebase configuration:

1. **GitHub Secrets** - Manually entered Firebase credentials (7 values)
2. **Terraform** - Auto-generated Firebase credentials from `terraform apply`

These create a conflict: Which one should your app use?

---

## The Solution: Three Strategies

### **Strategy 1: Terraform-First (RECOMMENDED) 🎯**

**Use Terraform as the source of truth, remove manual secrets**

#### How It Works

1. **Deploy Firebase via Terraform:**
   ```bash
   cd infrastructure
   terraform apply -var-file=terraform.tfvars -auto-approve
   ```

2. **Extract credentials from Terraform:**
   ```bash
   terraform output firebase_config
   ```

3. **Add to GitHub Secrets** - Copy the 7 values from output
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_DATABASE_URL`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`

4. **Update GitHub Actions** to pass secrets to React build:
   ```yaml
   - name: Build React App
     working-directory: ./
     env:
       REACT_APP_FIREBASE_API_KEY: ${{ secrets.REACT_APP_FIREBASE_API_KEY }}
       REACT_APP_FIREBASE_AUTH_DOMAIN: ${{ secrets.REACT_APP_FIREBASE_AUTH_DOMAIN }}
       # ... all 7 secrets
     run: npm run build
   ```

#### Advantages ✅
- Single source of truth (Terraform)
- Credentials stored in state file (with encryption/backend)
- Easy to rotate: just `terraform apply` again
- Can reproduce entire infrastructure from code
- Automated credential management

#### Disadvantages ⚠️
- Terraform state file contains sensitive data (must secure!)
- Need to manually update GitHub Secrets after Terraform changes
- More complex workflow setup

---

### **Strategy 2: Secrets-First (CURRENT) ✨**

**Use manually entered GitHub Secrets, let Terraform use the same credentials**

#### How It Works

1. **Keep existing GitHub Secrets** - Don't change them
2. **Store secrets in Terraform** via `terraform.tfvars`:
   ```hcl
   firebase_api_key            = var("REACT_APP_FIREBASE_API_KEY")
   firebase_auth_domain        = var("REACT_APP_FIREBASE_AUTH_DOMAIN")
   firebase_database_url       = var("REACT_APP_FIREBASE_DATABASE_URL")
   firebase_project_id         = var("REACT_APP_FIREBASE_PROJECT_ID")
   firebase_storage_bucket     = var("REACT_APP_FIREBASE_STORAGE_BUCKET")
   firebase_messaging_sender_id = var("REACT_APP_FIREBASE_MESSAGING_SENDER_ID")
   firebase_app_id             = var("REACT_APP_FIREBASE_APP_ID")
   ```

3. **Read from environment in GitHub Actions:**
   ```yaml
   - name: Create terraform.tfvars
     env:
       TF_VAR_firebase_api_key: ${{ secrets.REACT_APP_FIREBASE_API_KEY }}
       TF_VAR_firebase_auth_domain: ${{ secrets.REACT_APP_FIREBASE_AUTH_DOMAIN }}
       # ... all 7 secrets
     run: |
       cd infrastructure
       echo "firebase_api_key = \"$TF_VAR_firebase_api_key\"" >> terraform.tfvars
   ```

#### Advantages ✅
- Manual secrets stay in control
- Works with existing Firebase setup
- No state file contains secrets (they stay in secrets manager)
- Simpler for existing infrastructure

#### Disadvantages ⚠️
- Multiple sources of truth (GitHub Secrets + Firebase)
- Manual credential management
- Must keep Terraform vars and GitHub Secrets in sync
- Hard to rotate credentials

---

### **Strategy 3: Hybrid (BEST FOR PRODUCTION) 🏢**

**Terraform manages infrastructure, GitHub Secrets injects credentials**

#### How It Works

1. **Terraform provisions Firebase infrastructure** (APIs, database, storage)
   - NO hardcoded credentials in Terraform
   - NO sensitive data in code

2. **GitHub Secrets manages credentials**
   - 7 values stored securely
   - Injected at runtime

3. **Credentials flow:**
   ```
   GitHub Secrets 
       ↓
   Environment Variables (GitHub Actions)
       ↓
   React App (via .env or process.env)
   ```

4. **Implementation:**
   - Modify `firebase.tf` to NOT output credentials
   - Keep `firebaseConfig` in GitHub Secrets only
   - GitHub Actions injects them into React build

#### Advantages ✅
- Infrastructure as code (reproducible)
- Credentials never in code or state file
- Secure credential management (GitHub Secrets)
- Easy credential rotation
- Best for production deployments

#### Disadvantages ⚠️
- Need to manage credentials separately from infrastructure
- Manual setup of GitHub Secrets

---

## Recommended Path Forward

### **For You: Strategy 1 (Terraform-First)**

Since you're setting up infrastructure from scratch:

1. **Delete hardcoded secrets from GitHub Secrets** (if they exist)
2. **Deploy Firebase via Terraform:**
   ```bash
   cd infrastructure
   terraform apply -var-file=terraform.tfvars -auto-approve
   ```
3. **Get credentials:**
   ```bash
   terraform output firebase_config
   ```
4. **Add to GitHub Secrets** - Copy the 7 values
5. **Update GitHub Actions** to use secrets in React build

### **Why?**
- ✅ Single source of truth
- ✅ Reproducible infrastructure
- ✅ Easy to rotate credentials
- ✅ Future-proof

---

## Implementation Steps

### Step 1: Secure Terraform State

First, ensure Terraform state is protected. Update `infrastructure/providers.tf`:

```hcl
terraform {
  backend "gcs" {
    bucket = "timerapp-2997d-tf-state"
    prefix = "prod"
  }
}
```

This stores state in GCS with encryption at rest.

### Step 2: Update GitHub Actions Workflow

Add build step that uses secrets:

```yaml
  build:
    runs-on: ubuntu-latest
    needs: terraform
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Build React App
        working-directory: ./
        env:
          REACT_APP_FIREBASE_API_KEY: ${{ secrets.REACT_APP_FIREBASE_API_KEY }}
          REACT_APP_FIREBASE_AUTH_DOMAIN: ${{ secrets.REACT_APP_FIREBASE_AUTH_DOMAIN }}
          REACT_APP_FIREBASE_DATABASE_URL: ${{ secrets.REACT_APP_FIREBASE_DATABASE_URL }}
          REACT_APP_FIREBASE_PROJECT_ID: ${{ secrets.REACT_APP_FIREBASE_PROJECT_ID }}
          REACT_APP_FIREBASE_STORAGE_BUCKET: ${{ secrets.REACT_APP_FIREBASE_STORAGE_BUCKET }}
          REACT_APP_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.REACT_APP_FIREBASE_MESSAGING_SENDER_ID }}
          REACT_APP_FIREBASE_APP_ID: ${{ secrets.REACT_APP_FIREBASE_APP_ID }}
        run: |
          npm install
          npm run build
```

### Step 3: After Terraform Apply

```bash
# Get credentials
terraform output firebase_config

# Copy output values to GitHub Settings → Secrets → New Secret
# Name: REACT_APP_FIREBASE_API_KEY
# Value: <copy from output>
# Repeat for all 7 values
```

### Step 4: Verify Setup

```bash
# Local test
export REACT_APP_FIREBASE_API_KEY="your-value"
export REACT_APP_FIREBASE_AUTH_DOMAIN="your-value"
# ... all 7
npm start

# Should connect to Firebase without errors
```

---

## Credential Rotation

### Current Setup (GitHub Secrets)
1. Update secret in GitHub
2. Redeploy app
3. Done

### Terraform Setup (Strategy 1)
1. Change Firebase config in Firebase Console OR
2. Recreate Firebase resources: `terraform destroy && terraform apply`
3. Get new credentials: `terraform output firebase_config`
4. Update GitHub Secrets with new values
5. Redeploy app

---

## FAQ

### Q: Should I store Terraform state in Git?
**A: NO!** State files contain secrets. Use:
- Cloud Storage (GCS) - Backend
- Terraform Cloud - Remote state
- AWS S3 + DynamoDB - Lock management

### Q: Can I use the same credentials for multiple environments?
**A: NO** - Create separate Firebase projects:
- Development: `timerapp-dev`
- Staging: `timerapp-staging`
- Production: `timerapp-prod`

Each gets its own `terraform.tfvars` and GitHub Secrets.

### Q: What if I don't want Terraform to manage Firebase?
**A: Use Strategy 2 (Secrets-First)**
- Keep manual Firebase setup
- Only use Terraform for infrastructure (Cloud Functions, Pub/Sub, etc.)
- Store credentials in GitHub Secrets

### Q: How do I know if credentials are rotated?
**A: Check:**
```bash
# Get current output
terraform output firebase_config

# Compare with GitHub Secrets
# If different, update secrets and redeploy
```

---

## Comparison Table

| Aspect | Strategy 1 (Terraform-First) | Strategy 2 (Secrets-First) | Strategy 3 (Hybrid) |
|--------|------------------------------|--------------------------|-------------------|
| Infrastructure as Code | ✅ Full | ✅ Partial | ✅ Full |
| Credential Management | Terraform | GitHub Secrets | GitHub Secrets |
| Single Source of Truth | ✅ Yes | ❌ No | ✅ Yes (code only) |
| State File Security | ⚠️ Must secure | ✅ No secrets | ✅ No secrets |
| Credential Rotation | 🔄 Via Terraform | 🔄 Manual | 🔄 Manual |
| Reproducibility | ✅ Full | ✅ Partial | ✅ Full |
| Setup Complexity | Medium | Low | Medium |
| Best For | New Setup | Existing Setup | Production |

---

## Next Steps

**Choose your strategy above, then:**

1. ✅ Keep current GitHub Secrets? → Strategy 2
2. ❌ Remove current secrets and use Terraform? → Strategy 1
3. 🏢 Secure production setup? → Strategy 3

**Which one would you like to implement?**
