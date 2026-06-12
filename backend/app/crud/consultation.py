import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from supabase import Client

from app.services.ai_prompt import build_ai_prompt_messages, call_gemini


MASKED_TEXT = "[マスキング済み]"
AI_SUMMARY_KEY = "AI回答要約"


def _mask_sensitive_text(value: str) -> str:
    text = value
    text = re.sub(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b", MASKED_TEXT, text)
    text = re.sub(r"\b0\d{1,4}-\d{2,4}-\d{3,4}\b", MASKED_TEXT, text)
    text = re.sub(r"\b(?:山田|鈴木|佐藤|高橋|田中)\w*\b", MASKED_TEXT, text)
    return text


def sanitize_for_storage(input_data: Dict[str, Any]) -> Dict[str, Any]:
    sanitized = dict(input_data)
    if isinstance(sanitized.get("note"), str):
        sanitized["note"] = _mask_sensitive_text(sanitized["note"])
    return sanitized


def _build_fallback_result(input_data: Dict[str, Any]) -> Dict[str, Any]:
    budget_min = input_data.get("budget_min")
    budget_max = input_data.get("budget_max")
    budget_range = (
        f"{budget_min}-{budget_max} JPY"
        if budget_min is not None and budget_max is not None
        else "Adjust to budget"
    )

    return {
        "summary": "相談条件をもとに、日常で使いやすく相手の負担になりにくいギフト候補を整理しました。",
        "gift_candidates": [
            {
                "name": "実用的なギフトセット",
                "reason": "好みが細かく分からない相手にも渡しやすく、日常生活で自然に使ってもらいやすいためです。",
                "budget_range": budget_range,
                "caution": "購入前にサイズ、香り、アレルギー、保管場所に困らないかを確認してください。",
                "suitable_for": "実用性を重視する相手",
                "message": "いつもありがとう。よかったら日々の中で使ってください。",
            }
        ],
        "tips": ["相手が普段の生活で無理なく使えるものを選ぶと、失敗しにくくなります。"],
        "avoid": ["香りが強いもの、大きすぎるもの、好みが強く分かれるものは避けると安心です。"],
    }


def _normalize_result(value: Any, input_data: Dict[str, Any]) -> Dict[str, Any]:
    fallback = _build_fallback_result(input_data)
    if not isinstance(value, dict):
        return fallback

    candidates = value.get("gift_candidates")
    if not isinstance(candidates, list) or len(candidates) == 0:
        return fallback

    return {
        "summary": value.get("summary") if isinstance(value.get("summary"), str) and value.get("summary") else fallback["summary"],
        "gift_candidates": candidates,
        "tips": value.get("tips") if isinstance(value.get("tips"), list) and value.get("tips") else fallback["tips"],
        "avoid": value.get("avoid") if isinstance(value.get("avoid"), list) and value.get("avoid") else fallback["avoid"],
    }


def _generate_result(input_data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        response = call_gemini(build_ai_prompt_messages(input_data))
        text = response.get("text") if isinstance(response, dict) else None
        output = text.get("output") if isinstance(text, dict) else None
        return _normalize_result(output, input_data)
    except Exception:
        return _build_fallback_result(input_data)


def build_log_payload(
    input_data: Dict[str, Any],
    ai_summary: str,
    status: str,
    error_details: Optional[str],
) -> Dict[str, Any]:
    sanitized_input = sanitize_for_storage(input_data)

    return {
        "consulted_at": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "recipient_age_group": sanitized_input.get("recipient_age_group"),
        "relationship": sanitized_input.get("relationship"),
        "purpose": sanitized_input.get("purpose"),
        "budget_min": sanitized_input.get("budget_min"),
        "budget_max": sanitized_input.get("budget_max"),
        "note": sanitized_input.get("note", ""),
        AI_SUMMARY_KEY: ai_summary,
        "error_details": error_details,
    }


def get_consultations(
    supabase: Client,
    user_id: str,
    page: int = 1,
    limit: int = 10,
    favorite: Optional[bool] = None,
    visibility: Optional[str] = None,
) -> Dict[str, Any]:
    start = (page - 1) * limit
    end = start + limit - 1

    query = supabase.table("gift_consultations").select(
        "id, title, is_favorite, visibility, created_at",
        count="exact",
    ).eq("user_id", user_id)

    if favorite is not None:
        query = query.eq("is_favorite", favorite)
    if visibility is not None:
        query = query.eq("visibility", visibility)

    response = query.order("created_at", desc=True).range(start, end).execute()

    return {
        "items": response.data,
        "page": page,
        "limit": limit,
        "total": response.count if response.count is not None else len(response.data),
    }


def _to_detail_response(saved: Dict[str, Any], fallback_input: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    input_data = saved.get("input_conditions") or fallback_input or {}
    ai_response = saved.get("ai_response") or {}

    return {
        "id": saved["id"],
        "title": saved["title"],
        "input": input_data,
        "result": _normalize_result(ai_response, input_data),
        "is_favorite": saved.get("is_favorite", False),
        "visibility": saved.get("visibility", "private"),
        "created_at": saved.get("created_at"),
    }


def create_consultation(supabase: Client, user_id: str, consultation_data: Dict[str, Any]) -> Dict[str, Any]:
    sanitized_input = sanitize_for_storage(consultation_data)
    result = _generate_result(sanitized_input)
    status = "success"
    error_details = None

    supabase.table("profiles").upsert({"id": user_id}, on_conflict="id").execute()

    log_payload = build_log_payload(
        input_data=sanitized_input,
        ai_summary=result["summary"],
        status=status,
        error_details=error_details,
    )

    insert_data = {
        "user_id": user_id,
        "title": f"{sanitized_input.get('relationship', '相談')}/{sanitized_input.get('purpose', '提案')}",
        "input_conditions": sanitized_input,
        "ai_response": {
            "status": status,
            "error": error_details,
            "log": log_payload,
            **result,
        },
        "visibility": "private",
        "is_favorite": False,
    }

    response = supabase.table("gift_consultations").insert(insert_data).execute()
    if not response.data:
        raise RuntimeError("相談履歴の保存に失敗しました。")

    saved = response.data[0]
    return {
        "consultation_id": saved["id"],
        "input": saved.get("input_conditions", sanitized_input),
        "result": _normalize_result(saved.get("ai_response"), sanitized_input),
        "created_at": saved.get("created_at"),
    }


def get_consultation_detail(supabase: Client, consultation_id: str, user_id: str):
    response = supabase.table("gift_consultations") \
        .select("id, title, input_conditions, ai_response, is_favorite, visibility, created_at") \
        .eq("id", consultation_id) \
        .eq("user_id", user_id) \
        .execute()

    if response.data and len(response.data) > 0:
        return _to_detail_response(response.data[0])

    return None


def update_consultation(
    supabase: Client,
    consultation_id: str,
    user_id: str,
    consultation_data: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    allowed_fields = {"is_favorite", "visibility", "title"}
    update_data = {
        key: value
        for key, value in consultation_data.items()
        if key in allowed_fields and value is not None
    }

    if not update_data:
        return None

    response = supabase.table("gift_consultations") \
        .update(update_data) \
        .eq("id", consultation_id) \
        .eq("user_id", user_id) \
        .execute()

    if response.data and len(response.data) > 0:
        row = response.data[0]
        return {
            "consultation_id": row.get("id"),
            "is_favorite": row.get("is_favorite", False),
            "visibility": row.get("visibility", "private"),
            "title": row.get("title", ""),
            "updated_at": row.get("updated_at"),
        }

    return None


def delete_consultation(
    supabase: Client,
    consultation_id: str,
    user_id: str,
) -> Optional[Dict[str, str]]:
    response = supabase.table("gift_consultations") \
        .delete() \
        .eq("id", consultation_id) \
        .eq("user_id", user_id) \
        .execute()

    if response.data and len(response.data) > 0:
        row = response.data[0]
        return {"consultation_id": row.get("id")}

    return None
