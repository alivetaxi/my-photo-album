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

  # 建議開 versioning，避免 source 被誤覆蓋
  versioning {
    enabled = true
  }
}
