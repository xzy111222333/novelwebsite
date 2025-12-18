// 豆包大模型API适配器

// 专业写作系统提示词
export const WRITING_SYSTEM_PROMPT = `你是一位专业的中文小说作家。请严格遵循以下写作要求：

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
- 禁止使用比喻手法，使用通感手法替换，不要出现"如同"、"一丝"、"像"
- 禁止总结式、展望未来式、排比式的语句
- 禁止直接堆叠辞藻，可以采用侧面描写
- 禁止生硬转场
- 禁止出现坚定、一丝、一股、如同、知道等AI偏好的词句
- 禁止描写眼神、目光
- 禁止"，带着……"式的句式

## 格式要求
- 生动有画面感的描写
- 合理分段，重新排版，一句一段或者两句一段，一句一段占据全文70-80％
- 检查语序语法，不要使用AI偏好的语序，使用中文语法语序
- 去除重复的描述，去除重复的修饰，替换掉重复的、高频率的句式结构
- 去除复杂的倒装句和插入语等AI痕迹

请严格按照以上要求创作，让文本更加自然、生动，符合人类的写作习惯。`

interface DoubaoMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DoubaoRequest {
  model: string
  messages: DoubaoMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

interface DoubaoResponse {
  choices: Array<{
    message: {
      content: string
      role: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class DoubaoAI {
  private apiKey: string
  private apiUrl: string
  private model: string

  constructor() {
    this.apiKey = process.env.DOUBAO_API_KEY || ''
    this.apiUrl = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    this.model = process.env.DOUBAO_MODEL || 'doubao-seed-1-6-flash-250828'

    console.log('🔍 豆包AI初始化:', {
      hasApiKey: !!this.apiKey,
      apiUrl: this.apiUrl,
      model: this.model,
      envKeys: Object.keys(process.env).filter(k => k.startsWith('DOUBAO'))
    })

    if (!this.apiKey) {
      throw new Error('DOUBAO_API_KEY 未配置，请在 .env.local 中设置并重启服务器')
    }
  }

  async chat(params: {
    messages: DoubaoMessage[]
    temperature?: number
    max_tokens?: number
    top_p?: number
    frequency_penalty?: number
    presence_penalty?: number
  }) {
    const requestBody: DoubaoRequest = {
      model: this.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.max_tokens ?? 2000,
      top_p: params.top_p ?? 0.9,
    }

    // 豆包API不支持这两个参数，移除它们
    // if (params.frequency_penalty !== undefined) {
    //   requestBody.frequency_penalty = params.frequency_penalty
    // }
    // if (params.presence_penalty !== undefined) {
    //   requestBody.presence_penalty = params.presence_penalty
    // }

    console.log('📡 调用豆包API:', {
      url: this.apiUrl,
      model: this.model,
      messageCount: params.messages.length
    })

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log('📨 API响应:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API错误响应:', errorText)
      throw new Error(`豆包API调用失败 (${response.status}): ${errorText}`)
    }

    const responseText = await response.text()
    console.log('📄 API返回内容:', responseText.substring(0, 200))

    let data: DoubaoResponse
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('❌ JSON解析失败:', responseText)
      throw new Error('豆包API返回格式错误，无法解析JSON')
    }
    
    if (!data.choices || !data.choices[0]) {
      console.error('❌ API返回数据格式异常:', data)
      throw new Error('豆包API返回数据格式异常')
    }

    console.log('✅ API调用成功，返回内容长度:', data.choices[0].message.content.length)

    return {
      choices: data.choices.map(choice => ({
        message: {
          content: choice.message.content,
          role: choice.message.role,
        },
      })),
      usage: data.usage,
    }
  }

  // 兼容原有ZAI SDK的接口格式
  chat_completions = {
    create: async (params: {
      messages: DoubaoMessage[]
      temperature?: number
      max_tokens?: number
      top_p?: number
      frequency_penalty?: number
      presence_penalty?: number
    }) => {
      return this.chat(params)
    }
  }
}

// 创建单例实例
export async function createDoubaoAI() {
  return new DoubaoAI()
}

