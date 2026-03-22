from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.core.database import Base, engine
import app.models
from app.api.routes.auth import router as auth_router
from app.api.routes.patients import router as patients_router
from app.api.routes.doctors import router as doctors_router
from app.api.routes.cases import router as cases_router
from app.api.routes.pipeline import router as pipeline_router
from app.api.routes.reports import router as reports_router
from app.api.routes.admin import router as admin_router
from app.api.routes.retargeting import router as retargeting_router
from app.api.routes.chat import router as chat_router

from app.api.routes.app_settings import router as app_settings_router
from app.api.routes.model_registry import router as model_registry_router

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RP Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(doctors_router)
app.include_router(cases_router)
app.include_router(pipeline_router)
app.include_router(reports_router)
app.include_router(admin_router)
app.include_router(retargeting_router)
app.include_router(chat_router)
app.include_router(app_settings_router)
app.include_router(model_registry_router)

app.mount("/static", StaticFiles(directory="app/storage"), name="static")


@app.get("/")
def root():
    return {"message": "RP backend is running"}


@app.get("/health")
def health():
    return {"status": "ok"}