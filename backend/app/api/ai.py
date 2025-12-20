import json
import re

from fastapi import APIRouter, Depends, HTTPException, status

from .. import schemas
from ..api import deps
from ..services.ai_service import WRITING_SYSTEM_PROMPT, doubao_chat, extract_content

router = APIRouter(prefix="/ai", tags=["ai"])


def _parse_json_from_ai(text: str):
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\\s*```$", "", cleaned)
    return json.loads(cleaned)


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


@router.post("/refine", response_model=schemas.RefineResponse)
async def refine(
    body: schemas.RefineRequest,
    current_user=Depends(deps.get_current_user),
):
    if not body.content or not body.content.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="原文内容不能为空")

    system_prompt = (
        WRITING_SYSTEM_PROMPT
        + """

## 润色/扩写专项要求
你将对用户提供的文本进行润色或扩写，请遵循：
1) 保持语义与人设一致，不编造与原文冲突的情节
2) 语言自然，去 AI 味，避免模板化总结句
3) 输出必须为 JSON，不要输出任何其他内容（包括解释、markdown 代码块）

返回 JSON 格式：
{"refined":"...","notes":["...","..."]}
- refined：优化后的正文
- notes：本次优化的要点（可为空数组）
"""
    )

    user_prompt = (
        f"优化模式：{body.mode}\n"
        f"重点关注：{', '.join(body.focus) if body.focus else '无'}\n"
        f"额外要求：{body.instructions or '无'}\n\n"
        f"原文：\n{body.content}\n\n"
        "请按要求返回 JSON。"
    )

    try:
        raw = await doubao_chat(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.7,
            max_tokens=2000,
            top_p=0.9,
        )
        content = extract_content(raw)
        parsed = _parse_json_from_ai(content)
        refined = (parsed.get("refined") or "").strip()
        notes = parsed.get("notes")
        if not refined:
            raise ValueError("AI 返回内容缺少 refined 字段")
        if not isinstance(notes, list):
            notes = []
        notes = [str(x) for x in notes if str(x).strip()]
        return schemas.RefineResponse(refined=refined, notes=notes)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/review", response_model=schemas.ReviewResponse)
async def review(
    body: schemas.ReviewRequest,
    current_user=Depends(deps.get_current_user),
):
    if not body.content or not body.content.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="正文内容不能为空")

    system_prompt = (
        WRITING_SYSTEM_PROMPT
        + """

## 审稿专项要求
你是一名资深编辑，请对文本给出审稿报告，重点关注用户选择的维度，并给出可执行建议。
输出必须为 JSON，不要输出任何其他内容。

返回 JSON 格式：
{
  "strengths": ["..."],
  "issues": ["..."],
  "suggestions": ["..."],
  "scoring": {"plot": 0-10, "character": 0-10, "style": 0-10}
}
说明：strengths/issues/suggestions 均为数组，至少各 3 条；scoring 可选但推荐输出。
"""
    )

    user_prompt = (
        f"关注维度：{', '.join(body.focus) if body.focus else '综合'}\n\n"
        f"正文：\n{body.content}\n\n"
        "请按要求输出 JSON 审稿报告。"
    )

    try:
        raw = await doubao_chat(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.6,
            max_tokens=1600,
            top_p=0.9,
        )
        content = extract_content(raw)
        parsed = _parse_json_from_ai(content)

        strengths = parsed.get("strengths") if isinstance(parsed.get("strengths"), list) else []
        issues = parsed.get("issues") if isinstance(parsed.get("issues"), list) else []
        suggestions = parsed.get("suggestions") if isinstance(parsed.get("suggestions"), list) else []

        scoring = parsed.get("scoring")
        scoring_payload = None
        if isinstance(scoring, dict):
            scoring_payload = schemas.ReviewScoring(
                plot=scoring.get("plot"),
                character=scoring.get("character"),
                style=scoring.get("style"),
            )

        payload = schemas.ReviewPayload(
            strengths=[str(x) for x in strengths if str(x).strip()],
            issues=[str(x) for x in issues if str(x).strip()],
            suggestions=[str(x) for x in suggestions if str(x).strip()],
            scoring=scoring_payload,
        )

        return schemas.ReviewResponse(review=payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/deconstruct", response_model=schemas.DeconstructResponse)
async def deconstruct(
    body: schemas.DeconstructRequest,
    current_user=Depends(deps.get_current_user),
):
    if not body.content or not body.content.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="需要解析的文本不能为空")

    system_prompt = (
        WRITING_SYSTEM_PROMPT
        + """

## 文本拆解专项要求
你是一名资深编剧教练，擅长拆解小说文本。请根据用户提供的文本生成拆书报告：
1) 输出必须为 JSON，不要输出任何其他内容
2) summary 用自然中文概括，不要流水账
3) plotBeats 给出关键情节点（数组）
4) characters 给出人物洞察（name/insight）
5) themes 给出主题意象（数组）
6) suggestions 给出可执行改进建议（数组）

返回 JSON 格式：
{
  "summary": "...",
  "plotBeats": ["..."],
  "characters": [{"name":"...","insight":"..."}],
  "themes": ["..."],
  "suggestions": ["..."]
}
"""
    )

    user_prompt = (
        f"作品/章节标题：{body.title or '未命名'}\n"
        f"解析范围：{body.scope}\n\n"
        f"文本内容：\n{body.content}\n\n"
        "请直接返回 JSON。"
    )

    try:
        raw = await doubao_chat(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.6,
            max_tokens=1600,
            top_p=0.9,
        )
        content = extract_content(raw)
        parsed = _parse_json_from_ai(content)

        characters = []
        for item in parsed.get("characters") if isinstance(parsed.get("characters"), list) else []:
            if isinstance(item, dict):
                name = str(item.get("name") or "").strip()
                insight = str(item.get("insight") or "").strip()
                if name and insight:
                    characters.append(schemas.DeconstructCharacter(name=name, insight=insight))

        analysis = schemas.DeconstructAnalysis(
            summary=str(parsed.get("summary") or "").strip(),
            plotBeats=[str(x) for x in (parsed.get("plotBeats") or []) if str(x).strip()]
            if isinstance(parsed.get("plotBeats"), list)
            else [],
            characters=characters,
            themes=[str(x) for x in (parsed.get("themes") or []) if str(x).strip()]
            if isinstance(parsed.get("themes"), list)
            else [],
            suggestions=[str(x) for x in (parsed.get("suggestions") or []) if str(x).strip()]
            if isinstance(parsed.get("suggestions"), list)
            else [],
        )

        return schemas.DeconstructResponse(analysis=analysis)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/naming", response_model=schemas.NamingResponse)
async def naming(
    body: schemas.NamingRequest,
    current_user=Depends(deps.get_current_user),
):
    if not (body.keywords.strip() or body.background.strip()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="请至少提供关键词或背景描述")

    system_prompt = (
        WRITING_SYSTEM_PROMPT
        + """

## 命名专项要求
你是中文命名专家，请根据用户提供的信息生成命名方案，并解释含义。
输出必须为 JSON，不要输出任何其他内容。

返回 JSON 格式：
{"suggestions":[{"name":"...","meaning":"..."}, ...]}
要求：至少 8 个命名建议，name 简洁，meaning 用自然中文解释寓意与风格。
"""
    )

    user_prompt = (
        f"命名对象：{body.type}\n"
        f"性别倾向：{body.gender}\n"
        f"风格偏好：{body.style}\n"
        f"关键词：{body.keywords}\n"
        f"背景描述：{body.background}\n\n"
        "请按要求返回 JSON。"
    )

    try:
        raw = await doubao_chat(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.8,
            max_tokens=1200,
            top_p=0.9,
        )
        content = extract_content(raw)
        parsed = _parse_json_from_ai(content)
        suggestions = []
        for item in parsed.get("suggestions") if isinstance(parsed.get("suggestions"), list) else []:
            if isinstance(item, dict):
                name = str(item.get("name") or "").strip()
                meaning = str(item.get("meaning") or "").strip()
                if name and meaning:
                    suggestions.append(schemas.NamingSuggestion(name=name, meaning=meaning))
        return schemas.NamingResponse(suggestions=suggestions)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/generate-outline", response_model=schemas.GenerateOutlineResponse)
async def generate_outline(
    body: schemas.GenerateOutlineRequest,
    current_user=Depends(deps.get_current_user),
):
    if not body.title or not body.title.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="小说标题不能为空")

    system_prompt = (
        WRITING_SYSTEM_PROMPT
        + """

## 故事大纲生成要求
请根据用户信息生成故事大纲，要求：
1) 大纲结构清晰，按章节或阶段拆分
2) 说明每章核心事件、冲突与推进点
3) 文本自然，不要模板化总结
4) 只输出大纲正文，不要输出额外解释
"""
    )

    user_prompt = (
        f"小说标题：{body.title}\n"
        f"类型：{body.genre or '未指定'}\n"
        f"预计章节数：{body.chapterCount}\n"
        f"主要情节：{body.mainPlot or '未提供'}\n"
        f"主要人物：{'、'.join(body.characters) if body.characters else '未提供'}\n"
        f"写作风格：{body.style or '未指定'}\n\n"
        "请生成可直接使用的大纲正文。"
    )

    try:
        raw = await doubao_chat(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.75,
            max_tokens=1800,
            top_p=0.9,
        )
        outline = extract_content(raw)
        return schemas.GenerateOutlineResponse(outline=outline)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/generate-character", response_model=schemas.GenerateCharacterResponse)
async def generate_character(
    body: schemas.GenerateCharacterRequest,
    current_user=Depends(deps.get_current_user),
):
    system_prompt = (
        WRITING_SYSTEM_PROMPT
        + """

## 角色设定生成要求
请生成一份可直接用于写作的角色设定文档，要求：
1) 包含外貌/气质、性格动机、成长经历、关键关系、剧情作用、行为习惯等
2) 与用户提供信息保持一致，不要输出空泛套话
3) 只输出角色设定正文，不输出额外解释
"""
    )

    user_prompt = (
        f"角色姓名：{body.name or '未命名'}\n"
        f"角色定位：{body.role or '未指定'}\n"
        f"性格特征：{body.personality or '未提供'}\n"
        f"背景设定：{body.background or '未提供'}\n"
        f"故事背景：{body.storyContext or '未提供'}\n\n"
        "请生成角色设定正文。"
    )

    try:
        raw = await doubao_chat(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.75,
            max_tokens=1400,
            top_p=0.9,
        )
        character = extract_content(raw)
        return schemas.GenerateCharacterResponse(character=character)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/generate-world", response_model=schemas.GenerateWorldResponse)
async def generate_world(
    body: schemas.GenerateWorldRequest,
    current_user=Depends(deps.get_current_user),
):
    system_prompt = (
        WRITING_SYSTEM_PROMPT
        + """

## 世界观设定生成要求
请生成一份世界观设定文档，要求：
1) 分模块描述：世界概况/地理/时代/科技与魔法/文化/政治/宗教/日常细节
2) 用自然中文表达，避免模板化总结
3) 只输出设定正文，不输出额外解释
"""
    )

    user_prompt = (
        f"世界名称：{body.worldName or '未命名'}\n"
        f"世界类型：{body.worldType or '未指定'}\n"
        f"时代背景：{body.timePeriod or '未提供'}\n"
        f"地理环境：{body.geography or '未提供'}\n"
        f"科技水平：{body.technology or '未提供'}\n"
        f"魔法体系：{body.magic or '未提供'}\n"
        f"文化特色：{body.culture or '未提供'}\n"
        f"政治体系：{body.politics or '未提供'}\n"
        f"宗教信仰：{body.religion or '未提供'}\n"
        f"其他补充：{body.additional or '无'}\n\n"
        "请生成世界观设定正文。"
    )

    try:
        raw = await doubao_chat(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.75,
            max_tokens=1600,
            top_p=0.9,
        )
        world = extract_content(raw)
        return schemas.GenerateWorldResponse(world=world)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/generate-draft", response_model=schemas.GenerateDraftResponse)
async def generate_draft(
    body: schemas.GenerateDraftRequest,
    current_user=Depends(deps.get_current_user),
):
    if not body.prompt or not body.prompt.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="创作提示不能为空")

    genre_map = {
        "fantasy": "奇幻玄幻",
        "romance": "都市言情",
        "scifi": "科幻未来",
        "mystery": "悬疑推理",
        "history": "历史架空",
        "wuxia": "武侠仙侠",
    }
    style_map = {
        "descriptive": "细腻描写",
        "dialogue": "对话驱动",
        "action": "动作场面",
        "emotional": "情感丰富",
        "humorous": "幽默风趣",
    }
    length_map = {
        "short": {"min": 1000, "max": 3000, "description": "短篇（1000-3000字）", "max_tokens": 2000},
        "medium": {"min": 3000, "max": 8000, "description": "中篇（3000-8000字）", "max_tokens": 4000},
        "long": {"min": 8000, "max": 15000, "description": "长篇（8000-15000字）", "max_tokens": 8000},
    }

    genre_label = genre_map.get(body.genre, genre_map["fantasy"])
    style_label = style_map.get(body.style, style_map["descriptive"])
    length_cfg = length_map.get(body.length, length_map["medium"])

    system_prompt = (
        WRITING_SYSTEM_PROMPT
        + f"""

## 章节草稿生成专项要求
你是一位专业的中文网络小说作者，请根据用户提供的创作提示生成一段“可直接作为章节初稿”的正文，要求：
1. 结构完整：有开场、推进、转折/冲突、收束（可留悬念）
2. 语言自然：强去 AI 味，符合中文表达习惯
3. 节奏明确：避免流水账，推进剧情
4. 适度分段：一句一段或两句一段占比 70%+

题材：{genre_label}
风格：{style_label}
篇幅：{length_cfg['description']}（目标约 {length_cfg['min']}-{length_cfg['max']} 字）

只输出正文内容，不要输出标题、不要输出解释。
"""
    )

    user_prompt = f"创作提示/剧情梗概：\n{body.prompt}\n\n请输出正文。"

    try:
        raw = await doubao_chat(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            temperature=0.8,
            max_tokens=length_cfg["max_tokens"],
            top_p=0.9,
        )
        content = extract_content(raw)
        metadata = schemas.GenerateDraftMetadata(
            wordCount=len(content),
            genre=genre_label,
            style=style_label,
            length=length_cfg["description"],
        )
        return schemas.GenerateDraftResponse(content=content, metadata=metadata)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
