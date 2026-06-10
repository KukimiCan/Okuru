from typing import Optional, List, Tuple, Dict, Any
from supabase import Client

def get_public_stories(
    supabase: Client,
    page: int = 1,
    limit: int = 12,
    relationship: Optional[str] = None,
    purpose: Optional[str] = None,
    budget_range: Optional[str] = None,
    result: Optional[str] = None,
    keyword: Optional[str] = None
) -> Tuple[List[Dict[str, Any]], int]:
    
    # 基本クエリの設定（visibilityがpublicのもの、かつ総件数カウントを有効化）
    query = supabase.table("gift_stories") \
        .select("id, title, result, budget_range, created_at", count="exact") \
        .eq("visibility", "public")
    
    # 完全一致フィルターの適用
    if relationship:
        query = query.eq("relationship", relationship)
    if purpose:
        query = query.eq("purpose", purpose)
    if budget_range:
        query = query.eq("budget_range", budget_range)
    if result:
        query = query.eq("result", result)
        
    # キーワード検索（title, gift_item, body のいずれかに部分一致）
    # PostgRESTの構文に則り、カンマ区切りの文字列でOR条件を指定します
    if keyword:
        or_condition = f"title.ilike.%{keyword}%,gift_item.ilike.%{keyword}%,body.ilike.%{keyword}%"
        query = query.or_(or_condition)
        
    # ページネーション（rangeは開始と終了のインデックスを指定。閉区間なので -1 する）
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit - 1
    
    # クエリの実行（新しい順にソート）
    response = query.order("created_at", desc=True) \
        .range(start_idx, end_idx) \
        .execute()
        
    # 結果の抽出
    items = response.data
    total = response.count if response.count is not None else 0
    
    return items, total

# crud/story.py に以下を追記

def get_story_by_id(supabase: Client, story_id: str) -> Optional[Dict[str, Any]]:
    # 指定されたIDのレコードを1件取得
    response = supabase.table("gift_stories") \
        .select("*") \
        .eq("id", story_id) \
        .execute()
        
    # レコードが存在しない場合は None を返す
    if not response.data:
        return None
        
    story = response.data[0]
    
    # 閲覧制限チェック: private の場合は取得不可とする
    if story.get("visibility") == "private":
        return None
        
    return story

def create_story(supabase: Client, user_id: str, story_data: dict) -> dict:
    """
    新しい体験談をデータベースに挿入する
    """
    supabase.table("profiles") \
        .upsert({"id": user_id}, on_conflict="id") \
        .execute()

    insert_data = {
        "user_id": user_id,
        "title": story_data["title"],
        "relationship": story_data["relationship"],
        "purpose": story_data["purpose"],
        "budget_range": story_data["budget_range"],
        "gift_item": story_data["gift_item"],
        "result": story_data["result"],
        "body": story_data["body"],
        "visibility": story_data["visibility"],
        "keywords": story_data["keywords"]
    }
    
    response = supabase.table("gift_stories") \
        .insert(insert_data) \
        .execute()
        
    if not response.data:
        raise RuntimeError("データの挿入に失敗しました。")
        
    return response.data[0]
