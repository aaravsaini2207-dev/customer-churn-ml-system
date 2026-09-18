import os
import json

import firebase_admin
from firebase_admin import credentials


firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")

if not firebase_json:
    raise RuntimeError(
        "FIREBASE_SERVICE_ACCOUNT environment variable is not set."
    )

firebase_config = json.loads(firebase_json)

cred = credentials.Certificate(firebase_config)

app = firebase_admin.initialize_app(cred)