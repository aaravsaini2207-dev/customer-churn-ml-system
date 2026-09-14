from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

from sqlalchemy.orm import Session
from .database import get_db
from .models import User

import hashlib
import hmac
import secrets

from App.config import settings

router = APIRouter()

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        600_000
    )

    return f"{salt.hex()}:{password_hash.hex()}"


def verify_password(
    plain_password: str,
    stored_password: str
) -> bool:

    salt_hex, hash_hex = stored_password.split(":")

    salt = bytes.fromhex(salt_hex)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        plain_password.encode("utf-8"),
        salt,
        600_000
    )

    return hmac.compare_digest(
        password_hash.hex(),
        hash_hex
    )

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(minutes = ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode , SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme) , db: Session = Depends(get_db)):
    credintials_exception= HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},)

    try: 
        payload = jwt.decode(token , SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None:
            raise credintials_exception
    except JWTError: 
            raise credintials_exception
    
    user = db.query(User).filter(User.email == email).first()

    if user is None:
         raise credintials_exception

    return user
