from fastapi import APIRouter

from . import auth, novels

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(novels.router)

__all__ = ["api_router"]
