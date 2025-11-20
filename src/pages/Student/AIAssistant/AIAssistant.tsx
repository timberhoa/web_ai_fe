import React, { useState, useRef, useEffect } from 'react'
import styles from './AIAssistant.module.scss'
import { geminiApi, GeminiMessage } from '../../../services/gemini'
import { getErrorMessage } from '../../../utils/errorHandler'
import CareerAdvice from './features/CareerAdvice'
import HomeworkHelp from './features/HomeworkHelp'
import StudyPlanner from './features/StudyPlanner'
import EssayWriter from './features/EssayWriter'
import LanguageTutor from './features/LanguageTutor'
import CodeHelper from './features/CodeHelper'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type AIFeature = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  systemPrompt: string
  placeholder: string
  color: string
}

const AI_FEATURES: AIFeature[] = [
  {
    id: 'career',
    title: 'Tư vấn hướng nghiệp',
    description: 'Nhận tư vấn về con đường sự nghiệp phù hợp với ngành học và sở thích của bạn',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    systemPrompt: `Bạn là chuyên gia tư vấn hướng nghiệp với 20 năm kinh nghiệm. Nhiệm vụ của bạn là:
- Phân tích điểm mạnh và cơ hội nghề nghiệp phù hợp
- Đề xuất các vị trí công việc cụ thể
- Tư vấn kỹ năng cần phát triển
- Đưa ra lộ trình phát triển sự nghiệp thực tế
- Trả lời bằng tiếng Việt, chi tiết và dễ hiểu`,
    placeholder: 'Ví dụ: Tôi đang học ngành Công nghệ thông tin, thích lập trình web...',
    color: '#6366f1',
  },
  {
    id: 'homework',
    title: 'Hỗ trợ bài tập',
    description: 'Giải đáp thắc mắc và hướng dẫn cách làm bài tập, đồ án',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 13H8" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 17H8" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 9H8" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    systemPrompt: `Bạn là giáo viên dạy kèm chuyên nghiệp. Nhiệm vụ của bạn là:
- Giải thích khái niệm một cách dễ hiểu
- Hướng dẫn từng bước để giải quyết vấn đề
- Đưa ra ví dụ minh họa cụ thể
- Giải thích tại sao cách làm đó đúng
- Gợi ý cách tránh sai lầm thường gặp
- Trả lời bằng tiếng Việt, chi tiết như đang dạy trực tiếp`,
    placeholder: 'Ví dụ: Giải thích thuật toán sắp xếp nhanh (Quick Sort)...',
    color: '#f59e0b',
  },
  {
    id: 'study',
    title: 'Lập kế hoạch học tập',
    description: 'Tạo lịch trình học tập hiệu quả và phương pháp ôn thi',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    systemPrompt: `Bạn là chuyên gia lập kế hoạch học tập. Nhiệm vụ của bạn là:
- Tạo lịch trình học tập chi tiết và khoa học
- Phân bổ thời gian hợp lý cho từng môn học
- Đề xuất phương pháp học hiệu quả
- Tư vấn kỹ thuật ghi nhớ và ôn tập
- Cân bằng giữa học tập và nghỉ ngơi
- Trả lời bằng tiếng Việt, cụ thể và dễ áp dụng`,
    placeholder: 'Ví dụ: Tôi có 2 tuần để ôn thi 3 môn: Toán, Lý, Hóa...',
    color: '#10b981',
  },
  {
    id: 'essay',
    title: 'Viết luận văn',
    description: 'Hỗ trợ viết outline, tìm tài liệu và cải thiện văn phong',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    systemPrompt: `Bạn là chuyên gia viết luận văn học thuật. Nhiệm vụ của bạn là:
- Hướng dẫn xây dựng outline chi tiết
- Đề xuất cấu trúc luận văn khoa học
- Tư vấn cách tìm và trích dẫn tài liệu
- Cải thiện văn phong học thuật
- Kiểm tra logic và tính mạch lạc
- Trả lời bằng tiếng Việt, chuyên nghiệp và học thuật`,
    placeholder: 'Ví dụ: Tôi cần viết luận văn về Trí tuệ nhân tạo trong giáo dục...',
    color: '#8b5cf6',
  },
  {
    id: 'language',
    title: 'Học ngoại ngữ',
    description: 'Luyện tập tiếng Anh, dịch thuật và cải thiện kỹ năng giao tiếp',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M2 12H22" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    systemPrompt: `Bạn là giáo viên tiếng Anh chuyên nghiệp. Nhiệm vụ của bạn là:
- Giải thích ngữ pháp một cách dễ hiểu
- Hướng dẫn cách sử dụng từ vựng đúng ngữ cảnh
- Sửa lỗi và cải thiện câu văn
- Luyện tập kỹ năng giao tiếp
- Đưa ra ví dụ thực tế
- Trả lời bằng tiếng Việt, giải thích rõ ràng với ví dụ tiếng Anh`,
    placeholder: 'Ví dụ: Giải thích sự khác biệt giữa Present Perfect và Past Simple...',
    color: '#06b6d4',
  },
  {
    id: 'code',
    title: 'Lập trình & Debug',
    description: 'Giải thích code, tìm lỗi và đề xuất cải thiện thuật toán',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    systemPrompt: `Bạn là chuyên gia lập trình với kinh nghiệm nhiều năm. Nhiệm vụ của bạn là:
- Giải thích code một cách dễ hiểu
- Tìm và sửa lỗi trong code
- Đề xuất cải thiện hiệu suất và cấu trúc
- Giải thích thuật toán và độ phức tạp
- Đưa ra best practices
- Trả lời bằng tiếng Việt, giải thích kỹ thuật rõ ràng`,
    placeholder: 'Ví dụ: Giải thích đoạn code Python này hoặc tìm lỗi trong code...',
    color: '#ef4444',
  },
]

const AIAssistant: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(null)
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
    if (!input.trim() || !selectedFeature || loading) return

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
      // Chuyển đổi messages sang format Gemini
      const geminiMessages: GeminiMessage[] = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))

      // Thêm tin nhắn mới
      geminiMessages.push({
        role: 'user',
        parts: [{ text: userMessage.content }],
      })

      const result = await geminiApi.chat(geminiMessages, selectedFeature.systemPrompt)

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

  const handleFeatureSelect = (feature: AIFeature) => {
    setSelectedFeature(feature)
    setMessages([])
    setError(null)
    setInput('')
  }

  const handleBack = () => {
    setSelectedFeature(null)
    setMessages([])
    setError(null)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className={styles.page}>
      {!selectedFeature ? (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>Trợ lý AI</h1>
            <p className={styles.subtitle}>Sử dụng AI để hỗ trợ học tập và phát triển kỹ năng</p>
          </div>

          <div className={styles.featuresGrid}>
            {AI_FEATURES.map((feature) => (
              <div
                key={feature.id}
                className={styles.featureCard}
                onClick={() => handleFeatureSelect(feature)}
                style={{ borderTopColor: feature.color }}
              >
                <div className={styles.featureIcon} style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
                <div className={styles.featureAction} style={{ color: feature.color }}>
                  <span>Bắt đầu</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : selectedFeature.id === 'career' ? (
        <CareerAdvice onBack={handleBack} />
      ) : selectedFeature.id === 'homework' ? (
        <HomeworkHelp onBack={handleBack} />
      ) : selectedFeature.id === 'study' ? (
        <StudyPlanner onBack={handleBack} />
      ) : selectedFeature.id === 'essay' ? (
        <EssayWriter onBack={handleBack} />
      ) : selectedFeature.id === 'language' ? (
        <LanguageTutor onBack={handleBack} />
      ) : selectedFeature.id === 'code' ? (
        <CodeHelper onBack={handleBack} />
      ) : (
        <div className={styles.fullScreenChat}>
          <div className={styles.chatHeader}>
            <button className={styles.backButton} onClick={handleBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Quay lại
            </button>
            <div className={styles.chatHeaderInfo}>
              <div className={styles.chatHeaderIcon} style={{ backgroundColor: selectedFeature.color }}>
                {selectedFeature.icon}
              </div>
              <div>
                <h2 className={styles.chatHeaderTitle}>{selectedFeature.title}</h2>
                <p className={styles.chatHeaderDesc}>{selectedFeature.description}</p>
              </div>
            </div>
          </div>

          <div className={styles.chatBody} ref={chatBodyRef}>
            {messages.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon} style={{ color: selectedFeature.color }}>
                  {selectedFeature.icon}
                </div>
                <h3>Bắt đầu cuộc trò chuyện</h3>
                <p>Nhập câu hỏi của bạn bên dưới để nhận hỗ trợ từ AI</p>
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
                  <div 
                    className={styles.messageAvatar}
                    style={message.role === 'assistant' ? { backgroundColor: selectedFeature.color } : {}}
                  >
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
                  <div className={styles.messageAvatar} style={{ backgroundColor: selectedFeature.color }}>
                    AI
                  </div>
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
              placeholder={selectedFeature.placeholder}
              rows={1}
              disabled={loading}
              style={{ borderColor: selectedFeature.color }}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              style={{ backgroundColor: selectedFeature.color }}
            >
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
      )}
    </div>
  )
}

export default AIAssistant
