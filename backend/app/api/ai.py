from fastapi import APIRouter, Depends, HTTPException, status

from .. import schemas
from ..api import deps
from ..services.ai_service import WRITING_SYSTEM_PROMPT, doubao_chat, extract_content

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=schemas.AIChatResponse)
async def chat(
    payload: schemas.AIChatRequest,
    current_user=Depends(deps.get_current_user),
):
    try:
        raw = await doubao_chat(
            [m.model_dump() for m in payload.messages],
            temperature=payload.temperature,
            max_tokens=payload.max_tokens,
            top_p=payload.top_p,
        )
        return schemas.AIChatResponse(content=extract_content(raw), raw=raw)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/continue-writing", response_model=schemas.ContinueWritingResponse)
async def continue_writing(
    body: schemas.ContinueWritingRequest,
    current_user=Depends(deps.get_current_user),
):
    if not body.content or not body.content.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="现有内容不能为空")

    system_prompt = (
        WRITING_SYSTEM_PROMPT
        + """

## 续写专项要求
你正在续写小说内容，需要：
1. 保持原有文风和语调的一致性
2. 确保情节发展的逻辑性和合理性
3. 人物性格和行为要保持一致
4. 适当设置悬念和转折
5. 注意场景描写和情感渲染的平衡

续写策略：
- 情节发展：推进故事主线，增加冲突或转折
- 人物刻画：深化人物形象，展现内心世界
- 场景描写：丰富环境细节，营造氛围
- 对话场景：设计自然的人物对话

请直接开始续写，不要添加任何解释性文字。"""
    )

    user_prompt = f"请续写以下内容：\n\n{body.content}"
    if body.context:
        user_prompt += f"\n\n故事背景：{body.context}"
    if body.style:
        user_prompt += f"\n写作风格要求：{body.style}"
    if body.direction:
        user_prompt += f"\n续写方向：{body.direction}"
    user_prompt += f"\n\n请续写约{body.length}字的内容。"

    max_tokens = min(max(body.length * 2, 256), 2000)

    try:
        raw = await doubao_chat(
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.8,
            max_tokens=max_tokens,
            top_p=0.9,
        )
        content = extract_content(raw)
        return schemas.ContinueWritingResponse(content=content, wordCount=len(content))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

