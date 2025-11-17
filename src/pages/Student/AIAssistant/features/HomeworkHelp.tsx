import React, { useState } from 'react'
import styles from './HomeworkHelp.module.scss'
import { geminiApi } from '../../../../services/gemini'
import { getErrorMessage } from '../../../../utils/errorHandler'

const HomeworkHelp: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [subject, setSubject] = useState('')
  const [question, setQuestion] = useState('')
  const [context, setContext] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subjects = [
    'Toán học',
    'Vật lý',
    'Hóa học',
    'Sinh học',
    'Lập trình',
    'Cơ sở dữ liệu',
    'Mạng máy tính',
    'Tiếng Anh',
    'Khác',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResponse('')

    try {
      const prompt = `
Bạn là giáo viên dạy kèm chuyên nghiệp. Hãy giúp sinh viên giải quyết bài tập sau:

Môn học: ${subject}
Câu hỏi: ${question}
${context ? `Bối cảnh thêm: ${context}` : ''}

Hãy:
1. Giải thích khái niệm liên quan một cách dễ hiểu
2. Hướng dẫn từng bước để giải quyết vấn đề
3. Đưa ra ví dụ minh họa nếu cần
4. Giải thích tại sao cách làm đó đúng
5. Gợi ý cách tránh sai lầm thường gặp

Trả lời bằng tiếng Việt, chi tiết và dễ hiểu như đang dạy trực tiếp.
      `
      const result = await geminiApi.generateContent(prompt)
      setResponse(result)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Quay lại
      </button>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h2>Hỗ trợ bài tập</h2>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Chọn môn học</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              >
                <option value="">-- Chọn môn --</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Câu hỏi của bạn</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Nhập câu hỏi hoặc bài tập cần giải..."
                rows={6}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Thông tin thêm (tùy chọn)</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ví dụ: Đây là bài tập chương 3, tôi đã thử cách này nhưng..."
                rows={3}
              />
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Đang giải...' : 'Nhận hướng dẫn'}
            </button>
          </form>
        </div>

        <div className={styles.main}>
          {!response && !loading && !error && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Sẵn sàng giúp bạn</h3>
              <p>Nhập câu hỏi bên trái và nhận hướng dẫn chi tiết từ AI</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div>
                <h4>Đã xảy ra lỗi</h4>
                <p>{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className={styles.loading}>
              <div className={styles.loadingAnimation}>
                <div className={styles.book}>
                  <div className={styles.bookPage}></div>
                  <div className={styles.bookPage}></div>
                  <div className={styles.bookPage}></div>
                </div>
              </div>
              <h3>AI đang phân tích câu hỏi...</h3>
              <p>Vui lòng đợi trong giây lát</p>
            </div>
          )}

          {response && (
            <div className={styles.response}>
              <div className={styles.responseHeader}>
                <div className={styles.responseIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="currentColor" strokeWidth="2"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h3>Hướng dẫn giải</h3>
                  <p>Môn: {subject}</p>
                </div>
              </div>
              <div className={styles.responseContent}>
                {response.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomeworkHelp
