variable "project_id" {
  description = "GCP project ID"
}
variable "region" {
  description = "GCP region for resources"
}

variable "photo_bucket_name" {
  description = "Bucket for photos, videos and thumbnails"
}
variable "function_source_bucket_name" {
  description = "Bucket for Cloud Function source code"
}

variable "enable_functions" {
  type    = bool
  default = false
}
