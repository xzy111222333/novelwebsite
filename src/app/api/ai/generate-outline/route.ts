import { NextRequest, NextResponse } from 'next/server'
import { createDoubaoAI, WRITING_SYSTEM_PROMPT } from '@/lib/doubao'

interface OutlineRequest {
  title: string
  genre?: string
  mainPlot?: string
  characters?: string[]
  chapterCount?: number
  style?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: OutlineRequest = await request.json()
    const { title, genre, mainPlot, characters, chapterCount = 20, style } = body

    if (!title) {
      return NextResponse.json(
        { error: '小说标题不能为空' },
        { status: 400 }
      )
    }

    const systemPrompt = `${WRITING_SYSTEM_PROMPT}

## 大纲创作专项要求
你是一位专业的小说编辑和剧情设计师，擅长构建引人入胜的故事大纲。请根据用户的要求生成一个详细的小说大纲，严格遵循上述写作要求。

大纲应包含以下结构：
1. 故事主题和核心冲突
2. 主要人物介绍和关系网
3. 整体故事结构（三幕式结构）
4. 分章节详细大纲（每章包含：标题、主要情节、人物发展、悬念设置）
5. 关键转折点和高潮设计
6. 结局设计和主题升华

请确保大纲逻辑清晰，情节紧凑，人物成长合理，具有可读性和商业价值。描述要自然生动，强去AI味。`

    let userPrompt = `请为小说《${title}》生成详细大纲。`
    
    if (genre) userPrompt += `\n小说类型：${genre}`
    if (mainPlot) userPrompt += `\n主要情节：${mainPlot}`
    if (characters && characters.length > 0) userPrompt += `\n主要人物：${characters.join('、')}`
    userPrompt += `\n章节数量：${chapterCount}章`
    if (style) userPrompt += `\n写作风格：${style}`

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
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 0.9
    })

    const outlineData = completion.choices[0]?.message?.content

    if (!outlineData) {
      throw new Error('AI 生成失败')
    }

    return NextResponse.json({
      success: true,
      outline: outlineData.trim()
    })

  } catch (error) {
    console.error('大纲生成失败:', error)
    
    return NextResponse.json(
      { 
        error: '大纲生成失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}