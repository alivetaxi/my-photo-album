resource "google_service_account" "functions" {
  account_id   = "photo-album-functions"
  display_name = "Photo Album Cloud Functions"
}

resource "google_storage_bucket_iam_member" "functions_storage" {
  bucket = google_storage_bucket.photos.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.functions.email}"
}

resource "google_project_iam_member" "functions_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.functions.email}"
}

resource "google_storage_bucket_iam_member" "functions_source_read" {
  bucket = google_storage_bucket.function_source.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${google_service_account.functions.email}"
}

data "google_project" "current" {}

resource "google_storage_bucket_iam_member" "eventarc_photo_viewer" {
  bucket = google_storage_bucket.photos.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:service-${data.google_project.current.number}@gcp-sa-eventarc.iam.gserviceaccount.com"
}

resource "google_project_iam_member" "gcs_pubsub_publisher" {
  project = data.google_project.current.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:service-${data.google_project.current.number}@gs-project-accounts.iam.gserviceaccount.com"
}
