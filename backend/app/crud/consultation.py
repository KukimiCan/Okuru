from supabase import Client
from typing import Optional

def get_consultations(
    supabase: Client,
    user_id: str,
    page: int = 1,
    limit: int = 10,
    favorite: Optional[bool] = None,
    visibility: Optional[str] = None
):
    # ページネーションの開始位置
    start = (page - 1) * limit
    end = start + limit - 1

    # 基本クエリの構築（ログインユーザーのデータのみ）
    # count="exact" を指定することで総件数（total）も取得できます
    query = supabase.table("gift_consultations").select(
        "id, title, is_favorite, visibility, created_at", 
        count="exact"
    ).eq("user_id", user_id)

    # フィルター条件の追加
    if favorite is not None:
        query = query.eq("is_favorite", favorite)
    if visibility is not None:
        query = query.eq("visibility", visibility)

    # 順序並び替え（新しい順）と範囲指定（ページネーション）
    response = query.order("created_at", desc=True).range(start, end).execute()

    return {
        "items": response.data,
        "page": page,
        "limit": limit,
        "total": response.count if response.count is not None else len(response.data)
    }

def get_consultation_detail(supabase: Client, consultation_id: str, user_id: str):
    # .maybe_single() を外し、普通に条件に合うデータを取得する
    response = supabase.table("gift_consultations") \
        .select("id, title, input_conditions, ai_response, is_favorite, visibility, created_at") \
        .eq("id", consultation_id) \
        .eq("user_id", user_id) \
        .execute()
        
    # response.data が存在し、中身が空でなければ最初の1件（インデックス0）を返す
    if response.data and len(response.data) > 0:
        return response.data[0]
        
    # データが1件も見つからなかった（または他人のデータだった）場合は None を返す
    return None