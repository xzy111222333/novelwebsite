from fastapi import APIRouter

from . import auth, novels, chapters, chapter_items, characters, character_items, outlines, outline_items, world_building, world_buildings, ai, admin

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(novels.router)
api_router.include_router(chapters.router)
api_router.include_router(chapter_items.router)
api_router.include_router(characters.router)
api_router.include_router(character_items.router)
api_router.include_router(outlines.router)
api_router.include_router(outline_items.router)
api_router.include_router(world_building.router)
api_router.include_router(world_buildings.router)
api_router.include_router(ai.router)
api_router.include_router(admin.router)

__all__ = ["api_router"]
