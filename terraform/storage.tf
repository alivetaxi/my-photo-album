resource "google_storage_bucket" "photos" {
  name          = var.photo_bucket_name
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = false
  }

  cors {
    origin          = var.cors_origins
    method          = ["GET", "PUT", "POST", "HEAD"]
    response_header = ["Content-Type", "x-goog-resumable"]
    max_age_seconds = 3600
  }
}
