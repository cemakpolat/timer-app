# Pub/Sub topic used to trigger the cleanup function
resource "google_pubsub_topic" "cleanup_topic" {
  name = "cleanup-topic"
}

# Cloud Function triggered by Pub/Sub (v1)
# Note: Deployment via terraform is limited. Recommend deploying via Firebase CLI in CI/CD
# For development: firebase deploy --only functions
resource "google_cloudfunctions_function" "cleanup_function" {
  count = var.manage_cloud_function ? 1 : 0
  name        = "scheduledRoomCleanup"
  description = "Scheduled cleanup for Timer App"
  # Node.js 20 is the latest supported runtime for 1st-gen Cloud Functions
  runtime     = "nodejs20"
  entry_point = "scheduledRoomCleanup"
  region      = var.region

  # Deploy function from local source directory
  source_directory = "${path.module}/../functions"

  event_trigger {
    event_type = "providers/cloud.pubsub/eventTypes/topic.publish"
    resource   = google_pubsub_topic.cleanup_topic.id
  }

  # Use terraform service account for execution
  service_account_email = var.existing_service_account_email != "" ? var.existing_service_account_email : (length(google_service_account.ci_deployer) > 0 ? google_service_account.ci_deployer[0].email : "")
  
  # Allow terraform to update without recreating
  lifecycle {
    ignore_changes = [source_archive_object]
  }
}

# Create a Cloud Scheduler job to publish to the Pub/Sub topic every 15 minutes
resource "google_cloud_scheduler_job" "cleanup_scheduler" {
  name        = "cleanup-scheduler"
  description = "Trigger cleanup-topic every 15 minutes"
  schedule    = "*/15 * * * *"
  time_zone   = "UTC"

  pubsub_target {
    topic_name = google_pubsub_topic.cleanup_topic.id
    data       = base64encode("{}")
  }
}
