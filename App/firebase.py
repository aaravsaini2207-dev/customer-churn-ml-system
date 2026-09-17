import firebase_admin
from firebase_admin import credentials

cred = credentials.Certificate("App/firebase-service-account.json")

app = firebase_admin.initialize_app(cred)