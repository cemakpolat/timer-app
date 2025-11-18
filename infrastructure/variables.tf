variable "project_id" {
  description = "GCP project id"
  type = string
}

variable "region" {
  description = "GCP region"
  type = string
  default = "us-central1"
}

variable "function_zip_path" {
  description = "Local path to the function zip that will be uploaded (set by CI)"
  type = string
}

variable "function_object_name" {
  description = "GCS object name for the uploaded function zip"
  type = string
  default = "functions/cleanup.zip"
}

variable "artifact_bucket_name" {
  description = "Name of the artifacts bucket (optional). If empty, Terraform will create one based on project id."
  type = string
  default = ""
}

variable "existing_service_account_email" {
  description = "If set, Terraform will use this existing service account instead of creating one (e.g. ci-deployer@project.iam.gserviceaccount.com)."
  type        = string
  default     = ""
}

variable "manage_project_iam" {
  description = "If false, Terraform will NOT manage project-level IAM bindings. Useful when your account lacks setIamPolicy permissions; the project owner can add roles manually."
  type        = bool
  default     = true
}

variable "manage_cloud_function" {
  description = "If false, Terraform will NOT create the Cloud Function. Useful when your account lacks cloudfunctions.functions.create permission; owner can deploy the function separately."
  type        = bool
  default     = true
}

variable "github_repo_owner" {
  description = "GitHub repository owner (your GitHub username or organization)"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name in the format 'owner/repo' (e.g., 'cemakpolat/timer-app')"
  type        = string
}

