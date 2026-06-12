from fastapi import APIRouter, Depends, Query, status, HTTPException
from typing import Optional

from app.db.database import get_supabase
from app.services.auth import get_current_user
from app.schemas.consultation import (
    ConsultationCreateRequest,
    ConsultationCreateResponse,
    ConsultationDeleteResponse,
    ConsultationDetailResponse,
    ConsultationListResponse,
    ConsultationUpdateRequest,
    ConsultationUpdateResponse,
)
from app.crud.consultation import (
    create_consultation,
    delete_consultation,
    get_consultation_detail,
    get_consultations,
    update_consultation,
)

router = APIRouter(prefix="/consultations", tags=["consultations"])

@router.post("", response_model=ConsultationCreateResponse, status_code=status.HTTP_201_CREATED)
def create_consultation_record(
    consultation_in: ConsultationCreateRequest,
    current_user_id: str = Depends(get_current_user),
    supabase = Depends(get_supabase),
):
    try:
        saved = create_consultation(
            supabase=supabase,
            user_id=current_user_id,
            consultation_data=consultation_in.model_dump(),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"相談履歴の保存に失敗しました: {exc}",
        ) from exc

    return ConsultationCreateResponse(
        data=saved,
        message="success",
    )

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

@router.patch("/{consultation_id}", response_model=ConsultationUpdateResponse)
def patch_consultation(
    consultation_id: str,
    consultation_in: ConsultationUpdateRequest,
    current_user_id: str = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    updated = update_consultation(
        supabase=supabase,
        consultation_id=consultation_id,
        user_id=current_user_id,
        consultation_data=consultation_in.model_dump(exclude_unset=True),
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された相談履歴が見つからないか、更新権限がありません。",
        )

    return ConsultationUpdateResponse(data=updated)

@router.delete("/{consultation_id}", response_model=ConsultationDeleteResponse)
def delete_consultation_record(
    consultation_id: str,
    current_user_id: str = Depends(get_current_user),
    supabase = Depends(get_supabase)
):
    deleted = delete_consultation(
        supabase=supabase,
        consultation_id=consultation_id,
        user_id=current_user_id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="指定された相談履歴が見つからないか、削除権限がありません。",
        )

    return ConsultationDeleteResponse(data=deleted)
