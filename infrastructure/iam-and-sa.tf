/*
If you don't have permission to create service accounts (iam.serviceAccounts.create),
set variable `existing_service_account_email` to the email of a pre-created service account
(for example: ci-deployer@PROJECT.iam.gserviceaccount.com). Terraform will then reuse that
service account instead of creating one.
*/

# Optionally create the service account only when an existing email is NOT provided.
resource "google_service_account" "ci_deployer" {
  count        = var.existing_service_account_email == "" ? 1 : 0
  account_id   = "ci-deployer"
  display_name = "CI Deployer (Terraform/GitHub Actions)"
}

locals {
  # Prefer the explicitly-provided existing SA email, otherwise use the created SA's email.
  sa_email = var.existing_service_account_email != "" ? var.existing_service_account_email : (length(google_service_account.ci_deployer) > 0 ? google_service_account.ci_deployer[0].email : "")
}

# Grant minimal roles to the service account. Review and restrict to least privilege.
resource "google_project_iam_member" "sa_cloud_functions" {
  count   = var.manage_project_iam ? 1 : 0
  project = var.project_id
  role    = "roles/cloudfunctions.admin"
  member  = "serviceAccount:${local.sa_email}"
}

resource "google_project_iam_member" "sa_storage_admin" {
  count   = var.manage_project_iam ? 1 : 0
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${local.sa_email}"
}

resource "google_project_iam_member" "sa_pubsub_admin" {
  count   = var.manage_project_iam ? 1 : 0
  project = var.project_id
  role    = "roles/pubsub.admin"
  member  = "serviceAccount:${local.sa_email}"
}

resource "google_project_iam_member" "sa_scheduler_admin" {
  count   = var.manage_project_iam ? 1 : 0
  project = var.project_id
  role    = "roles/cloudscheduler.admin"
  member  = "serviceAccount:${local.sa_email}"
}

# Allow the SA to be used as function runtime identity
resource "google_project_iam_member" "sa_iam_serviceAccountUser" {
  count   = var.manage_project_iam ? 1 : 0
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${local.sa_email}"
}
