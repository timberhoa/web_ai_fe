import React, { useState, useRef, useEffect } from 'react'
import styles from './HomeworkHelp.module.scss'
import { geminiApi, GeminiMessage } from '../../../../services/gemini'
import { getErrorMessage } from '../../../../utils/errorHandler'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SYSTEM_PROMPT = `Bạn là giáo viên dạy kèm chuyên nghiệp với nhiều năm kinh nghiệm. Nhiệm vụ của bạn là:
- Giải thích khái niệm một cách dễ hiểu, từng bước một
- Hướng dẫn chi tiết cách giải quyết vấn đề
- Đưa ra ví dụ minh họa cụ thể và thực tế
- Giải thích tại sao cách làm đó đúng
- Gợi ý cách tránh sai lầm thường gặp
- Khuyến khích tư duy độc lập của học sinh
- Trả lời bằng tiếng Việt, chi tiết như đang dạy trực tiếp`

const HomeworkHelp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 9H8" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h2 className={styles.chatHeaderTitle}>Hỗ trợ bài tập</h2>
            <p className={styles.chatHeaderDesc}>Giải đáp thắc mắc và hướng dẫn cách làm bài tập, đồ án</p>
          </div>
        </div>
      </div>

      <div className={styles.chatBody} ref={chatBodyRef}>
        {messages.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3>Sẵn sàng giúp bạn</h3>
            <p>Hãy đặt câu hỏi về bài tập hoặc vấn đề học tập của bạn</p>
            <div className={styles.suggestions}>
              <button onClick={() => setInput('Giải thích thuật toán sắp xếp nhanh (Quick Sort)')}>
                Giải thích thuật toán
              </button>
              <button onClick={() => setInput('Hướng dẫn giải phương trình bậc 2')}>
                Giải toán học
              </button>
              <button onClick={() => setInput('Phân tích cấu trúc dữ liệu Stack và Queue')}>
                Cấu trúc dữ liệu
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
          placeholder="Nhập câu hỏi về bài tập của bạn..."
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

export default HomeworkHelp
