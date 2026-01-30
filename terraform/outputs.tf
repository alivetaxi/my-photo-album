output "photo_bucket" {
  value = google_storage_bucket.photos.name
}

output "api_function_name" {
  value = google_cloudfunctions2_function.api.name
}
