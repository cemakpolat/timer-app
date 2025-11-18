# Pub/Sub topic used to trigger the cleanup function
resource "google_pubsub_topic" "cleanup_topic" {
  name = "cleanup-topic"
}

# Cloud Function triggered by Pub/Sub (v1)
resource "google_cloudfunctions_function" "cleanup_function" {
  count = var.manage_cloud_function ? 1 : 0
  name        = "scheduledRoomCleanup"
  description = "Scheduled cleanup for Timer App"
  # Node.js 20 is the latest supported runtime for 1st-gen Cloud Functions
  runtime     = "nodejs20"
  entry_point = "scheduledRoomCleanup"
  region      = var.region

  # Source uploaded to GCS by CI and referenced via google_storage_bucket_object
  source_archive_bucket = google_storage_bucket.artifact_bucket.name
  source_archive_object = google_storage_bucket_object.function_zip.name

  event_trigger {
    event_type = "providers/cloud.pubsub/eventTypes/topic.publish"
    resource   = google_pubsub_topic.cleanup_topic.id
  }

  # Choose the service account email: prefer an explicitly provided existing SA email,
  # otherwise use the created service account (if created). We guard with length() because
  # google_service_account.ci_deployer may have count = 0 when using an existing SA.
  service_account_email = var.existing_service_account_email != "" ? var.existing_service_account_email : (length(google_service_account.ci_deployer) > 0 ? google_service_account.ci_deployer[0].email : "")
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
