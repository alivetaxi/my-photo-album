from auth import get_auth_context

def get_me(request):
    auth_context = get_auth_context(request)
    return {
        "uid": auth_context.uid,
        "email": auth_context.email,
        "role": auth_context.role
    }, 200
