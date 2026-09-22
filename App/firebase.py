import os
import json

import firebase_admin
from firebase_admin import credentials


firebase_json = os.getenv("FIREBASE_SERVICE_ACCOUNT")

if firebase_json:
    firebase_config = json.loads(firebase_json)
    cred = credentials.Certificate(firebase_config)

    if not firebase_admin._apps:
        app = firebase_admin.initialize_app(cred)
    else:
        app = firebase_admin.get_app()
else:
    app = None

