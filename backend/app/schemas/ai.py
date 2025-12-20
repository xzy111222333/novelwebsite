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


class RefineRequest(BaseModel):
    content: str
    mode: str = "polish"
    focus: list[str] = []
    instructions: Optional[str] = None


class RefineResponse(BaseModel):
    success: bool = True
    refined: str
    notes: Optional[list[str]] = None


class ReviewRequest(BaseModel):
    content: str
    focus: list[str] = []


class ReviewScoring(BaseModel):
    plot: int | None = None
    character: int | None = None
    style: int | None = None


class ReviewPayload(BaseModel):
    strengths: list[str] = []
    issues: list[str] = []
    suggestions: list[str] = []
    scoring: ReviewScoring | None = None


class ReviewResponse(BaseModel):
    success: bool = True
    review: ReviewPayload


class DeconstructRequest(BaseModel):
    content: str
    scope: str = "chapter"
    title: Optional[str] = None


class DeconstructCharacter(BaseModel):
    name: str
    insight: str


class DeconstructAnalysis(BaseModel):
    summary: str = ""
    plotBeats: list[str] = []
    characters: list[DeconstructCharacter] = []
    themes: list[str] = []
    suggestions: list[str] = []


class DeconstructResponse(BaseModel):
    success: bool = True
    analysis: DeconstructAnalysis


class NamingRequest(BaseModel):
    type: str = "character"
    gender: str = "any"
    style: str = "classical"
    keywords: str = ""
    background: str = ""
    novelId: Optional[str] = None


class NamingSuggestion(BaseModel):
    name: str
    meaning: str


class NamingResponse(BaseModel):
    success: bool = True
    suggestions: list[NamingSuggestion] = []


class GenerateOutlineRequest(BaseModel):
    title: str
    genre: str = ""
    mainPlot: str = ""
    characters: list[str] = []
    chapterCount: int = 20
    style: str = ""


class GenerateOutlineResponse(BaseModel):
    success: bool = True
    outline: str


class GenerateCharacterRequest(BaseModel):
    name: str = ""
    role: str = ""
    personality: str = ""
    background: str = ""
    storyContext: str = ""


class GenerateCharacterResponse(BaseModel):
    success: bool = True
    character: str


class GenerateWorldRequest(BaseModel):
    worldName: str = ""
    worldType: str = ""
    timePeriod: str = ""
    geography: str = ""
    technology: str = ""
    magic: str = ""
    culture: str = ""
    politics: str = ""
    religion: str = ""
    additional: str = ""


class GenerateWorldResponse(BaseModel):
    success: bool = True
    world: str


class GenerateDraftRequest(BaseModel):
    prompt: str
    genre: str = "fantasy"
    style: str = "descriptive"
    length: str = "medium"


class GenerateDraftMetadata(BaseModel):
    wordCount: int
    genre: str
    style: str
    length: str


class GenerateDraftResponse(BaseModel):
    success: bool = True
    content: str
    metadata: GenerateDraftMetadata
