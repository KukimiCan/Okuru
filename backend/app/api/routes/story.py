from fastapi import APIRouter, Depends, Query,HTTPException,status
from typing import Optional
from app.services.auth import get_current_user
from app.db.database import get_supabase
from app.schemas.story import StoryListResponse, StoryListResponseData, StoryListItem,StoryDetailResponse, StoryDetail,StoryCreate, StoryCreateResponse
from app.crud.story import get_public_stories,get_story_by_id,create_story
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

# DB-08: 体験談投稿API（認証必須）
@router.post("", response_model=StoryCreateResponse, status_code=status.HTTP_201_CREATED)
def post_story(
    story_in: StoryCreate,
    current_user_id: str = Depends(get_current_user), # ここでJWT認証を実行
    supabase: Client = Depends(get_supabase)
):
    # CRUD処理の呼び出し
    new_story = create_story(
        supabase=supabase,
        user_id=current_user_id,
        story_data=story_in.model_dump()
    )
    
    # 登録されたレコードをそのままPydanticスキーマに流し込んで返却
    return new_story