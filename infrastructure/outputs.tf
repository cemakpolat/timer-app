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
