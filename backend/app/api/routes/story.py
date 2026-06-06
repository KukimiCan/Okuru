from fastapi import APIRouter, Depends, Query,HTTPException,status
from typing import Optional
from app.db.database import get_supabase
from app.schemas.story import StoryListResponse, StoryListResponseData, StoryListItem,StoryDetailResponse, StoryDetail
from app.crud.story import get_public_stories,get_story_by_id
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
# パスパラメータ {story_id} を指定した詳細取得API
@router.get("/{story_id}", response_model=StoryDetailResponse)
def read_story(
    story_id: str,
    supabase: Client = Depends(get_supabase)
):
    # CRUDロジックの呼び出し
    story = get_story_by_id(supabase=supabase, story_id=story_id)
    
    # データが存在しない、または非公開（private）の場合は404を返却
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された体験談が見つからないか、公開されていません。"
        )
        
    return StoryDetailResponse(
        data=StoryDetail(**story)
    )