import React, { useState } from 'react'
import styles from './CareerAdvice.module.scss'
import { geminiApi } from '../../../../services/gemini'
import { getErrorMessage } from '../../../../utils/errorHandler'

const CareerAdvice: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    major: '',
    interests: '',
    skills: '',
    goals: '',
  })
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResponse('')

    try {
      const prompt = `
Bạn là chuyên gia tư vấn hướng nghiệp với 20 năm kinh nghiệm. Hãy tư vấn chi tiết cho sinh viên với thông tin sau:

- Ngành học: ${formData.major}
- Sở thích: ${formData.interests}
- Kỹ năng: ${formData.skills}
- Mục tiêu nghề nghiệp: ${formData.goals}

Hãy đưa ra:
1. Phân tích điểm mạnh và cơ hội nghề nghiệp phù hợp
2. Các vị trí công việc cụ thể có thể theo đuổi
3. Kỹ năng cần phát triển thêm
4. Lộ trình phát triển sự nghiệp 3-5 năm
5. Lời khuyên thực tế để bắt đầu

Trả lời bằng tiếng Việt, chi tiết và dễ hiểu.
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

      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </div>
        <h1 className={styles.title}>Tư vấn hướng nghiệp</h1>
        <p className={styles.subtitle}>Khám phá con đường sự nghiệp phù hợp với bạn</p>
      </div>

      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Ngành học hiện tại</label>
            <input
              type="text"
              value={formData.major}
              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
              placeholder="Ví dụ: Công nghệ thông tin"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Sở thích của bạn</label>
            <textarea
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              placeholder="Ví dụ: Thích lập trình web, thiết kế UI/UX, làm việc nhóm..."
              rows={3}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Kỹ năng hiện có</label>
            <textarea
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="Ví dụ: JavaScript, React, Python, giao tiếp tốt..."
              rows={3}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mục tiêu nghề nghiệp</label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="Ví dụ: Trở thành Full-stack Developer trong 2 năm..."
              rows={3}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Đang phân tích...' : 'Nhận tư vấn'}
          </button>
        </form>

        {error && (
          <div className={styles.error}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>AI đang phân tích thông tin của bạn...</p>
          </div>
        )}

        {response && (
          <div className={styles.response}>
            <div className={styles.responseHeader}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h3>Kết quả tư vấn</h3>
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
  )
}

export default CareerAdvice
