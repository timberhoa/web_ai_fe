import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Register.module.scss'
import { useAuthStore } from '../../store/useAuthStore'
import type { Role } from '../../services/auth'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT' as Role,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const errors = useMemo(() => {
    const next: Record<string, string> = {}
    if (!formData.fullName.trim()) next.fullName = 'Vui lòng nhập họ và tên.'
    if (!/^[a-zA-Z0-9_.-]{3,}$/.test(formData.username)) {
      next.username = 'Tên đăng nhập tối thiểu 3 ký tự, chỉ gồm chữ/số/ký tự _.-'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = 'Email không hợp lệ.'
    }
    if (!/^0\d{9}$/.test(formData.phone)) {
      next.phone = 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0.'
    }
    if (formData.password.length < 6) {
      next.password = 'Mật khẩu tối thiểu 6 ký tự.'
    }
    if (formData.confirmPassword !== formData.password) {
      next.confirmPassword = 'Mật khẩu nhập lại không khớp.'
    }
    return next
  }, [formData])

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setIsLoading(true)
    try {
      await register({
        fullName: formData.fullName,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      })
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoTitleRow}>
            <div className={styles.logo}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>Tạo tài khoản</h1>
              <p className={styles.subtitle}>Đăng ký để bắt đầu sử dụng</p>
            </div>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Họ và tên */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="fullName" className={styles.label}>Họ và tên</label>
              <span className={styles.helper}>Nhập họ tên đầy đủ</span>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Ví dụ: Nguyễn Văn A"
                aria-invalid={!!errors.fullName}
                required
              />
            </div>
            {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
          </div>

          {/* Số điện thoại */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
              <span className={styles.helper}>10 số, bắt đầu bằng 0</span>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.11 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.11a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Ví dụ: 0901234567"
                inputMode="numeric"
                aria-invalid={!!errors.phone}
                required
              />
            </div>
            {errors.phone && <span className={styles.error}>{errors.phone}</span>}
          </div>

          {/* Tên đăng nhập */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="username" className={styles.label}>Tên đăng nhập</label>
              <span className={styles.helper}>Tối thiểu 3 ký tự</span>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 15s1.5-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 10h.01M15 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Tên đăng nhập"
                aria-invalid={!!errors.username}
                required
              />
            </div>
            {errors.username && <span className={styles.error}>{errors.username}</span>}
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="email" className={styles.label}>Email</label>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                required
              />
            </div>
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          {/* Mật khẩu */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>Mật khẩu</label>
              <span className={styles.helper}>Tối thiểu 6 ký tự</span>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10.58 10.58A2 2 0 1 0 13.42 13.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9.88 5.09A9.37 9.37 0 0 1 12 5c7 0 10 7 10 7a16.5 16.5 0 0 1-3.12 4.56M6.61 6.61A16.5 16.5 0 0 0 2 12s3 7 10 7a9.46 9.46 0 0 0 3.23-.56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7S1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>

          {/* Nhập lại mật khẩu */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="confirmPassword" className={styles.label}>Nhập lại mật khẩu</label>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Nhập lại mật khẩu"
                aria-invalid={!!errors.confirmPassword}
                required
              />
            </div>
            {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
          </div>

          {/* Vai trò */}
          <div className={`${styles.inputGroup} ${styles.fullRow}`}>
            <div className={styles.labelRow}>
              <label htmlFor="role" className={styles.label}>Vai trò</label>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="STUDENT">Học sinh/Sinh viên</option>
                <option value="TEACHER">Giáo viên</option>
                <option value="ADMIN">Quản trị</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className={`${styles.fullRow}`}>
            <button type="submit" className={styles.button} disabled={isLoading || !isValid}>
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
            <div className={styles.footer}>
              <span>Bạn đã có tài khoản? </span>
              <Link to="/login" className={styles.link}>Đăng nhập</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register

