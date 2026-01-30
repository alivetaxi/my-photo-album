resource "google_project_service" "apis" {
  for_each = toset([
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "firestore.googleapis.com",
    "storage.googleapis.com",
    "eventarc.googleapis.com",
    "iam.googleapis.com"
  ])

  service = each.value
}
