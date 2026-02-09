from google.cloud import firestore
from auth import get_auth_context, require_admin
from errors import unauthorized, forbidden

db = firestore.Client()

def list_albums(request):
    ctx = get_auth_context(request)

    query = db.collection("albums")
    if ctx.role not in ("ADMIN", "FAMILY"):
        query = query.where("isPublic", "==", True)

    album_docs = list(query.stream())
    result = []

    for doc in album_docs:
        album = doc.to_dict()
        album_id = doc.id

        # Count photos in album
        try:
            count_query = (
                db.collection("photos")
                .where("albumId", "==", album_id)
                .count()
            )
            count_result = count_query.get()
            photo_count = count_result[0]["count"]
        except Exception as e:
            print(f"Failed to count photos for album {album_id}: {e}")
            photo_count = 0

        # Get one photo for cover thumbnail
        cover_thumb = None
        photo_docs = (
            db.collection("photos")
            .where("albumId", "==", album_id)
            .limit(1)
            .stream()
        )

        for p in photo_docs:
            cover_thumb = p.to_dict().get("thumbnailPath")
            break

        result.append(
            {
                "id": album_id,
                **album,
                "photoCount": photo_count,
                "coverThumbPath": cover_thumb,
            }
        )

    return result, 200


def create_album(request):
    ctx = get_auth_context(request)
    if not ctx.uid:
        return unauthorized()
    if not require_admin(ctx):
        return forbidden()

    data = request.get_json()
    ref = db.collection("albums").document()
    ref.set({
        "title": data["title"],
        "isPublic": data["isPublic"],
        "createdAt": firestore.SERVER_TIMESTAMP
    })
    return {"id": ref.id}, 201


def delete_album(request, album_id):
    ctx = get_auth_context(request)
    if not ctx.uid:
        return unauthorized()
    if not require_admin(ctx):
        return forbidden()

    photos = db.collection("photos").where("albumId", "==", album_id).limit(1).get()
    if photos:
        return {"message": "Album is not empty"}, 409

    db.collection("albums").document(album_id).delete()
    return "", 204
