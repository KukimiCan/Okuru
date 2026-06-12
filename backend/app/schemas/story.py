from pydantic import BaseModel,Field
from typing import List,Optional
from datetime import datetime
from uuid import UUID

class StoryListItem(BaseModel):
    id: UUID
    title: str
    result: str
    budget_range: str
    created_at: datetime

class StoryListResponseData(BaseModel):
    items: List[StoryListItem]
    page: int
    limit: int
    total: int

class StoryListResponse(BaseModel):
    data: StoryListResponseData
    message: str = "success"

# schemas/story.py に以下を追記

class StoryDetail(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    relationship: str  
    purpose: str
    budget_range: str
    gift_item: str
    result: str
    body: str
    keywords: List[str]
    visibility: str
    created_at: datetime
    updated_at: datetime

class StoryDetailResponse(BaseModel):
    data: StoryDetail
    message: str = "success"

class StoryCreate(BaseModel):
    title: str
    relationship: str
    purpose: str
    budget_range: str
    gift_item: str
    result: str          # 'success' | 'normal' | 'failure'
    body: str
    keywords: List[str] = []
    visibility: Optional[str] = "public"  # 'public' | 'unlisted' | 'private'

# 投稿成功時に返すミニマルなレスポンスデータ
class StoryCreateResponseData(BaseModel):
    id: UUID
    created_at: datetime

class StoryCreateResponse(BaseModel):
    data: StoryCreateResponseData
    message: str = "success"

# 編集用（PUT）のリクエストボディ
class StoryUpdate(BaseModel):
    title: Optional[str] = None
    relationship: Optional[str] = None
    purpose: Optional[str] = None
    budget_range: Optional[str] = None
    gift_item: Optional[str] = None
    result: Optional[str] = None
    body: Optional[str] = None
    visibility: Optional[str] = None
    keywords: Optional[List[str]] = None # 配列型に対応

# 編集成功時のレスポンスデータ構造
class StoryUpdateResponseData(BaseModel):
    story_id: str         # id から story_id に変更
    updated_at: datetime  # 追加

# 最終的な共通レスポンス構造
class StoryUpdateResponse(BaseModel):
    data: StoryUpdateResponseData
    message: str = "success"

class StoryDeleteResponseData(BaseModel):
    story_id: str

class StoryDeleteResponse(BaseModel):
    data: StoryDeleteResponseData
    message: str = "success"
