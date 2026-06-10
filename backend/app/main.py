from fastapi import FastAPI
from app.api.routes.consultations import router as consultations_router
from app.api.routes.health import router as health_router

app = FastAPI()

app.include_router(health_router, prefix="/api")
app.include_router(consultations_router, prefix="/api")