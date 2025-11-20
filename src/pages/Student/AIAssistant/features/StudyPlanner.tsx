import React, { useState, useRef, useEffect } from 'react'
import styles from './StudyPlanner.module.scss'
import { geminiApi, GeminiMessage } from '../../../../services/gemini'
import { getErrorMessage } from '../../../../utils/errorHandler'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SYSTEM_PROMPT = `Bạn là chuyên gia lập kế hoạch học tập với kinh nghiệm tư vấn cho hàng nghìn sinh viên. Nhiệm vụ của bạn là:
- Tạo lịch trình học tập chi tiết, khoa học và thực tế
- Phân bổ thời gian hợp lý cho từng môn học và hoạt động
- Đề xuất phương pháp học hiệu quả dựa trên khoa học
- Tư vấn kỹ thuật ghi nhớ, ôn tập và tập trung
- Cân bằng giữa học tập, nghỉ ngơi và giải trí
- Điều chỉnh kế hoạch phù hợp với từng cá nhân
- Trả lời bằng tiếng Việt, cụ thể và dễ áp dụng ngay`

const StudyPlanner: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
      <div className={styles.sidebar}>
        <button className={styles.backButton} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Quay lại
        </button>

        <div className={styles.sidebarHeader}>
          <div className={styles.icon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h2>Lập kế hoạch học tập</h2>
          <p>Tạo lịch trình học tập khoa học</p>
        </div>

        <div className={styles.quickActions}>
          <h3>Gợi ý nhanh</h3>
          <button onClick={() => setInput('Tạo kế hoạch ôn thi 2 tuần cho 3 môn: Toán, Lý, Hóa')}>
            📚 Kế hoạch ôn thi
          </button>
          <button onClick={() => setInput('Lập lịch học 1 tuần cân bằng giữa học và nghỉ ngơi')}>
            ⏰ Lịch học hàng tuần
          </button>
          <button onClick={() => setInput('Phương pháp Pomodoro để tập trung học tập')}>
            🎯 Kỹ thuật học tập
          </button>
          <button onClick={() => setInput('Cách ghi nhớ kiến thức lâu dài và hiệu quả')}>
            🧠 Kỹ thuật ghi nhớ
          </button>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{messages.filter(m => m.role === 'user').length}</span>
            <span className={styles.statLabel}>Câu hỏi</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{messages.filter(m => m.role === 'assistant').length}</span>
            <span className={styles.statLabel}>Kế hoạch</span>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.chatArea}>
          {messages.length === 0 && !loading && (
            <div className={styles.welcome}>
              <div className={styles.welcomeIcon}>📅</div>
              <h3>Chào mừng đến với Trợ lý Lập kế hoạch</h3>
              <p>Hãy cho tôi biết mục tiêu học tập của bạn để tạo kế hoạch phù hợp</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {error}
            </div>
          )}

          <div className={styles.messages}>
            {messages.map((msg) => (
              <div key={msg.id} className={msg.role === 'user' ? styles.userMsg : styles.aiMsg}>
                <div className={styles.msgAvatar}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className={styles.msgBubble}>
                  <div className={styles.msgContent}>{msg.content}</div>
                  <div className={styles.msgTime}>
                    {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className={styles.aiMsg}>
                <div className={styles.msgAvatar}>🤖</div>
                <div className={styles.msgBubble}>
                  <div className={styles.typing}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form className={styles.inputArea} onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập mục tiêu học tập của bạn..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default StudyPlanner
