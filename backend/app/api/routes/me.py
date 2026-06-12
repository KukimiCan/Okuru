from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client

from app.crud.story import get_my_stories, get_my_story_by_id
from app.db.database import get_supabase
from app.schemas.story import (
    MyStoryListItem,
    MyStoryListResponse,
    MyStoryListResponseData,
    StoryDetail,
    StoryDetailResponse,
)
from app.services.auth import get_current_user


router = APIRouter(prefix="/me", tags=["me"])


@router.get("/stories", response_model=MyStoryListResponse)
def read_my_stories(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    items, total = get_my_stories(
        supabase=supabase,
        user_id=current_user_id,
        page=page,
        limit=limit,
    )

    story_items = [MyStoryListItem(**item) for item in items]

    return MyStoryListResponse(
        data=MyStoryListResponseData(
            items=story_items,
            page=page,
            limit=limit,
            total=total,
        )
    )


@router.get("/stories/{story_id}", response_model=StoryDetailResponse)
def read_my_story(
    story_id: str,
    current_user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    story = get_my_story_by_id(
        supabase=supabase,
        story_id=story_id,
        user_id=current_user_id,
    )

    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された体験談が見つからないか、アクセス権限がありません。",
        )

    return StoryDetailResponse(data=StoryDetail(**story))
