from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.db.database import get_supabase
from app.schemas.story import StoryListResponse, StoryListResponseData, StoryListItem
from app.crud.story import get_public_stories
from supabase import Client

router = APIRouter(prefix="/stories", tags=["stories"])

@router.get("", response_model=StoryListResponse)
def read_stories(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    relationship: Optional[str] = None,
    purpose: Optional[str] = None,
    budget_range: Optional[str] = None,
    result: Optional[str] = None,
    keyword: Optional[str] = None,
    supabase: Client = Depends(get_supabase)
):
    # Supabaseクライアントを使ってデータ取得
    items, total = get_public_stories(
        supabase=supabase,
        page=page,
        limit=limit,
        relationship=relationship,
        purpose=purpose,
        budget_range=budget_range,
        result=result,
        keyword=keyword
    )
    
    # 取得データをPydanticスキーマに落とし込む
    story_items = [StoryListItem(**item) for item in items]

    return StoryListResponse(
        data=StoryListResponseData(
            items=story_items,
            page=page,
            limit=limit,
            total=total
        )
    )