from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    # App
    APP_NAME: str = "NURA API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"  # development | staging | production

    # Security
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_PLEASE"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://nura:nura_pass@localhost:5432/nura_db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    DATABASE_AUTO_CREATE_TABLES: bool = True

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Supabase Auth
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""   # Settings > API > JWT Secret in Supabase dashboard

    # Anthropic AI
    ANTHROPIC_API_KEY: str = ""
    AI_MODEL_FAST: str = "claude-haiku-4-5-20251001"   # Stage 1+2 (deterministic + classify)
    AI_MODEL_SMART: str = "claude-sonnet-4-6"           # Stage 3 (complex reasoning)
    AI_MAX_TOKENS: int = 1024
    AI_RATE_LIMIT_PER_TENANT_PER_MIN: int = 60

    # WhatsApp / Meta
    META_WHATSAPP_VERIFY_TOKEN: str = "nura_wh_verify_token"
    META_WHATSAPP_API_URL: str = "https://graph.facebook.com/v20.0"
    META_APP_SECRET: str = ""

    # M-Pesa (Safaricom Daraja)
    MPESA_BASE_URL: str = "https://sandbox.safaricom.co.ke"  # Change for prod
    MPESA_CONSUMER_KEY: str = ""
    MPESA_CONSUMER_SECRET: str = ""
    MPESA_SHORTCODE: str = "174379"
    MPESA_PASSKEY: str = ""
    MPESA_CALLBACK_URL: str = "https://api.nura.datamonks.com/webhooks/mpesa/callback"
    MPESA_TIMEOUT_URL: str = "https://api.nura.datamonks.com/webhooks/mpesa/timeout"

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://nura.datamonks.com",
        "https://www.datamonks.com",
    ]

    # Rate Limiting
    RATE_LIMIT_DEFAULT: str = "100/minute"
    RATE_LIMIT_AI: str = "30/minute"

    # Sentry
    SENTRY_DSN: str = ""

    # Email
    SMTP_HOST: str = "smtp.resend.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    FROM_EMAIL: str = "nura@datamonks.com"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
