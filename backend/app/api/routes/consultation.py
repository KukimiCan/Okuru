from fastapi import APIRouter, Depends, Query,status,HTTPException
from typing import Optional
from app.db.database import get_supabase  # Supabaseクライアント取得用の関数（環境に合わせて調整してください）
from app.services.auth import get_current_user
from app.schemas.consultation import ConsultationListResponse, ConsultationDetailResponse
from app.crud.consultation import get_consultations, get_consultation_detail

router = APIRouter(prefix="/consultations", tags=["consultations"])

@router.get("", response_model=ConsultationListResponse)
def list_consultations(
    page: int = Query(1, ge=1, description="ページ番号"),
    limit: int = Query(10, ge=1, le=100, description="1ページあたりの取得件数"),
    favorite: Optional[bool] = Query(None, description="お気に入り絞り込み (true/false)"),
    visibility: Optional[str] = Query(None, description="公開範囲絞り込み (public/private/unlisted)"),
    current_user_id: str = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    # CRUDロジックを呼び出し
    result_data = get_consultations(
        supabase=supabase,
        user_id=current_user_id,
        page=page,
        limit=limit,
        favorite=favorite,
        visibility=visibility
    )
    
    # 共通仕様のレスポンス形式にマッピングして返却
    return ConsultationListResponse(data=result_data)

@router.get("/{consultation_id}", response_model=ConsultationDetailResponse)
def get_consultation(
    consultation_id: str,
    current_user_id: str = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    # CRUDロジックを呼び出し
    detail_data = get_consultation_detail(
        supabase=supabase,
        consultation_id=consultation_id,
        user_id=current_user_id
    )
    
    # データが存在しない、または他人のデータだった場合
    if not detail_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された相談履歴が見つからないか、アクセス権限がありません。"
        )
        
    return ConsultationDetailResponse(data=detail_data)