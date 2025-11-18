# Pub/Sub topic used to trigger the cleanup function
resource "google_pubsub_topic" "cleanup_topic" {
  name = "cleanup-topic"
}

# Cloud Function triggered by Pub/Sub (v1)
# NOTE: Cloud Functions are deployed via Firebase CLI in CI/CD, not via Terraform
# Terraform creates the trigger infrastructure (Pub/Sub topic, Scheduler job)
# But function code deployment should be done via: firebase deploy --only functions
# This is because Terraform v1 gen functions have limited deployment options

# Create Cloud Scheduler job to trigger cleanup via Pub/Sub
# The actual function code is deployed via Firebase CLI in deploy.yml

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
