import React, { useState, useRef, useEffect } from 'react'
import styles from './CareerAdvice.module.scss'
import { geminiApi, GeminiMessage } from '../../../../services/gemini'
import { getErrorMessage } from '../../../../utils/errorHandler'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SYSTEM_PROMPT = `Bạn là chuyên gia tư vấn hướng nghiệp với 20 năm kinh nghiệm. Nhiệm vụ của bạn là:
- Phân tích điểm mạnh và cơ hội nghề nghiệp phù hợp
- Đề xuất các vị trí công việc cụ thể và thực tế
- Tư vấn kỹ năng cần phát triển để thành công
- Đưa ra lộ trình phát triển sự nghiệp rõ ràng
- Chia sẻ kinh nghiệm và lời khuyên thực tế
- Khuyến khích và động viên sinh viên
- Trả lời bằng tiếng Việt, chi tiết và dễ hiểu`

const CareerAdvice: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatBodyRef = useRef<HTMLDivElement>(null)

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className={styles.fullScreenChat}>
      <div className={styles.chatHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Quay lại
        </button>
        <div className={styles.chatHeaderInfo}>
          <div className={styles.chatHeaderIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h2 className={styles.chatHeaderTitle}>Tư vấn hướng nghiệp</h2>
            <p className={styles.chatHeaderDesc}>Khám phá con đường sự nghiệp phù hợp với bạn</p>
          </div>
        </div>
      </div>

      <div className={styles.chatBody} ref={chatBodyRef}>
        {messages.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Bắt đầu hành trình sự nghiệp</h3>
            <p>Chia sẻ về ngành học, sở thích và mục tiêu của bạn để nhận tư vấn</p>
            <div className={styles.suggestions}>
              <button onClick={() => setInput('Tôi đang học ngành Công nghệ thông tin, thích lập trình web. Tư vấn cho tôi về con đường sự nghiệp.')}>
                Tư vấn ngành IT
              </button>
              <button onClick={() => setInput('Tôi muốn trở thành Data Scientist. Cần chuẩn bị những gì?')}>
                Lộ trình Data Science
              </button>
              <button onClick={() => setInput('Kỹ năng nào quan trọng nhất cho sinh viên mới ra trường?')}>
                Kỹ năng cần thiết
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={message.role === 'user' ? styles.userMessage : styles.aiMessage}
            >
              <div className={styles.messageAvatar}>
                {message.role === 'user' ? 'Bạn' : 'AI'}
              </div>
              <div className={styles.messageContent}>
                <div className={styles.messageText}>{message.content}</div>
                <div className={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className={styles.aiMessage}>
              <div className={styles.messageAvatar}>AI</div>
              <div className={styles.messageContent}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className={styles.chatInput} onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Chia sẻ về ngành học, sở thích và mục tiêu của bạn..."
          rows={1}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={styles.spinner}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  )
}

export default CareerAdvice
