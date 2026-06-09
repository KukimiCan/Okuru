from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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