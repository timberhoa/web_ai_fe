import React, { useState, useRef, useEffect } from 'react'
import styles from './EssayWriter.module.scss'
import { geminiApi, GeminiMessage } from '../../../../services/gemini'
import { getErrorMessage } from '../../../../utils/errorHandler'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SYSTEM_PROMPT = `Bạn là chuyên gia viết luận văn học thuật với bằng Tiến sĩ và nhiều năm kinh nghiệm. Nhiệm vụ của bạn là:
- Hướng dẫn xây dựng outline luận văn chi tiết và logic
- Đề xuất cấu trúc luận văn khoa học, chuyên nghiệp
- Tư vấn cách tìm kiếm và trích dẫn tài liệu đúng chuẩn
- Cải thiện văn phong học thuật, chính xác và mạch lạc
- Kiểm tra logic luận chứng và tính nhất quán
- Đề xuất cách triển khai ý tưởng sáng tạo
- Trả lời bằng tiếng Việt, chuyên nghiệp và học thuật`

const EssayWriter: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const geminiMessages: GeminiMessage[] = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))

      geminiMessages.push({
        role: 'user',
        parts: [{ text: userMessage.content }],
      })

      const result = await geminiApi.chat(geminiMessages, SYSTEM_PROMPT)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Quay lại
        </button>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>✍️</div>
          <div>
            <h1>Trợ lý Viết luận văn</h1>
            <p>Hỗ trợ viết outline, tìm tài liệu và cải thiện văn phong học thuật</p>
          </div>
        </div>
      </div>

      <div className={styles.workspace}>
        <div className={styles.chatPanel}>
          {messages.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <h2>Bắt đầu viết luận văn của bạn</h2>
              <p>Chia sẻ chủ đề hoặc yêu cầu hỗ trợ để bắt đầu</p>
              <div className={styles.templates}>
                <div className={styles.template} onClick={() => setInput('Giúp tôi tạo outline cho luận văn về Trí tuệ nhân tạo trong giáo dục')}>
                  <div className={styles.templateIcon}>📋</div>
                  <div className={styles.templateTitle}>Tạo Outline</div>
                  <div className={styles.templateDesc}>Xây dựng cấu trúc luận văn</div>
                </div>
                <div className={styles.template} onClick={() => setInput('Tư vấn cách tìm và trích dẫn tài liệu khoa học')}>
                  <div className={styles.templateIcon}>📚</div>
                  <div className={styles.templateTitle}>Tìm tài liệu</div>
                  <div className={styles.templateDesc}>Hướng dẫn research</div>
                </div>
                <div className={styles.template} onClick={() => setInput('Cải thiện văn phong học thuật cho đoạn văn này')}>
                  <div className={styles.templateIcon}>✨</div>
                  <div className={styles.templateTitle}>Cải thiện văn phong</div>
                  <div className={styles.templateDesc}>Nâng cao chất lượng</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <div className={styles.messagesList}>
            {messages.map((msg) => (
              <div key={msg.id} className={msg.role === 'user' ? styles.userMessage : styles.aiMessage}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageSender}>
                    {msg.role === 'user' ? '👨‍🎓 Bạn' : '🤖 Trợ lý AI'}
                  </span>
                  <span className={styles.messageTimestamp}>
                    {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={styles.messageBody}>{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className={styles.aiMessage}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageSender}>🤖 Trợ lý AI</span>
                </div>
                <div className={styles.messageBody}>
                  <div className={styles.loadingDots}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form className={styles.inputPanel} onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập yêu cầu của bạn hoặc đoạn văn cần cải thiện..."
            disabled={loading}
            rows={4}
          />
          <div className={styles.inputActions}>
            <div className={styles.inputHint}>
              💡 Mẹo: Cung cấp càng nhiều chi tiết càng tốt để nhận hỗ trợ chính xác
            </div>
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? '⏳ Đang xử lý...' : '📤 Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EssayWriter
