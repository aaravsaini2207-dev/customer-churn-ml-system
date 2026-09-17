from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth

from App.firebase import app

security = HTTPBearer()

def get_current_user(
          credentials: HTTPAuthorizationCredentials = Depends(security)):
  token = credentials.credentials

  try:
    decoded_token = auth.verify_id_token(token)

    if not decoded_token.get("email_verified", False):
      raise HTTPException(status_code = 403 , detail = "Please verify your email before accessing the application.")
    return decoded_token

  except HTTPException:
    raise
  
  except Exception as e:
    print("Firebase auth error:",e)
    raise HTTPException(status_code = 401 , detail = "Invalid or expired authentication token.")

