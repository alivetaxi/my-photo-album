from firebase_admin import auth as firebase_auth
from google.cloud import firestore

db = firestore.Client()

class AuthContext:
    def __init__(self, uid=None, role="ANONYMOUS"):
        self.uid = uid
        self.role = role

def get_auth_context(request) -> AuthContext:
    auth_header = request.headers.get("Authorization")

    # 未登入
    if not auth_header or not auth_header.startswith("Bearer "):
        return AuthContext()

    token = auth_header.replace("Bearer ", "")

    try:
        decoded = firebase_auth.verify_id_token(token)
        uid = decoded["uid"]
    except Exception:
        # Token 無效 → 視為未登入
        return AuthContext()

    # 查詢角色
    user_doc = db.collection("users").document(uid).get()
    if not user_doc.exists:
        return AuthContext(uid=uid, role="GUEST")

    role = user_doc.to_dict().get("role", "GUEST")
    return AuthContext(uid=uid, role=role)


def require_login(ctx):
    return ctx.uid is not None


def require_admin(ctx):
    return ctx.role == "ADMIN"


def require_family_or_admin(ctx):
    return ctx.role in ("ADMIN", "FAMILY")
