from pydantic import BaseModel
from typing import List
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