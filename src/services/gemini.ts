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

export const geminiApi = {
  async generateContent(prompt: string, context?: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured')
    }

    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt

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
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate content from Gemini')
    }

    const data: GeminiResponse = await response.json()
    return data.candidates[0]?.content?.parts[0]?.text || 'Không thể tạo phản hồi'
  },

  async chat(messages: GeminiMessage[]): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured')
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages.map((msg) => ({
          role: msg.role,
          parts: msg.parts,
        })),
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to chat with Gemini')
    }

    const data: GeminiResponse = await response.json()
    return data.candidates[0]?.content?.parts[0]?.text || 'Không thể tạo phản hồi'
  },
}

export default geminiApi
