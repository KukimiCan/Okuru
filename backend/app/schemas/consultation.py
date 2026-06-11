from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

class ConsultationCreateRequest(BaseModel):
    recipient_age_group: str
    recipient_gender: str
    relationship: str
    purpose: str
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    hobbies: List[str] = Field(default_factory=list)
    avoid_items: List[str] = Field(default_factory=list)
    desired_mood: str
    note: str = ""


class ConsultationCreateResponseData(BaseModel):
    consultation_id: str
    input: Dict[str, Any]
    result: Dict[str, Any]
    created_at: Optional[datetime] = None


class ConsultationCreateResponse(BaseModel):
    data: ConsultationCreateResponseData
    message: str = "success"


# 一覧の中の1件分のデータ構造
class ConsultationListItem(BaseModel):
    id: str
    title: str
    is_favorite: bool
    visibility: str
    created_at: datetime

    class Config:
        from_attributes = True

# dataフィールドの中身の構造
class ConsultationListResponseData(BaseModel):
    items: List[ConsultationListItem]
    page: int
    limit: int
    total: int

# 最終的な共通レスポンス構造
class ConsultationListResponse(BaseModel):
    data: ConsultationListResponseData
    message: str = "success"

# 詳細表示用のデータ構造
class ConsultationDetailResponseData(BaseModel):
    id: str
    title: str
    input_conditions: Dict[str, Any]
    ai_response: Dict[str, Any]
    is_favorite: bool
    visibility: str
    created_at: datetime

    class Config:
        from_attributes = True

# 最終的な共通レスポンス構造
class ConsultationDetailResponse(BaseModel):
    data: ConsultationDetailResponseData
    message: str = "success"