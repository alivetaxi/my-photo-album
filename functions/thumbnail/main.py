import io
import os
from datetime import datetime

from google.cloud import storage, firestore
from PIL import Image
from PIL.ExifTags import TAGS
from cloudevents.http import CloudEvent
import functions_framework

db = firestore.Client()
storage_client = storage.Client()

THUMB_BUCKET = os.environ["THUMBNAIL_BUCKET"]

@functions_framework.cloud_event
def generate_thumbnail(cloud_event: CloudEvent):
    print(cloud_event)
    data = cloud_event.data

    object_path = data["name"]
    bucket_name = data["bucket"]

    # 只處理 original IMAGE 檔（albums/originals/{photoId}/image）
    if not object_path.startswith("albums/originals/") or not object_path.endswith("/image"):
        return

    photo_id = object_path.split("/")[-2]

    photo_ref = db.collection("photos").document(photo_id)
    snap = photo_ref.get()

    if not snap.exists:
        return

    photo = snap.to_dict()

    # 只有 IMAGE / LIVE_PHOTO 需要 thumbnail
    if photo["mediaType"] == "VIDEO":
        photo_ref.update({"status": "READY"})
        return

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(object_path)

    try:
        image_bytes = blob.download_as_bytes()
        img = Image.open(io.BytesIO(image_bytes))
        img.load()  # ensure image is fully loaded

        taken_at = parse_exif_date(img)

        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")
        elif img.mode == "RGBA":
            img = img.convert("RGB")

        img.thumbnail((512, 512))

        out = io.BytesIO()
        img.save(out, format="WEBP")
        out.seek(0)

        thumb_path = f"albums/thumb/{photo_id}.webp"
        print(f"Uploading thumbnail to {thumb_path} in bucket {THUMB_BUCKET}")

        thumb_bucket = storage_client.bucket(THUMB_BUCKET)
        thumb_bucket.blob(thumb_path).upload_from_string(
            out.getvalue(),
            content_type="image/webp"
        )

        photo_ref.update({
            "thumb": {
                "gcsPath": thumb_path
            },
            "status": "READY",
            "takenAt": taken_at.timestamp() if taken_at else photo.get("createdAt")
        })

    except Exception as e:
        photo_ref.update({
            "status": "FAILED",
            "lastError": str(e)
        })


def parse_exif_date(img):
    try:
        exif = img.getexif()
        if not exif:
            return None

        # Build tag-name map using public EXIF interface
        exif_data = {
            TAGS.get(tag_id): value
            for tag_id, value in exif.items()
            if tag_id in TAGS
        }

        print(f"Parsed EXIF data: {exif_data}")

        raw_taken = exif_data.get("DateTimeOriginal")
        if raw_taken:
            # EXIF format: YYYY:MM:DD HH:MM:SS
            return datetime.strptime(raw_taken, "%Y:%m:%d %H:%M:%S")
    except Exception:
        print("Failed to parse EXIF data")
    return None
