import React, { useState } from 'react'
import styles from './AIAssistant.module.scss'
import CareerAdvice from './features/CareerAdvice'
import HomeworkHelp from './features/HomeworkHelp'
import { geminiApi } from '../../../services/gemini'
import { getErrorMessage } from '../../../utils/errorHandler'

type AIFeature = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  prompt: string
  placeholder: string
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
    prompt: 'Bạn là chuyên gia tư vấn hướng nghiệp. Hãy tư vấn chi tiết về:',
    placeholder: 'Ví dụ: Tôi đang học ngành Công nghệ thông tin, thích lập trình web...',
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
    prompt: 'Bạn là trợ lý học tập. Hãy giúp sinh viên hiểu và giải quyết vấn đề sau:',
    placeholder: 'Ví dụ: Giải thích thuật toán sắp xếp nhanh (Quick Sort)...',
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
    prompt: 'Bạn là chuyên gia lập kế hoạch học tập. Hãy tạo kế hoạch chi tiết cho:',
    placeholder: 'Ví dụ: Tôi có 2 tuần để ôn thi 3 môn: Toán, Lý, Hóa...',
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
    prompt: 'Bạn là chuyên gia viết luận văn học thuật. Hãy hỗ trợ về:',
    placeholder: 'Ví dụ: Tôi cần viết luận văn về Trí tuệ nhân tạo trong giáo dục...',
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
    prompt: 'Bạn là giáo viên tiếng Anh. Hãy giúp học sinh với:',
    placeholder: 'Ví dụ: Giải thích sự khác biệt giữa Present Perfect và Past Simple...',
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
    prompt: 'Bạn là chuyên gia lập trình. Hãy phân tích và giải thích:',
    placeholder: 'Ví dụ: Giải thích đoạn code Python này hoặc tìm lỗi trong code...',
  },
]

const AIAssistant: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<AIFeature | null>(null)
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedFeature) return

    setLoading(true)
    setError(null)
    setResponse('')

    try {
      const fullPrompt = `${selectedFeature.prompt}\n\n${input}\n\nHãy trả lời bằng tiếng Việt một cách chi tiết và dễ hiểu.`
      const result = await geminiApi.generateContent(fullPrompt)
      
      setResponse(result)
      setHistory([{ question: input, answer: result }, ...history])
      setInput('')
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleFeatureSelect = (feature: AIFeature) => {
    setSelectedFeature(feature)
    setResponse('')
    setError(null)
    setInput('')
  }

  const handleBack = () => {
    setSelectedFeature(null)
    setResponse('')
    setError(null)
    setInput('')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Trợ lý AI</h1>
        <p className={styles.subtitle}>Sử dụng AI để hỗ trợ học tập và phát triển kỹ năng</p>
      </div>

      {!selectedFeature ? (
        <div className={styles.featuresGrid}>
          {AI_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className={styles.featureCard}
              onClick={() => handleFeatureSelect(feature)}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
              <div className={styles.featureAction}>
                <span>Bắt đầu</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      ) : selectedFeature.id === 'career' ? (
        <CareerAdvice onBack={handleBack} />
      ) : selectedFeature.id === 'homework' ? (
        <HomeworkHelp onBack={handleBack} />
      ) : (
        <div className={styles.chatContainer}>
          <div className={styles.chatHeader}>
            <button className={styles.backButton} onClick={handleBack}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Quay lại
            </button>
            <div className={styles.chatHeaderInfo}>
              <div className={styles.chatHeaderIcon}>{selectedFeature.icon}</div>
              <div>
                <h2 className={styles.chatHeaderTitle}>{selectedFeature.title}</h2>
                <p className={styles.chatHeaderDesc}>{selectedFeature.description}</p>
              </div>
            </div>
          </div>

          <div className={styles.chatBody}>
            {!response && history.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>{selectedFeature.icon}</div>
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

            {response && (
              <div className={styles.responseContainer}>
                <div className={styles.userMessage}>
                  <div className={styles.messageAvatar}>Bạn</div>
                  <div className={styles.messageContent}>{history[0]?.question}</div>
                </div>
                <div className={styles.aiMessage}>
                  <div className={styles.messageAvatar}>AI</div>
                  <div className={styles.messageContent}>
                    <div className={styles.markdown}>{response}</div>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className={styles.loadingMessage}>
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

            {history.length > 1 && (
              <div className={styles.historySection}>
                <h4 className={styles.historyTitle}>Lịch sử trò chuyện</h4>
                {history.slice(1).map((item, index) => (
                  <div key={index} className={styles.historyItem}>
                    <div className={styles.historyQuestion}>
                      <strong>Câu hỏi:</strong> {item.question}
                    </div>
                    <div className={styles.historyAnswer}>
                      <strong>Trả lời:</strong> {item.answer.substring(0, 200)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form className={styles.chatInput} onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedFeature.placeholder}
              rows={3}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? 'Đang xử lý...' : 'Gửi'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default AIAssistant
