import base64

def encode_cursor(doc_snapshot):
    return base64.b64encode(doc_snapshot.id.encode()).decode()

def decode_cursor(cursor: str):
    return base64.b64decode(cursor).decode()
