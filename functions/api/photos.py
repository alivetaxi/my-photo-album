import os
from datetime import timedelta
from google.cloud import firestore, storage
from auth import get_auth_context, require_admin, require_family_or_admin
from errors import unauthorized, forbidden
from utils import encode_cursor, decode_cursor

db = firestore.Client()
storage_client = storage.Client()

VALID_MEDIA_TYPES = {"IMAGE", "LIVE_PHOTO", "VIDEO"}
VALID_FILE_TYPES = {"IMAGE", "VIDEO"}
PHOTO_BUCKET = os.environ.get("PHOTO_BUCKET")

def list_photos(request, album_id):
    ctx = get_auth_context(request)

    album = db.collection("albums").document(album_id).get()
    if not album.exists:
        return [], 200

    if not album.to_dict()["isPublic"]:
        if not ctx.uid:
            return unauthorized()
        if not require_family_or_admin(ctx):
            return forbidden()

    limit = int(request.args.get("limit", 50))
    cursor = request.args.get("cursor")

    query = db.collection("photos") \
        .where("albumId", "==", album_id) \
        .order_by("createdAt") \
        .limit(limit)

    if cursor:
        doc = db.collection("photos").document(decode_cursor(cursor)).get()
        query = query.start_after(doc)

    docs = query.get()
    items = []
    for d in docs:
        data = d.to_dict()
        items.append({
            "id": d.id,
            "albumId": data["albumId"],
            "mediaType": data["mediaType"],
            "files": data["files"],
            "thumbUrl": data.get("thumbUrl"),
            "description": data.get("description"),
            "status": data["status"],
            "createdAt": data["createdAt"]
        })
    next_cursor = encode_cursor(docs[-1]) if len(docs) == limit else None

    return {
        "items": items,
        "nextCursor": next_cursor
    }, 200


def create_photo(request):
    ctx = get_auth_context(request)
    if not ctx.uid:
        return unauthorized()
    if not require_admin(ctx):
        return forbidden()

    body = request.get_json(silent=True) or {}

    album_id = body.get("albumId")
    media_type = body.get("mediaType")
    files = body.get("files", [])
    description = body.get("description")

    # --- 基本驗證 ---
    if not album_id or not media_type or not files:
        return {"message": "albumId, mediaType and files are required"}, 400

    if media_type not in VALID_MEDIA_TYPES:
        return {"message": "Invalid mediaType"}, 400

    for f in files:
        if f.get("type") not in VALID_FILE_TYPES:
            return {"message": "Invalid file type"}, 400
        if not f.get("md5") or not f.get("gcsPath"):
            return {"message": "Each file must have md5 and gcsPath"}, 400

    # --- mediaType 對 files 的語意檢查（v1 最小） ---
    image_files = [f for f in files if f["type"] == "IMAGE"]
    video_files = [f for f in files if f["type"] == "VIDEO"]

    if media_type == "IMAGE" and len(image_files) != 1:
        return {"message": "IMAGE must have exactly one IMAGE file"}, 400

    if media_type == "VIDEO" and len(video_files) != 1:
        return {"message": "VIDEO must have exactly one VIDEO file"}, 400

    if media_type == "LIVE_PHOTO":
        if len(image_files) != 1 or len(video_files) != 1:
            return {"message": "LIVE_PHOTO must have 1 IMAGE and 1 VIDEO"}, 400

    ref = db.collection("photos").document()
    ref.set({
        "albumId": album_id,
        "mediaType": media_type,
        "files": files,
        "description": description,
        "status": "UPLOADED",
        "createdAt": firestore.SERVER_TIMESTAMP,
        "updatedAt": firestore.SERVER_TIMESTAMP
    })

    return {"id": ref.id}, 201


def update_photo(request, photo_id):
    ctx = get_auth_context(request)
    if not ctx.uid:
        return unauthorized()
    if not require_admin(ctx):
        return forbidden()

    data = request.get_json()
    db.collection("photos").document(photo_id).update({
        "description": data.get("description"),
        "updatedAt": firestore.SERVER_TIMESTAMP
    })
    return "", 200


def delete_photo(request, photo_id):
    ctx = get_auth_context(request)
    if not ctx.uid:
        return unauthorized()
    if not require_admin(ctx):
        return forbidden()

    db.collection("photos").document(photo_id).delete()
    return "", 204


def get_upload_url(request):
    ctx = get_auth_context(request)

    if not ctx.uid:
        return unauthorized()
    if not require_admin(ctx):
        return forbidden()

    body = request.get_json(silent=True) or {}
    sha256 = body.get("sha256")
    content_type = body.get("contentType")

    if not sha256 or not content_type:
        return {"message": "sha256 and contentType are required"}, 400

    # 使用 sha256 作為檔名（去重）
    object_path = f"albums/originals/{sha256}"

    bucket = storage_client.bucket(PHOTO_BUCKET)
    blob = bucket.blob(object_path)

    upload_url = blob.generate_signed_url(
        version="v4",
        expiration=timedelta(minutes=10),
        method="PUT",
        content_type=content_type
    )

    return {
        "uploadUrl": upload_url,
        "gcsPath": object_path
    }, 200


def retry_thumbnail(request, photo_id):
    ctx = get_auth_context(request)
    if not ctx.uid:
        return unauthorized()
    if not require_admin(ctx):
        return forbidden()

    ref = db.collection("photos").document(photo_id)
    snap = ref.get()

    if not snap.exists:
        return {"message": "Photo not found"}, 404

    photo = snap.to_dict()

    # 只允許 FAILED 狀態
    if photo.get("status") != "FAILED":
        return {"message": "Photo is not in FAILED state"}, 409

    # VIDEO 不需要 thumbnail
    if photo.get("mediaType") == "VIDEO":
        ref.update({"status": "READY"})
        return {"message": "Video does not require thumbnail"}, 200

    # 找 IMAGE 檔案
    image_files = [f for f in photo.get("files", []) if f["type"] == "IMAGE"]
    if not image_files:
        return {"message": "No IMAGE file found"}, 400

    image_path = image_files[0]["gcsPath"]

    bucket = storage_client.bucket(PHOTO_BUCKET)
    blob = bucket.blob(image_path)

    if not blob.exists():
        return {"message": "Original image not found in storage"}, 404

    # 狀態先改回 UPLOADED
    ref.update({
        "status": "UPLOADED",
        "lastError": firestore.DELETE_FIELD
    })

    # 重新觸發 finalized event（rewrite 自己）
    blob.rewrite(blob)

    return {"message": "Retry triggered"}, 202
