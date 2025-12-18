import { NextRequest, NextResponse } from 'next/server'
import { createDoubaoAI, WRITING_SYSTEM_PROMPT } from '@/lib/doubao'

const MODE_HINTS: Record<string, string> = {
  polish: '润色现有句子，使语言更加流畅、生动但不改变含义。',
  expand: '在保持原有剧情的前提下，增加细节描写与情绪渲染，扩充段落长度。',
  tighten: '压缩冗余语句，让段落更加紧凑，逻辑更清晰。',
  dialogue: '优化对话表现，使语气更自然，人物性格更鲜明。',
}

const FOCUS_HINTS: Record<string, string> = {
  narrative: '关注叙事节奏，保证铺垫与转折自然。',
  emotion: '强化情绪表达，确保人物心理与情感动机清晰。',
  atmosphere: '增强环境与氛围描写，营造沉浸感。',
  character: '突出人物性格特征与动作细节，强调人物成长。',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, mode = 'polish', focus = [], instructions = '' } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: '原文内容不能为空' },
        { status: 400 }
      )
    }

    const modeHint = MODE_HINTS[mode] ?? MODE_HINTS.polish
    const focusHints = (Array.isArray(focus) ? focus : [])
      .map((item: string) => FOCUS_HINTS[item])
      .filter(Boolean)
      .join('；')

    let instructionBlock = modeHint
    if (focusHints) {
      instructionBlock += `\n重点关注：${focusHints}`
    }
    if (instructions) {
      instructionBlock += `\n额外要求：${instructions}`
    }

    const ai = await createDoubaoAI()
    const completion = await ai.chat_completions.create({
      messages: [
        {
          role: 'system',
          content: `${WRITING_SYSTEM_PROMPT}

## 润色专项要求
你是一名资深小说编辑，擅长优化文本表达与故事节奏。请根据用户指令润色或扩写文本，严格遵循上述写作要求，强去AI味，让文本更自然生动。

返回格式：{"refined": "...", "notes": ["..."]}
- refined 字段：优化后的完整文本，必须符合所有写作要求
- notes 字段：主要修改方向或提示

严禁出现除 JSON 以外的内容。`,
        },
        {
          role: 'user',
          content: `需要润色的文本：\n${content}\n\n润色目标：\n${instructionBlock}\n\n请按照系统要求润色并直接返回 JSON。`,
        },
      ],
      temperature: 0.6,
      max_tokens: 1200,
      top_p: 0.9,
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const trimmed = raw.trim().replace(/```json|```/g, '')

    let parsed: { refined: string; notes?: string[] }
    try {
      parsed = JSON.parse(trimmed)
    } catch {
      throw new Error('AI 返回结果解析失败')
    }

    return NextResponse.json({
      success: true,
      refined: parsed.refined ?? '',
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    })
  } catch (error) {
    console.error('AI 扩写润色失败:', error)
    return NextResponse.json(
      {
        error: '扩写润色失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

