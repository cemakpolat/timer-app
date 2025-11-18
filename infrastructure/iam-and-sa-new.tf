# IAM and Service Account Roles
# This grants the necessary permissions to the service account used for CI/CD

# Grant Cloud Functions Admin role
resource "google_project_iam_member" "ci_cloud_functions_admin" {
  project = var.project_id
  role    = "roles/cloudfunctions.admin"
  member  = "serviceAccount:${local.ci_sa_email}"
}

# Grant Storage Admin role (for artifact bucket)
resource "google_project_iam_member" "ci_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${local.ci_sa_email}"
}

# Grant Pub/Sub Admin role
resource "google_project_iam_member" "ci_pubsub_admin" {
  project = var.project_id
  role    = "roles/pubsub.admin"
  member  = "serviceAccount:${local.ci_sa_email}"
}

# Grant Cloud Scheduler Admin role
resource "google_project_iam_member" "ci_cloudscheduler_admin" {
  project = var.project_id
  role    = "roles/cloudscheduler.admin"
  member  = "serviceAccount:${local.ci_sa_email}"
}

# Grant Service Account User role (to impersonate the function's runtime SA)
resource "google_project_iam_member" "ci_service_account_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${local.ci_sa_email}"
}

# Grant Compute Admin role (for Cloud Functions deployments)
resource "google_project_iam_member" "ci_compute_admin" {
  project = var.project_id
  role    = "roles/compute.admin"
  member  = "serviceAccount:${local.ci_sa_email}"
}

# Create a service account for the Cloud Function's runtime
resource "google_service_account" "function_runtime" {
  account_id   = "timer-app-function"
  display_name = "Timer App Function Runtime SA"
  description  = "Service account used as runtime identity for Cloud Functions"
}

# Grant minimal roles to the function runtime service account
resource "google_project_iam_member" "function_pubsub_subscriber" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:${google_service_account.function_runtime.email}"
}

resource "google_project_iam_member" "function_storage_object_viewer" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.function_runtime.email}"
}

output "function_runtime_service_account" {
  description = "Email of the service account used for Cloud Function runtime"
  value       = google_service_account.function_runtime.email
}
