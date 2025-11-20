# Enable required Google APIs
resource "google_project_service" "cloudfunctions" {
  service = "cloudfunctions.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "cloudscheduler" {
  service = "cloudscheduler.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "pubsub" {
  service = "pubsub.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "storage" {
  service = "storage.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "iam" {
  service = "iam.googleapis.com"
  project = var.project_id
}

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

resource "google_project_service" "run" {
  service = "run.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "cloudbuild" {
  service = "cloudbuild.googleapis.com"
  project = var.project_id
}

resource "google_project_service" "identity_toolkit" {
  service = "identitytoolkit.googleapis.com"
  project = var.project_id
}

