resource "google_cloudfunctions2_function" "api" {
  name     = "photo-album-api"
  location = var.region

  build_config {
    runtime     = "python312"
    entry_point = "main"
    source {
      storage_source {
        bucket = var.function_source_bucket_name
        object = "function_api.zip"
      }
    }
  }

  service_config {
    service_account_email = google_service_account.functions.email
    available_memory      = "512Mi"
    timeout_seconds       = 60
    environment_variables = {
      PHOTO_BUCKET = google_storage_bucket.photos.name
    }
  }
}

resource "google_cloudfunctions2_function" "thumbnail" {
  name     = "photo-thumbnail"
  location = var.region

  build_config {
    runtime     = "python312"
    entry_point = "generate_thumbnail"
    source {
      storage_source {
        bucket = var.function_source_bucket_name
        object = "function_thumbnail.zip"
      }
    }
  }

  service_config {
    service_account_email = google_service_account.functions.email
    available_memory      = "1024Mi"
    timeout_seconds       = 60
  }

  event_trigger {
    event_type = "google.cloud.storage.object.v1.finalized"
    retry_policy = "RETRY_POLICY_RETRY"

    event_filters {
      attribute = "bucket"
      value     = google_storage_bucket.photos.name
    }
  }
}

resource "google_cloudfunctions2_function_iam_member" "api_public_invoker" {
  project        = var.project_id
  cloud_function = google_cloudfunctions2_function.api.name

  role   = "roles/run.invoker"
  member = "allUsers"
}
