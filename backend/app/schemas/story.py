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