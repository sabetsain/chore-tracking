import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Member

import bcrypt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_scheme = HTTPBearer(auto_error=False)


def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    try:
        return bcrypt.checkpw(plain_pin.encode("utf-8"), hashed_pin.encode("utf-8"))
    except Exception:
        return False


def get_pin_hash(pin: str) -> str:
    # Ensure pin is encoded and hashed with standard bcrypt
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pin.encode("utf-8"), salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def generate_invite_code(length: int = 6) -> str:
    # 6-char uppercase alphanumeric without confusing chars (0, O, 1, I)
    alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    return "".join(secrets.choice(alphabet) for _ in range(length))


async def get_current_member(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> Member:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    member_id_str: Optional[str] = payload.get("sub")
    if not member_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        member_id = uuid.UUID(member_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid member ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    stmt = select(Member).where(Member.id == member_id)
    result = await db.execute(stmt)
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Member not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return member


async def require_admin(
    current_member: Member = Depends(get_current_member),
) -> Member:
    if current_member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_member
