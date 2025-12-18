import { NextRequest, NextResponse } from 'next/server'
import { createDoubaoAI, WRITING_SYSTEM_PROMPT } from '@/lib/doubao'

interface WorldRequest {
  worldName?: string
  worldType?: string
  timePeriod?: string
  technology?: string
  magic?: string
  geography?: string
  culture?: string
  politics?: string
  religion?: string
  additional?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: WorldRequest = await request.json()
    const { 
      worldName, 
      worldType, 
      timePeriod, 
      technology, 
      magic, 
      geography, 
      culture, 
      politics, 
      religion, 
      additional 
    } = body

    const systemPrompt = `${WRITING_SYSTEM_PROMPT}

## 世界观构建专项要求
你是一位专业的世界观设计师，擅长构建完整、丰富的虚构世界。请根据用户的要求生成一个详细的世界观设定，严格遵循上述写作要求。

世界观设定应包含以下方面：
1. 基础设定：世界名称、基本概念、核心法则
2. 地理环境：大陆分布、气候特征、重要地点
3. 历史背景：重要历史事件、时代变迁、传说故事
4. 社会结构：政治制度、社会阶层、法律体系
5. 文化特色：语言文字、宗教信仰、艺术传统、风俗习惯
6. 经济体系：货币制度、贸易方式、主要产业
7. 科技水平：技术发展程度、重要发明、科技限制
8. 特殊设定：魔法系统、超自然力量、特殊种族等

请确保世界观设定逻辑自洽，细节丰富，具有深度和可扩展性。描述要自然生动，强去AI味。`

    let userPrompt = '请生成一个完整的世界观设定。'
    
    if (worldName) userPrompt += `\n世界名称：${worldName}`
    if (worldType) userPrompt += `\n世界类型：${worldType}`
    if (timePeriod) userPrompt += `\n时代背景：${timePeriod}`
    if (geography) userPrompt += `\n地理环境：${geography}`
    if (technology) userPrompt += `\n科技水平：${technology}`
    if (magic) userPrompt += `\n魔法系统：${magic}`
    if (culture) userPrompt += `\n文化特色：${culture}`
    if (politics) userPrompt += `\n政治体系：${politics}`
    if (religion) userPrompt += `\n宗教信仰：${religion}`
    if (additional) userPrompt += `\n其他设定：${additional}`

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
      max_tokens: 3000,
      top_p: 0.9
    })

    const worldData = completion.choices[0]?.message?.content

    if (!worldData) {
      throw new Error('AI 生成失败')
    }

    return NextResponse.json({
      success: true,
      world: worldData.trim()
    })

  } catch (error) {
    console.error('世界观生成失败:', error)
    
    return NextResponse.json(
      { 
        error: '世界观生成失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}