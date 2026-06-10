from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ConsultationRequest(BaseModel):
    recipient_age_group: str
    recipient_gender: str
    relationship: str
    purpose: str
    budget_min: int
    budget_max: int
    hobbies: list[str]
    avoid_items: list[str]
    desired_mood: str
    note: str


@router.post("/consultations")
def create_consultation(payload: ConsultationRequest):
    return {
        "message": "success",
        "data": {
            "input": payload.dict(),
            "result": {
                "summary": "テスト用の簡易結果です。",
                "gift_candidates": [
                    {
                        "name": "サンプル候補",
                        "reason": "テスト確認用のサンプルです。",
                        "budget_range": "3000-5000円",
                        "caution": "実APIではGeminiの応答を返します。",
                        "suitable_for": "一般的な用途",
                        "message": "このまま開発を進めてください。",
                    }
                ],
                "tips": ["API ルートが動くことを確認しました。"],
                "avoid": ["ここでは実AI結果ではなくテスト用結果を返しています。"],
            },
        },
    }
