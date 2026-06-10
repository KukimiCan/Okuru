from supabase import Client, create_client

from app.core.config import settings

supabase_client: Client | None = None


def get_supabase() -> Client:
    """
    Return a lazily-created Supabase client for API routes that need database access.
    """
    global supabase_client

    if supabase_client is not None:
        return supabase_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for database APIs."
        )

    supabase_client = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
    )
    return supabase_client
