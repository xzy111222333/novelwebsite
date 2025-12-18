from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class WorldBuildingBase(BaseModel):
    title: str
    content: str
    type: str


class WorldBuildingUpsert(WorldBuildingBase):
    pass


class WorldBuildingResponse(WorldBuildingBase):
    id: str
    novel_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

