import os

from dotenv import load_dotenv

load_dotenv()


def _split_origins(value: str | None) -> list[str]:
    if not value:
        return []

    return [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]


class Settings:
    APP_ENV: str = os.getenv("APP_ENV", "development")
    SUPABASE_URL: str | None = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY: str | None = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    SUPABASE_JWT_SECRET: str | None = os.getenv("SUPABASE_JWT_SECRET")
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL: str | None = os.getenv("GEMINI_MODEL")
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    FRONTEND_URL: str | None = os.getenv("FRONTEND_URL")
    VERCEL_URL: str | None = os.getenv("VERCEL_URL")

    @property
    def cors_origins(self) -> list[str]:
        origins = [
            *_split_origins(self.CORS_ORIGINS),
            *_split_origins(self.FRONTEND_URL),
        ]

        if self.VERCEL_URL:
            vercel_origin = self.VERCEL_URL.strip().rstrip("/")
            if not vercel_origin.startswith(("http://", "https://")):
                vercel_origin = f"https://{vercel_origin}"
            origins.append(vercel_origin)

        return list(dict.fromkeys(origins))


settings = Settings()
