output "cleanup_topic" {
  description = "Pub/Sub topic name"
  value       = google_pubsub_topic.cleanup_topic.name
}

output "cleanup_scheduler_name" {
  description = "Cloud Scheduler job name"
  value       = google_cloud_scheduler_job.cleanup_scheduler.name
}

# Firebase outputs are defined in firebase.tf
# Note: Cloud Functions are deployed via Firebase CLI, not Terraform
