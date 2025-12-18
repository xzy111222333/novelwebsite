from typing import Literal, Optional

from pydantic import BaseModel


class AIMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class AIChatRequest(BaseModel):
    messages: list[AIMessage]
    temperature: float = 0.7
    max_tokens: int = 2000
    top_p: float = 0.9


class AIChatResponse(BaseModel):
    content: str
    raw: dict | None = None


class ContinueWritingRequest(BaseModel):
    content: str
    context: Optional[str] = None
    style: Optional[str] = None
    length: int = 800
    direction: Optional[str] = None


class ContinueWritingResponse(BaseModel):
    success: bool = True
    content: str
    wordCount: int

