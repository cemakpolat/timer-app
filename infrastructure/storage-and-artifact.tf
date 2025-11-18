# Storage bucket for function artifacts
resource "google_storage_bucket" "artifact_bucket" {
  name     = length(var.artifact_bucket_name) > 0 ? var.artifact_bucket_name : "${var.project_id}-artifacts"
  location = var.region
  uniform_bucket_level_access = true
  force_destroy = true
}

# Upload local zip (CI must create the zip at var.function_zip_path before terraform runs)
resource "google_storage_bucket_object" "function_zip" {
  name   = var.function_object_name
  bucket = google_storage_bucket.artifact_bucket.name
  source = var.function_zip_path
}
