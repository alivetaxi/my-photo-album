import io

from google.cloud import storage, firestore
from PIL import Image
from cloudevents.http import CloudEvent
import functions_framework

db = firestore.Client()
storage_client = storage.Client()

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
        img.thumbnail((512, 512))

        out = io.BytesIO()
        img.save(out, format="WEBP")

        thumb_path = f"albums/thumb/{photo_id}.webp"
        bucket.blob(thumb_path).upload_from_string(
            out.getvalue(),
            content_type="image/webp"
        )

        photo_ref.update({
            "thumb": {
                "gcsPath": thumb_path
            },
            "status": "READY"
        })

    except Exception as e:
        photo_ref.update({
            "status": "FAILED",
            "lastError": str(e)
        })
