from supabase import create_client, Client
from app.core.config import settings

# Supabaseクライアントの初期化（シングルトンとして利用）
supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def get_supabase():
    """
    FastAPIの各ルートで利用するSupabaseクライアントの依存関係
    """
    return supabase_client