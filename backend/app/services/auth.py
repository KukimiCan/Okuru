import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security = HTTPBearer()

# JWKSのURLから公開鍵を自動取得・キャッシュしてくれるクライアントを初期化
jwks_client = jwt.PyJWKClient(settings.SUPABASE_JWT_SECRET)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        # 1. 送られてきたJWTのヘッダーを見て、適切な公開鍵（signing_key）を自動でフェッチする
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # 2. その公開鍵を使ってトークンをデコード
        payload = jwt.decode(
            token, 
            signing_key.key,         # 自動取得した公開鍵
            algorithms=["ES256"],    # 画面に書いてあった ECC (P-256) に対応するアルゴリズム
            audience="authenticated"
        )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="ユーザーIDがトークンに含まれていません。"
            )
        return user_id
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="トークンの有効期限が切れています。"
        )
    except (jwt.InvalidTokenError, jwt.PyJWKClientError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証トークンが不正、または公開鍵の取得に失敗しました。"
        )