from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import api_router
from .config import get_settings
from .database import Base, engine

Base.metadata.create_all(bind=engine)

settings = get_settings()
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(api_router)
