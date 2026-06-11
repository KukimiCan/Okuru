import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from supabase import Client


MASKED_TEXT = "[マスキング済み]"


def _mask_sensitive_text(value: str) -> str:
    """MVP向けの簡易マスキング。氏名や電話番号を除去して、調査用に要約を残す。"""
    text = value
    text = re.sub(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b", MASKED_TEXT, text)
    text = re.sub(r"\b0\d{1,4}-\d{2,4}-\d{3,4}\b", MASKED_TEXT, text)
    text = re.sub(r"\b(?:山田|鈴木|佐藤|高橋|田中)\w*\b", MASKED_TEXT, text)
    return text


def sanitize_for_storage(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """DB保存用に個人情報をマスクした入力データを返す。"""
    sanitized = dict(input_data)
    if isinstance(sanitized.get("note"), str):
        sanitized["note"] = _mask_sensitive_text(sanitized["note"])
    return sanitized


def build_log_payload(input_data: Dict[str, Any], ai_summary: str, status: str, error_details: Optional[str]) -> Dict[str, Any]:
    """相談ログの最小保存形式を返す。"""
    sanitized_input = sanitize_for_storage(input_data)
    note = sanitized_input.get("note", "")

    return {
        "consulted_at": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "recipient_age_group": sanitized_input.get("recipient_age_group"),
        "relationship": sanitized_input.get("relationship"),
        "purpose": sanitized_input.get("purpose"),
        "budget_min": sanitized_input.get("budget_min"),
        "budget_max": sanitized_input.get("budget_max"),
        "note": note,
        "AI回答要約": ai_summary,
        "error_details": error_details,
    }

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

def create_consultation(supabase: Client, user_id: str, consultation_data: Dict[str, Any]) -> Dict[str, Any]:
    """相談内容をDBへ保存し、調査用の簡易ログを残す。"""
    ai_summary = (
        f"{consultation_data.get('relationship', '未指定')}向けに、"
        f"{consultation_data.get('purpose', '未指定')}を目的にした提案を作成します。"
    )
    status = "success"
    error_details = None

    try:
        # MVPでは Gemini 呼び出しが未設定でも保存できるよう、簡易サマリを優先して使う。
        if consultation_data.get("note"):
            ai_summary = ai_summary + " 補足メモは保存済みです。"
    except Exception as exc:  # pragma: no cover - defensive fallback
        status = "error"
        error_details = str(exc)

    sanitized_input = sanitize_for_storage(consultation_data)

    # 相談履歴保存前に profiles レコードを確保し、FK 制約を満たす。
    supabase.table("profiles").upsert({"id": user_id}, on_conflict="id").execute()

    log_payload = build_log_payload(
        input_data=sanitized_input,
        ai_summary=ai_summary,
        status=status,
        error_details=error_details,
    )

    insert_data = {
        "user_id": user_id,
        "title": f"{sanitized_input.get('relationship', '相談')}/{sanitized_input.get('purpose', '提案')}",
        "input_conditions": sanitized_input,
        "ai_response": {
            "status": status,
            "summary": ai_summary,
            "error": error_details,
            "log": log_payload,
        },
        "visibility": "private",
        "is_favorite": False,
    }

    response = supabase.table("gift_consultations").insert(insert_data).execute()
    if not response.data:
        raise RuntimeError("相談履歴の保存に失敗しました。")

    saved = response.data[0]
    ai_response = saved.get("ai_response", {}) or {}

    return {
        "consultation_id": saved["id"],
        "input": saved.get("input_conditions", sanitized_input),
        "result": {
            "summary": ai_response.get("summary", ""),
            "gift_candidates": ai_response.get("gift_candidates", []),
            "tips": ai_response.get("tips", []),
            "avoid": ai_response.get("avoid", []),
        },
        "created_at": saved.get("created_at"),
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