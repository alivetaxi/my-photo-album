from google.cloud import storage, firestore
from PIL import Image
import io
from cloudevents.http import CloudEvent

db = firestore.Client()
storage_client = storage.Client()


def generate_thumbnail(cloud_event: CloudEvent):
    data = cloud_event.data

    object_path = data["name"]
    bucket_name = data["bucket"]

    # 只處理 original IMAGE 檔
    if not object_path.startswith("albums/originals/"):
        return

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(object_path)

    # 找出對應的 photo
    photos = db.collection("photos") \
        .where("files", "array_contains_any", [
            {"gcsPath": object_path}
        ]) \
        .limit(1) \
        .get()

    if not photos:
        return

    photo_ref = photos[0].reference
    photo = photos[0].to_dict()

    # 只有 IMAGE / LIVE_PHOTO 需要 thumbnail
    if photo["mediaType"] == "VIDEO":
        photo_ref.update({"status": "READY"})
        return

    try:
        image_bytes = blob.download_as_bytes()
        img = Image.open(io.BytesIO(image_bytes))
        img.thumbnail((512, 512))

        out = io.BytesIO()
        img.save(out, format="WEBP")

        thumb_path = object_path.replace("originals", "thumb")
        bucket.blob(thumb_path).upload_from_string(
            out.getvalue(),
            content_type="image/webp"
        )

        photo_ref.update({
            "thumbUrl": thumb_path,
            "status": "READY"
        })

    except Exception as e:
        photo_ref.update({
            "status": "FAILED",
            "lastError": str(e)
        })
