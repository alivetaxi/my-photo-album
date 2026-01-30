from google.cloud import firestore
from auth import get_auth_context, require_admin
from errors import unauthorized, forbidden

db = firestore.Client()

def list_albums(request):
    ctx = get_auth_context(request)

    query = db.collection("albums")
    if ctx.role not in ("ADMIN", "FAMILY"):
        query = query.where("isPublic", "==", True)

    albums = [doc.to_dict() | {"id": doc.id} for doc in query.stream()]
    return albums, 200


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
