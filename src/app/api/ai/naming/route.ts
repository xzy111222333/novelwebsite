import { NextRequest, NextResponse } from 'next/server'
import { createDoubaoAI, WRITING_SYSTEM_PROMPT } from '@/lib/doubao'

const TYPE_HINTS: Record<string, string> = {
  character: '角色名字，需要考虑性格、身份与时代背景。',
  organization: '组织或势力名，需要体现定位、理念与风格。',
  location: '地点/场景名，需要有空间感与象征意义。',
  artifact: '重要物品、圣物或技能名称，需要突出独特性。',
}

const STYLE_HINTS: Record<string, string> = {
  classical: '古典、雅致、带有诗意或历史感。',
  modern: '现代、简洁、易读易记。',
  fantasy: '奇幻、浪漫、富有想象力。',
  mystery: '悬疑、冷冽、暗示神秘感。',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type = 'character',
      gender = 'any',
      style = 'classical',
      keywords = '',
      background = '',
    } = body

    if (!keywords.trim() && !background.trim()) {
      return NextResponse.json(
        { error: '请提供至少一个关键词或背景描述' },
        { status: 400 }
      )
    }

    const ai = await createDoubaoAI()
    const completion = await ai.chat_completions.create({
      messages: [
        {
          role: 'system',
          content: `${WRITING_SYSTEM_PROMPT}

## 起名专项要求
你是一名专业的中文创意命名顾问，请根据用户需求提供 5 个命名建议，严格遵循上述写作要求。名称要：
1. 符合中文语言习惯
2. 避免AI味，自然贴切
3. 有文化内涵和意境
4. 读起来朗朗上口

返回格式：{"suggestions": [{"name": "...", "meaning": "..."}]}
- name：名称
- meaning：命名思路解释（自然表达，无AI味）

禁止输出除 JSON 外内容。`,
        },
        {
          role: 'user',
          content: `命名对象：${type}\n${TYPE_HINTS[type] ?? ''}\n性别倾向：${gender}\n风格偏好：${STYLE_HINTS[style] ?? ''}\n关键词：${keywords}\n背景描述：${background}\n请按照系统要求命名并直接返回 JSON。`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
      top_p: 0.9,
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    const trimmed = raw.trim().replace(/```json|```/g, '')

    let parsed: { suggestions: Array<{ name: string; meaning: string }> }
    try {
      parsed = JSON.parse(trimmed)
    } catch {
      throw new Error('AI 返回结果解析失败')
    }

    return NextResponse.json({
      success: true,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [],
    })
  } catch (error) {
    console.error('AI 命名生成失败:', error)
    return NextResponse.json(
      {
        error: '生成名称失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}

