import { NextRequest, NextResponse } from 'next/server'
import { createDoubaoAI, WRITING_SYSTEM_PROMPT } from '@/lib/doubao'

interface GenerateRequest {
  prompt: string
  genre?: string
  style?: string
  length?: string
}

const genreMap: Record<string, string> = {
  fantasy: '婵傚洤澶熼悳鍕',
  romance: '闁棄绔剁懛鈧幆锟�',
  scifi: '缁夋垵澶熼張顏呮降',
  mystery: '閹剛鏋掗幒銊ф倞',
  history: '閸樺棗褰堕弸鍓佲敄',
  wuxia: '濮濓缚绶烘禒娆庣泛'
}

const styleMap: Record<string, string> = {
  descriptive: '缂佸棜鍚囬幓蹇撳晸',
  dialogue: '鐎电鐦芥す鍗炲З',
  action: '閸斻劋缍旈崷娲桨',
  emotional: '閹懏鍔呮稉鏉跨槣',
  humorous: '楠炰粙绮搴ゅ彯'
}

const lengthMap: Record<string, { min: number; max: number; description: string }> = {
  short: { min: 1000, max: 3000, description: '閻厾鐦�' },
  medium: { min: 3000, max: 8000, description: '娑擃厾鐦�' },
  long: { min: 8000, max: 15000, description: '闂€璺ㄧ槖' }
}

// src/app/api/novel/generate/route.ts - 修改 POST 方法
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { prompt, genre, style, length } = body

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: '请输入创作提示' },
        { status: 400 }
      )
    }

    // 创建流式响应
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const ai = await createDoubaoAI()
          
          // 构建提示词（同上）
          let systemPrompt = `${WRITING_SYSTEM_PROMPT}\n\n## 小说创作专项要求...`
          
          const completion = await ai.chat_completions.create({
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: `创作主题：${prompt}`
              }
            ],
            temperature: 0.8,
            max_tokens: length === 'long' ? 8000 : length === 'short' ? 2000 : 4000,
            top_p: 0.9,
            stream: true // 启用流式传输
          })

          // 流式处理响应
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          
          controller.close()
        } catch (error) {
          console.error('AI 生成失败:', error)
          controller.enqueue(encoder.encode('\n\n【生成失败，请重试】'))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('小说生成失败:', error)
    return NextResponse.json(
      {
        error: '小说生成失败，请稍后重试',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI 鐏忓繗顕╅悽鐔稿灇 API',
    version: '1.0.0',
    endpoints: {
      'POST /api/novel/generate': '閻㈢喐鍨氱亸蹇氼嚛閸愬懎顔�'
    },
    parameters: {
      prompt: '閸掓稐缍旈幓鎰仛 (韫囧懘娓�)',
      genre: '鐏忓繗顕╃猾璇茬€� (閸欘垶鈧拷)',
      style: '閸愭瑤缍旀搴㈢壐 (閸欘垶鈧拷)',
      length: '缁″洤绠欓梹鍨 (閸欘垶鈧拷)'
    }
  })
}