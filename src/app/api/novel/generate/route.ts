import { NextRequest, NextResponse } from "next/server";
import { createDoubaoAI, WRITING_SYSTEM_PROMPT } from "@/lib/doubao";

interface GenerateRequest {
  prompt: string;
  genre?: string;
  style?: string;
  length?: string;
}

const GENRE_MAP: Record<string, string> = {
  fantasy: "奇幻玄幻",
  romance: "都市言情",
  scifi: "科幻未来",
  mystery: "悬疑推理",
  history: "历史架空",
  wuxia: "武侠仙侠",
};

const STYLE_MAP: Record<string, string> = {
  descriptive: "细腻描写",
  dialogue: "对话驱动",
  action: "动作场面",
  emotional: "情感丰富",
  humorous: "幽默风趣",
};

const LENGTH_MAP: Record<string, { min: number; max: number; description: string; maxTokens: number }> = {
  short: { min: 1000, max: 3000, description: "短篇（1000-3000字）", maxTokens: 2000 },
  medium: { min: 3000, max: 8000, description: "中篇（3000-8000字）", maxTokens: 4000 },
  long: { min: 8000, max: 15000, description: "长篇（8000-15000字）", maxTokens: 8000 },
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, genre = "fantasy", style = "descriptive", length = "medium" } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ success: false, error: "创作提示不能为空" }, { status: 400 });
    }

    const genreLabel = GENRE_MAP[genre] ?? GENRE_MAP.fantasy;
    const styleLabel = STYLE_MAP[style] ?? STYLE_MAP.descriptive;
    const lengthConfig = LENGTH_MAP[length] ?? LENGTH_MAP.medium;

    const systemPrompt = `${WRITING_SYSTEM_PROMPT}

## 章节草稿生成专项要求
你是一位专业的中文网络小说作者，请根据用户提供的创作提示生成一段“可直接作为章节初稿”的正文，要求：
1. 结构完整：有开场、推进、转折/冲突、收束（可留悬念）
2. 语言自然：强去 AI 味，符合中文表达习惯
3. 节奏明确：避免流水账，推进剧情
4. 适度分段：一句一段或两句一段占比 70%+

题材：${genreLabel}
风格：${styleLabel}
篇幅：${lengthConfig.description}（目标约 ${lengthConfig.min}-${lengthConfig.max} 字）

只输出正文内容，不要输出标题、不要输出解释。`;

    const userPrompt = `创作提示/剧情梗概：\n${prompt}\n\n请输出正文。`;

    const ai = await createDoubaoAI();
    const completion = await ai.chat_completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: lengthConfig.maxTokens,
      top_p: 0.9,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("AI 生成失败");
    }

    return NextResponse.json({
      success: true,
      content,
      metadata: {
        wordCount: content.length,
        genre: genreLabel,
        style: styleLabel,
        length: lengthConfig.description,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "生成章节草稿失败，请稍后重试",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AI 章节草稿生成 API",
    version: "1.0.0",
    endpoints: {
      "POST /api/novel/generate": "生成章节草稿正文",
    },
  });
}

