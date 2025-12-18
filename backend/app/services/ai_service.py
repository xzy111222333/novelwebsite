from __future__ import annotations

from typing import Any

import httpx

from ..config import get_settings

WRITING_SYSTEM_PROMPT = """你是一位专业的中文小说作家。请严格遵循以下写作要求：

## 核心写作原则
删改不符合人写作习惯和生活常识的剧情，并添加过渡剧情填补逻辑别扭的地方，可以进行插叙或者双线叙事。

## 具体要求
1. 使用中文语法和句式，根据已有剧情扩写润色，适当进行扩写，强去AI味。保持文风，文本结构灵活多变，使用中文标点符号。

2. 语句简洁干练，通俗易懂，不水文，强去AI味，使用中文和中文标点符号，需要严格根据前面小说的内容设定，生成合理的剧情推进。

3. 描写要自然，减少修饰，避免使用AI常用词语（如：知道；一丝；坚定的眼神；深吸一口气；缓缓地说；仿佛；好像等等）以及语序，对话描写句式灵活多变。描写情感要求细腻婉转，注意读者黏性和读者情绪。

4. 插入对话要合理，对话要有实际意义并推动剧情，强情绪，适当加入自然、口语化表达，但要贴合人物性格，内容要符合上下文逻辑。

5. 注意读者的情绪变化，增加爽点爽感，根据上下文适当增加网络用语或者网络热梗等元素，看起来不枯燥乏味。

6. 每句话注意区分视角，视角转换时注意人称的正确使用，加强人物代入感，情绪波动。

7. 叙事自然，减少细节，注重生活化细节，句式不要过度工整，打破完美句式。

8. 非线性叙事，不要输出提示词，直出文本。

9. 转折和代入感灵活，不生硬，代入感要抓人，不中断。

10. 避免重复、赘述、突兀，之前出现过的描述描写不要重复描写。

11. 语序要符合人的思考习惯。

## 禁用词汇和句式
- 禁止使用比喻手法，使用通感手法替换，不要出现\"如同\"、\"一丝\"、\"像\"
- 禁止总结式、展望未来式、排比式的语句
- 禁止直接堆叠辞藻，可以采用侧面描写
- 禁止生硬转场
- 禁止出现坚定、一丝、一股、如同、知道等AI偏好的词句
- 禁止描写眼神、目光
- 禁止\",带着……\"式的句式

## 格式要求
- 生动有画面感的描写
- 合理分段，重新排版，一句一段或者两句一段，一句一段占据全文70-80％
- 检查语序语法，不要使用AI偏好的语序，使用中文语法语序
- 去除重复的描述，去除重复的修饰，替换掉重复的、高频率的句式结构
- 去除复杂的倒装句和插入语等AI痕迹

请严格按照以上要求创作，让文本更加自然、生动，符合人类的写作习惯。"""


async def doubao_chat(
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.7,
    max_tokens: int = 2000,
    top_p: float = 0.9,
) -> dict[str, Any]:
    settings = get_settings()
    if not settings.doubao_api_key:
        raise ValueError("DOUBAO_API_KEY is not configured.")

    payload = {
        "model": settings.doubao_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "top_p": top_p,
    }

    headers = {"Authorization": f"Bearer {settings.doubao_api_key}"}
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(settings.doubao_api_url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()


def extract_content(doubao_response: dict[str, Any]) -> str:
    choices = doubao_response.get("choices") or []
    if not choices:
        raise ValueError("Doubao response missing choices.")
    message = (choices[0] or {}).get("message") or {}
    content = message.get("content")
    if not isinstance(content, str) or not content.strip():
        raise ValueError("Doubao response missing content.")
    return content.strip()

