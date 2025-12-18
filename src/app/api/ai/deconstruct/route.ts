import { NextRequest, NextResponse } from 'next/server'
import { createDoubaoAI, WRITING_SYSTEM_PROMPT } from '@/lib/doubao'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, scope = 'chapter', title } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: '需要解析的文本不能为空' },
        { status: 400 }
      )
    }

    const ai = await createDoubaoAI()
    const completion = await ai.chat_completions.create({
      messages: [
        {
          role: 'system',
          content: `${WRITING_SYSTEM_PROMPT}

## 文本拆解专项要求
你是一名资深编剧教练，擅长拆解小说文本。请根据用户提供的文本生成拆书报告，严格遵循上述写作要求，分析时注重：
1. 识别文本中的AI味和不自然表达
2. 分析是否符合人类写作习惯
3. 评估语言的生动性和自然度

返回格式：{"summary": "...", "plotBeats": ["..."], "characters": [{"name": "...", "insight": "..."}], "themes": ["..."], "suggestions": ["..."]}
- summary：内容概要（自然表达，无AI味）
- plotBeats：情节节拍分析
- characters：人物分析
- themes：主题分析
- suggestions：改进建议（重点关注去AI味和提升自然度）

不要输出除 JSON 以外的内容。`,
        },
        {
          role: 'user',
          content: `作品标题：${title ?? '未命名作品'}\n解析范围：${scope}\n文本内容：\n${content}\n\n请按照系统要求分析并直接返回符合要求的 JSON。`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1600,
      top_p: 0.9,
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const trimmed = raw.trim().replace(/```json|```/g, '')

    let parsed: {
      summary: string
      plotBeats?: string[]
      characters?: Array<{ name: string; insight: string }>
      themes?: string[]
      suggestions?: string[]
    }

    try {
      parsed = JSON.parse(trimmed)
    } catch {
      throw new Error('AI 返回结果解析失败')
    }

    return NextResponse.json({
      success: true,
      analysis: {
        summary: parsed.summary ?? '',
        plotBeats: Array.isArray(parsed.plotBeats) ? parsed.plotBeats : [],
        characters: Array.isArray(parsed.characters) ? parsed.characters : [],
        themes: Array.isArray(parsed.themes) ? parsed.themes : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      },
    })
  } catch (error) {
    console.error('AI 拆书解析失败:', error)
    return NextResponse.json(
      {
        error: '拆书解析失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

