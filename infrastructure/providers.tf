terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
  # Uncomment and configure a backend for remote state in production
  # backend "gcs" {
  #   bucket = "my-terraform-state-bucket"
  #   prefix = "timer-app/terraform-state"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
