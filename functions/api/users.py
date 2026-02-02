import json
from auth import get_auth_context

def get_me(request):
    return json.dumps(get_auth_context(request)), 200
