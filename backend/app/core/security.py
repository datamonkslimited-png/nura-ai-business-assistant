from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from app.core.config import settings

bearer_scheme = HTTPBearer()


def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Verify Supabase JWT and return the decoded payload."""
    token = credentials.credentials
    try:
        # Supabase JWTs are signed with the JWT_SECRET (available as service role)
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


async def get_current_tenant_id(user: dict = Depends(get_current_user)) -> str:
    """Extract tenant_id from the user's JWT app_metadata."""
    tenant_id = user.get("app_metadata", {}).get("tenant_id")
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenant associated with this account. Complete onboarding first.",
        )
    return tenant_id


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Require NURA super-admin role."""
    role = user.get("app_metadata", {}).get("role")
    if role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
