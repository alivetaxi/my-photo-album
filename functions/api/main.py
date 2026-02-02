from albums import list_albums, create_album, delete_album
from photos import (
    list_photos,
    create_photo,
    update_photo,
    delete_photo,
    get_upload_url,
    retry_thumbnail
)
from users import get_me

def main(request):
    """
    Single HTTP entry point for all API routes.
    """
    path = request.path
    method = request.method

    # -------- Users --------

    if path == "/me" and method == "GET":
        return get_me(request)

    # -------- Albums --------

    if path == "/albums" and method == "GET":
        return list_albums(request)

    if path == "/albums" and method == "POST":
        return create_album(request)

    if path.startswith("/albums/") and path.count("/") == 2:
        album_id = path.split("/")[2]

        if method == "DELETE":
            return delete_album(request, album_id)

    if path.startswith("/albums/") and path.endswith("/photos"):
        album_id = path.split("/")[2]

        if method == "GET":
            return list_photos(request, album_id)

    # -------- Photos --------

    if path == "/photos" and method == "POST":
        return create_photo(request)

    if path == "/photos/upload-url" and method == "POST":
        return get_upload_url(request)

    if path.startswith("/photos/") and path.count("/") == 2:
        photo_id = path.split("/")[2]

        if method == "PATCH":
            return update_photo(request, photo_id)

        if method == "DELETE":
            return delete_photo(request, photo_id)

    if path.startswith("/photos/") and path.endswith("/retry-thumbnail"):
        photo_id = path.split("/")[2]

        if method == "POST":
            return retry_thumbnail(request, photo_id)

    # -------- Fallback --------

    return ("Not Found", 404)
