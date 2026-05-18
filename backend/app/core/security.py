import base64
import hashlib
import hmac
import json
import os
from datetime import UTC, datetime, timedelta
from typing import Any

from app.core.config import settings


class JWTError(Exception):
    pass


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _base64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
    return f"pbkdf2_sha256${_base64url_encode(salt)}${_base64url_encode(digest)}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        algorithm, salt_value, digest_value = hashed_password.split("$", 2)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False

    salt = _base64url_decode(salt_value)
    expected_digest = _base64url_decode(digest_value)
    actual_digest = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 120_000)
    return hmac.compare_digest(actual_digest, expected_digest)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(UTC) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    header = {"alg": settings.jwt_algorithm, "typ": "JWT"}
    payload = {"sub": subject, "exp": int(expire.timestamp())}
    signing_input = (
        f"{_base64url_encode(json.dumps(header, separators=(',', ':')).encode())}."
        f"{_base64url_encode(json.dumps(payload, separators=(',', ':')).encode())}"
    )
    signature = hmac.new(
        settings.jwt_secret_key.encode("utf-8"),
        signing_input.encode("ascii"),
        hashlib.sha256,
    ).digest()
    return f"{signing_input}.{_base64url_encode(signature)}"


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        header_value, payload_value, signature_value = token.split(".")
    except ValueError as exc:
        raise JWTError("Invalid token") from exc

    signing_input = f"{header_value}.{payload_value}"
    expected_signature = hmac.new(
        settings.jwt_secret_key.encode("utf-8"),
        signing_input.encode("ascii"),
        hashlib.sha256,
    ).digest()
    if not hmac.compare_digest(_base64url_decode(signature_value), expected_signature):
        raise JWTError("Invalid token signature")

    payload = json.loads(_base64url_decode(payload_value))
    exp = payload.get("exp")
    if not isinstance(exp, int) or datetime.now(UTC).timestamp() > exp:
        raise JWTError("Token expired")
    return payload
