resource "google_storage_bucket" "photos" {
  name          = var.photo_bucket_name
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = false
  }
}

resource "google_storage_bucket" "function_source" {
  name          = var.function_source_bucket_name
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }
}
