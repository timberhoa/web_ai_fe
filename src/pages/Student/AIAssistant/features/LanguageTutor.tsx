import React, { useState, useRef, useEffect } from 'react'
import styles from './LanguageTutor.module.scss'
import { geminiApi, GeminiMessage } from '../../../../services/gemini'
import { getErrorMessage } from '../../../../utils/errorHandler'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SYSTEM_PROMPT = `Bạn là giáo viên tiếng Anh chuyên nghiệp với chứng chỉ TESOL. Nhiệm vụ của bạn là:
- Giải thích ngữ pháp một cách dễ hiểu với ví dụ cụ thể
- Hướng dẫn cách sử dụng từ vựng đúng ngữ cảnh
- Sửa lỗi và cải thiện câu văn tiếng Anh
- Luyện tập kỹ năng giao tiếp thực tế
- Đưa ra bài tập thực hành phù hợp
- Giải thích sự khác biệt giữa các cấu trúc tương tự
- Trả lời bằng tiếng Việt, giải thích rõ ràng với nhiều ví dụ tiếng Anh`

const LanguageTutor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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

  const quickTopics = [
    { icon: '📖', title: 'Ngữ pháp', query: 'Giải thích sự khác biệt giữa Present Perfect và Past Simple' },
    { icon: '💬', title: 'Giao tiếp', query: 'Cách giao tiếp tiếng Anh trong tình huống mua sắm' },
    { icon: '✍️', title: 'Viết', query: 'Cách viết email chuyên nghiệp bằng tiếng Anh' },
    { icon: '🎧', title: 'Từ vựng', query: 'Từ vựng tiếng Anh về công nghệ thông tin' },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
        <div className={styles.topBarTitle}>
          <span className={styles.flag}>🇬🇧</span>
          <h1>English Tutor</h1>
          <span className={styles.badge}>AI-Powered</span>
        </div>
      </div>

      <div className={styles.mainContent}>
        {messages.length === 0 && !loading && (
          <div className={styles.welcomeScreen}>
            <div className={styles.welcomeCard}>
              <div className={styles.welcomeIcon}>🎓</div>
              <h2>Welcome to English Learning!</h2>
              <p>Chọn chủ đề hoặc đặt câu hỏi để bắt đầu học</p>
            </div>

            <div className={styles.topicsGrid}>
              {quickTopics.map((topic, index) => (
                <div
                  key={index}
                  className={styles.topicCard}
                  onClick={() => setInput(topic.query)}
                >
                  <div className={styles.topicIcon}>{topic.icon}</div>
                  <div className={styles.topicTitle}>{topic.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorAlert}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {error}
          </div>
        )}

        <div className={styles.chatMessages}>
          {messages.map((msg) => (
            <div key={msg.id} className={styles.messageRow}>
              <div className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                <div className={styles.bubbleHeader}>
                  <span className={styles.bubbleAvatar}>
                    {msg.role === 'user' ? '👨‍💼' : '👨‍🏫'}
                  </span>
                  <span className={styles.bubbleName}>
                    {msg.role === 'user' ? 'You' : 'Teacher'}
                  </span>
                  <span className={styles.bubbleTime}>
                    {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={styles.bubbleText}>{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className={styles.messageRow}>
              <div className={styles.aiBubble}>
                <div className={styles.bubbleHeader}>
                  <span className={styles.bubbleAvatar}>👨‍🏫</span>
                  <span className={styles.bubbleName}>Teacher</span>
                </div>
                <div className={styles.bubbleText}>
                  <div className={styles.typingAnimation}>
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className={styles.inputBar} onSubmit={handleSubmit}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question in English or Vietnamese..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? '⏳' : '🚀'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LanguageTutor
