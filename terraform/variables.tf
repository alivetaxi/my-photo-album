variable "project_id" {
  description = "GCP project ID"
}
variable "region" {
  description = "GCP region for resources"
}

variable "photo_bucket_name" {
  description = "Bucket for photos and videos"
}

variable "thumbnail_bucket_name" {
  description = "Bucket for thumbnails"
}

variable "cors_origins" {
  type        = list(string)
  description = "Allowed CORS origins for photo bucket"
}
