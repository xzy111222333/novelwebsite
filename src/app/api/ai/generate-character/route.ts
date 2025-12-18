import { NextRequest, NextResponse } from 'next/server'
import { createDoubaoAI, WRITING_SYSTEM_PROMPT } from '@/lib/doubao'

interface CharacterRequest {
  name?: string
  role?: string
  personality?: string
  background?: string
  storyContext?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CharacterRequest = await request.json()
    const { name, role, personality, background, storyContext } = body

    const systemPrompt = `${WRITING_SYSTEM_PROMPT}

## 角色设定专项要求
你是一位专业的小说角色设计师，擅长创造立体、生动的小说人物。请根据用户的要求生成一个详细的角色设定，严格遵循上述写作要求。

角色设定应包含以下方面：
1. 基本信息：姓名、年龄、性别、外貌特征
2. 性格特点：详细描述性格特征、优点、缺点
3. 背景故事：成长经历、家庭背景、重要事件
4. 技能能力：专业技能、特长、弱点
5. 人物关系：与主要角色的关系
6. 内心世界：价值观、目标、恐惧、渴望
7. 角色弧光：在故事中的成长变化

请确保角色设定详细、合理，具有文学性和可塑性，描写自然生动，强去AI味。`

    let userPrompt = '请生成一个小说角色设定。'
    
    if (name) userPrompt += `\n角色姓名：${name}`
    if (role) userPrompt += `\n角色定位：${role}`
    if (personality) userPrompt += `\n性格特征：${personality}`
    if (background) userPrompt += `\n背景要求：${background}`
    if (storyContext) userPrompt += `\n故事背景：${storyContext}`

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
      max_tokens: 2000,
      top_p: 0.9
    })

    const characterData = completion.choices[0]?.message?.content

    if (!characterData) {
      throw new Error('AI 生成失败')
    }

    return NextResponse.json({
      success: true,
      character: characterData.trim()
    })

  } catch (error) {
    console.error('角色生成失败:', error)
    
    return NextResponse.json(
      { 
        error: '角色生成失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}