from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes.consultations import router as consultations_router
from app.core.config import settings
from app.api.routes.health import router as health_router
from app.api.routes.story import router as story_router
from app.api.routes.consultation import router as consultation_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Pydanticのバリデーションエラー（型エラー、必須項目漏れなど）を
    api.mdの共通エラー形式に変換して返却する
    """
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,  # 共通仕様の400 Bad Requestにマッピング
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "入力内容を確認してください",
                # フロントエンドがデバッグしやすいよう、エラー詳細（どのフィールドがどう悪いか）を格納
                "details": exc.errors()  
            }
        }
    )

app.include_router(health_router, prefix="/api")
app.include_router(consultations_router, prefix="/api")
app.include_router(story_router, prefix="/api")
