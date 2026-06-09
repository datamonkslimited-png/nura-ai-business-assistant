from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from supabase import create_client
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.tenant_service import TenantService
from sqlalchemy.ext.asyncio import AsyncSession
import re

router = APIRouter()


def _supabase():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class PhoneOTPRequest(BaseModel):
    phone: str   # +254XXXXXXXXX


class VerifyOTPRequest(BaseModel):
    phone: str
    token: str


@router.post("/signup")
async def sign_up(body: SignUpRequest):
    sb = _supabase()
    res = sb.auth.sign_up({
        "email": body.email,
        "password": body.password,
        "options": {"data": {"full_name": body.full_name}},
    })
    if res.user is None:
        raise HTTPException(status_code=400, detail="Sign-up failed. Email may already be registered.")
    return {"message": "Check your email to confirm your account.", "user_id": str(res.user.id)}


@router.post("/signin")
async def sign_in(body: SignInRequest):
    sb = _supabase()
    try:
        res = sb.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {
        "access_token": res.session.access_token,
        "refresh_token": res.session.refresh_token,
        "user": {"id": str(res.user.id), "email": res.user.email},
    }


@router.post("/phone/send-otp")
async def send_phone_otp(body: PhoneOTPRequest):
    sb = _supabase()
    # Normalize to +254 format
    phone = body.phone.strip()
    if phone.startswith("07") or phone.startswith("01"):
        phone = "+254" + phone[1:]
    elif phone.startswith("254") and not phone.startswith("+"):
        phone = "+" + phone
    sb.auth.sign_in_with_otp({"phone": phone})
    return {"message": "OTP sent via SMS"}


@router.post("/phone/verify-otp")
async def verify_phone_otp(body: VerifyOTPRequest):
    sb = _supabase()
    phone = body.phone.strip()
    if phone.startswith("07"):
        phone = "+254" + phone[1:]
    res = sb.auth.verify_otp({"phone": phone, "token": body.token, "type": "sms"})
    if res.session is None:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
    return {
        "access_token": res.session.access_token,
        "refresh_token": res.session.refresh_token,
    }


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    sb = _supabase()
    res = sb.auth.refresh_session(refresh_token)
    return {"access_token": res.session.access_token, "refresh_token": res.session.refresh_token}


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"user_id": user.get("sub"), "email": user.get("email"), "app_metadata": user.get("app_metadata", {})}
