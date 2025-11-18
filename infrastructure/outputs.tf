output "artifact_bucket" {
  description = "Artifact bucket name"
  value       = google_storage_bucket.artifact_bucket.name
}

output "cleanup_topic" {
  description = "Pub/Sub topic name"
  value       = google_pubsub_topic.cleanup_topic.name
}

output "cleanup_function_name" {
  description = "Cloud Function resource name"
  value       = var.manage_cloud_function ? google_cloudfunctions_function.cleanup_function[0].name : "N/A"
}

# Firebase Outputs
output "firebase_config" {
  description = "Firebase configuration for web application (React app environment variables)"
  value       = var.enable_firebase ? google_firebase_web_app.default[*].app_id : null
  sensitive   = false
}

output "firebase_database_url" {
  description = "Firebase Realtime Database URL"
  value       = var.enable_firebase ? "https://${google_firebase_database_instance.default[0].instance_id}.firebaseio.com" : null
}

output "firebase_storage_bucket" {
  description = "Firebase Cloud Storage bucket name"
  value       = var.enable_firebase ? google_storage_bucket.firebase_storage[0].name : null
}
