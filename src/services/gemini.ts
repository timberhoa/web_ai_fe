const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

export type GeminiMessage = {
  role: 'user' | 'model'
  parts: { text: string }[]
}

export type GeminiResponse = {
  candidates: {
    content: {
      parts: { text: string }[]
    }
  }[]
}

// System prompt để loại bỏ các ký tự đặc biệt
const CLEAN_FORMAT_INSTRUCTION = `
Quy tắc định dạng văn bản:
- KHÔNG sử dụng các ký tự đặc biệt như: *, **, ***, #, ##, ###, _, __, ~~~
- KHÔNG sử dụng markdown formatting
- Chỉ sử dụng văn bản thuần túy với các ký tự thông thường
- Sử dụng số thứ tự (1., 2., 3.) để liệt kê
- Sử dụng dấu gạch đầu dòng (-) nếu cần
- Xuống dòng để phân đoạn rõ ràng
- Viết bằng tiếng Việt tự nhiên, dễ đọc
`

export const geminiApi = {
  async generateContent(prompt: string, systemPrompt?: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured')
    }

    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\n${CLEAN_FORMAT_INSTRUCTION}\n\n${prompt}` 
      : `${CLEAN_FORMAT_INSTRUCTION}\n\n${prompt}`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Failed to generate content from Gemini')
    }

    const data: GeminiResponse = await response.json()
    const text = data.candidates[0]?.content?.parts[0]?.text || 'Không thể tạo phản hồi'
    
    // Làm sạch các ký tự đặc biệt còn sót lại
    return text
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '')
      .replace(/___/g, '')
      .replace(/__/g, '')
      .replace(/~~~/g, '')
      .replace(/~~/g, '')
      .trim()
  },

  async chat(messages: GeminiMessage[], systemPrompt?: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured')
    }

    // Thêm system prompt vào tin nhắn đầu tiên
    const enhancedMessages = [...messages]
    if (systemPrompt && enhancedMessages.length > 0) {
      enhancedMessages[0] = {
        ...enhancedMessages[0],
        parts: [
          { 
            text: `${systemPrompt}\n\n${CLEAN_FORMAT_INSTRUCTION}\n\n${enhancedMessages[0].parts[0].text}` 
          }
        ]
      }
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: enhancedMessages.map((msg) => ({
          role: msg.role,
          parts: msg.parts,
        })),
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Failed to chat with Gemini')
    }

    const data: GeminiResponse = await response.json()
    const text = data.candidates[0]?.content?.parts[0]?.text || 'Không thể tạo phản hồi'
    
    // Làm sạch các ký tự đặc biệt còn sót lại
    return text
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '')
      .replace(/___/g, '')
      .replace(/__/g, '')
      .replace(/~~~/g, '')
      .replace(/~~/g, '')
      .trim()
  },
}

export default geminiApi
