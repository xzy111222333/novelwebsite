import { NextRequest, NextResponse } from 'next/server'
import { createDoubaoAI, WRITING_SYSTEM_PROMPT } from '@/lib/doubao'

interface ContinueRequest {
  content: string
  context?: string
  style?: string
  length?: number
  direction?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContinueRequest = await request.json()
    const { content, context, style, length = 800, direction } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: '现有内容不能为空' },
        { status: 400 }
      )
    }

    const systemPrompt = `${WRITING_SYSTEM_PROMPT}

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

请直接开始续写，不要添加任何解释性文字。`

    let userPrompt = `请续写以下内容：\n\n${content}`
    
    if (context) userPrompt += `\n\n故事背景：${context}`
    if (style) userPrompt += `\n写作风格要求：${style}`
    if (direction) userPrompt += `\n续写方向：${direction}`
    userPrompt += `\n\n请续写约${length}字的内容。`

    const ai = await createDoubaoAI()
    
    const completion = await ai.chat_completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: Math.min(length * 2, 2000),
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    })

    const continuedContent = completion.choices[0]?.message?.content

    if (!continuedContent) {
      throw new Error('AI 续写失败')
    }

    return NextResponse.json({
      success: true,
      content: continuedContent.trim(),
      wordCount: continuedContent.length
    })

  } catch (error) {
    console.error('续写失败:', error)
    
    return NextResponse.json(
      { 
        error: '续写失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}