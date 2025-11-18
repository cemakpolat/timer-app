# Enable required Google APIs
resource "google_project_service" "cloudfunctions" {
  service = "cloudfunctions.googleapis.com"
}
resource "google_project_service" "cloudscheduler" {
  service = "cloudscheduler.googleapis.com"
}
resource "google_project_service" "pubsub" {
  service = "pubsub.googleapis.com"
}
resource "google_project_service" "storage" {
  service = "storage.googleapis.com"
}
resource "google_project_service" "iam" {
  service = "iam.googleapis.com"
}
resource "google_project_service" "firebase" {
  service = "firebase.googleapis.com"
}
resource "google_project_service" "run" {
  service = "run.googleapis.com"
}
resource "google_project_service" "cloudbuild" {
  service = "cloudbuild.googleapis.com"
}
