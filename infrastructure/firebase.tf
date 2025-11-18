# Firebase Configuration via Terraform
# This module provisions Firebase services including Realtime Database, Storage, and Authentication

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.85.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.85.0"
    }
  }
}

# Enable Firebase API
resource "google_project_service" "firebase" {
  service = "firebase.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "firestore" {
  service = "firestore.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "firebase_database" {
  service = "firebasedatabase.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "firebase_storage" {
  service = "firebasestorage.googleapis.com"
  project = var.project_id
}

# Create Firebase App (Web)
resource "google_firebase_web_app" "default" {
  count               = var.enable_firebase ? 1 : 0
  project             = var.project_id
  display_name        = "Timer App Web"
  deletion_policy     = "DELETE"
  depends_on          = [google_project_service.firebase]
}

# Get Firebase Web App Config
data "google_firebase_web_app_config" "default" {
  count      = var.enable_firebase ? 1 : 0
  web_app_id = google_firebase_web_app.default[0].app_id
  project    = var.project_id
}

# Create Realtime Database
resource "google_firebase_database_instance" "default" {
  count               = var.enable_firebase ? 1 : 0
  project             = var.project_id
  region              = var.firebase_region
  instance_id         = "${var.project_id}-default-rtdb"
  desired_state       = "ACTIVE"
  type                = "DEFAULT_DATABASE"
  depends_on          = [google_project_service.firebase_database]
}

# Create Cloud Storage Bucket for Firebase
resource "google_storage_bucket" "firebase_storage" {
  count             = var.enable_firebase ? 1 : 0
  project           = var.project_id
  name              = "${var.project_id}.appspot.com"
  location          = var.firebase_region
  force_destroy     = false
  uniform_bucket_level_access = true
  depends_on        = [google_project_service.firebase_storage]
}

# Deploy Firebase Realtime Database Rules
resource "google_firebase_database_ruleset" "default" {
  count       = var.enable_firebase ? 1 : 0
  project     = var.project_id
  
  source {
    language = "json"
    rules    = file("${path.module}/database-rules.json")
  }
  
  depends_on = [google_firebase_database_instance.default]
}

# Release the rules to the database
resource "google_firebase_database_default_instance" "rules" {
  count           = var.enable_firebase ? 1 : 0
  project         = var.project_id
  ruleset_id      = google_firebase_database_ruleset.default[0].ruleset_id
  instance        = google_firebase_database_instance.default[0].name
  depends_on      = [google_firebase_database_ruleset.default]
}

# Output Firebase Config (for use in app) - SENSITIVE: Will not display in terraform output
output "firebase_config" {
  description = "Firebase configuration for web app - DO NOT PRINT THIS IN LOGS"
  value = var.enable_firebase ? {
    apiKey            = data.google_firebase_web_app_config.default[0].api_key
    authDomain        = data.google_firebase_web_app_config.default[0].auth_domain
    projectId         = data.google_firebase_web_app_config.default[0].project_id
    databaseURL       = "https://${google_firebase_database_instance.default[0].instance_id}.firebaseio.com"
    storageBucket     = google_storage_bucket.firebase_storage[0].name
    messagingSenderId = data.google_firebase_web_app_config.default[0].messaging_sender_id
    appId             = data.google_firebase_web_app_config.default[0].app_id
  } : null
  sensitive = true
}

# Individual outputs for GitHub Actions (all marked sensitive to hide from logs)
output "firebase_api_key" {
  description = "Firebase API Key - SENSITIVE"
  value       = var.enable_firebase ? data.google_firebase_web_app_config.default[0].api_key : null
  sensitive   = true
}

output "firebase_auth_domain" {
  description = "Firebase Auth Domain - SENSITIVE"
  value       = var.enable_firebase ? data.google_firebase_web_app_config.default[0].auth_domain : null
  sensitive   = true
}

output "firebase_database_url" {
  description = "Firebase Database URL - SENSITIVE"
  value       = var.enable_firebase ? "https://${google_firebase_database_instance.default[0].instance_id}.firebaseio.com" : null
  sensitive   = true
}

output "firebase_project_id" {
  description = "Firebase Project ID - SENSITIVE"
  value       = var.enable_firebase ? data.google_firebase_web_app_config.default[0].project_id : null
  sensitive   = true
}

output "firebase_storage_bucket" {
  description = "Firebase Storage Bucket - SENSITIVE"
  value       = var.enable_firebase ? google_storage_bucket.firebase_storage[0].name : null
  sensitive   = true
}

output "firebase_messaging_sender_id" {
  description = "Firebase Messaging Sender ID - SENSITIVE"
  value       = var.enable_firebase ? data.google_firebase_web_app_config.default[0].messaging_sender_id : null
  sensitive   = true
}

output "firebase_app_id" {
  description = "Firebase App ID - SENSITIVE"
  value       = var.enable_firebase ? data.google_firebase_web_app_config.default[0].app_id : null
  sensitive   = true
}

output "firebase_web_app_id" {
  description = "Firebase Web App ID"
  value       = var.enable_firebase ? google_firebase_web_app.default[0].app_id : null
}
