# Firebase Configuration via Terraform
# This module provisions Firebase services including Realtime Database, Storage, and Authentication
# Note: Required providers are defined in providers.tf
# Note: Service enablement is defined in services.tf

# Create Firebase App (Web)
resource "google_firebase_web_app" "default" {
  provider            = google-beta
  count               = var.enable_firebase ? 1 : 0
  project             = var.project_id
  display_name        = "Timer App Web"
  deletion_policy     = "DELETE"
  depends_on          = [google_project_service.firebase]
}

# Get Firebase Web App Config
data "google_firebase_web_app_config" "default" {
  provider   = google-beta
  count      = var.enable_firebase ? 1 : 0
  web_app_id = google_firebase_web_app.default[0].app_id
  project    = var.project_id
  depends_on = [google_firebase_web_app.default]
}

# Note: Firebase creates a default Realtime Database instance automatically
# Instance ID format: {project_id}-default-rtdb
# We reference it by constructing the URL directly instead of creating a new instance

# Create Cloud Storage Bucket for Firebase
# Note: If this bucket already exists, you can import it:
# terraform import google_storage_bucket.firebase_storage[0] timerapp-2997d-firebase-storage
resource "google_storage_bucket" "firebase_storage" {
  count                     = var.enable_firebase ? 1 : 0
  project                   = var.project_id
  name                      = "${var.project_id}-firebase-storage"
  location                  = var.firebase_region
  force_destroy             = false
  uniform_bucket_level_access = true
  # Uncomment the line below if the bucket already exists and you want to skip recreation
  # lifecycle {
  #   ignore_changes = all
  # }
  depends_on                = [google_project_service.firebase_storage]
}

# Note: Firebase Database Rules should be deployed manually or via Firebase CLI
# Rules file: infrastructure/database-rules.json
# Deploy with: firebase deploy --only database:rules



# Output Firebase Config (for use in app) - SENSITIVE: Will not display in terraform output
output "firebase_config" {
  description = "Firebase configuration for web app - DO NOT PRINT THIS IN LOGS"
  value = var.enable_firebase ? {
    apiKey            = data.google_firebase_web_app_config.default[0].api_key
    authDomain        = data.google_firebase_web_app_config.default[0].auth_domain
    projectId         = var.project_id
    databaseURL       = "https://${var.project_id}-default-rtdb.firebaseio.com"
    storageBucket     = google_storage_bucket.firebase_storage[0].name
    messagingSenderId = data.google_firebase_web_app_config.default[0].messaging_sender_id
    appId             = google_firebase_web_app.default[0].app_id
  } : null
  sensitive = true
}

# Individual outputs for GitHub Actions
# Note: These are NOT secrets - they're public config values that go in client-side code
# Firebase security is enforced via Security Rules, not by hiding these values
output "firebase_api_key" {
  description = "Firebase API Key (public - used in client-side code)"
  value       = var.enable_firebase ? data.google_firebase_web_app_config.default[0].api_key : ""
  sensitive   = false
}

output "firebase_auth_domain" {
  description = "Firebase Auth Domain (public - used in client-side code)"
  value       = var.enable_firebase ? data.google_firebase_web_app_config.default[0].auth_domain : ""
  sensitive   = false
}

output "firebase_database_url" {
  description = "Firebase Database URL (public - used in client-side code)"
  value       = var.enable_firebase ? "https://${var.project_id}-default-rtdb.firebaseio.com" : ""
  sensitive   = false
}

output "firebase_project_id" {
  description = "Firebase Project ID (public - used in client-side code)"
  value       = var.enable_firebase ? var.project_id : ""
  sensitive   = false
}

output "firebase_storage_bucket" {
  description = "Firebase Storage Bucket (public - used in client-side code)"
  value       = var.enable_firebase ? google_storage_bucket.firebase_storage[0].name : ""
  sensitive   = false
}

output "firebase_messaging_sender_id" {
  description = "Firebase Messaging Sender ID (public - used in client-side code)"
  value       = var.enable_firebase ? data.google_firebase_web_app_config.default[0].messaging_sender_id : ""
  sensitive   = false
}

output "firebase_app_id" {
  description = "Firebase App ID (public - used in client-side code)"
  value       = var.enable_firebase ? google_firebase_web_app.default[0].app_id : ""
  sensitive   = false
}

output "firebase_web_app_id" {
  description = "Firebase Web App ID"
  value       = var.enable_firebase ? google_firebase_web_app.default[0].app_id : null
}
