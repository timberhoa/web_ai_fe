import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import styles from './Login.module.scss'
import { useAuthStore } from '../../store/useAuthStore'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    try {
      await login(formData.username, formData.password)
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (error) {
      const err = error as AxiosError
      if (err.response?.status === 404) {
        setErrorMessage('Tài khoản không tồn tại')
      } else if (err.response?.status === 401) {
        setErrorMessage('Tài khoản hoặc mật khẩu không đúng')
      } else {
        setErrorMessage('Đã có lỗi xảy ra. Vui lòng thử lại sau.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      {/* Left Side - Image & Branding */}
      <div
        className={styles.leftPanel}
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/nonglam.png)` }}
      >
        <div className={styles.overlay} />
        <div className={styles.brandingContent}>
          <div className={styles.logoContainer}>
            <img src="/logo.webp" alt="Logo Nông Lâm" className={styles.universityLogo} />
          </div>
          <h1 className={styles.systemTitle}>
            Hệ Thống Điểm Danh và<br />Nhận Diện Khuôn Mặt
          </h1>
          <p className={styles.universityName}>
            Trường Đại Học Nông Lâm TP. Hồ Chí Minh
          </p>
          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Điểm danh tự động bằng AI</span>
            </div>
            <div className={styles.featureItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Nhận diện khuôn mặt chính xác cao</span>
            </div>
            <div className={styles.featureItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Quản lý hiệu quả và tiện lợi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.welcomeTitle}>Chào mừng trở lại</h2>
            <p className={styles.welcomeSubtitle}>Đăng nhập để tiếp tục sử dụng hệ thống</p>
          </div>

          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.inputLabel}>
                Tên đăng nhập
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>
                Mật khẩu
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Nhập mật khẩu"
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Quên mật khẩu?
              </Link>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? (
                <div className={styles.loadingSpinner}>
                  <div className={styles.spinner}></div>
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>

            <div className={styles.divider}>
              <span>hoặc</span>
            </div>

            <div className={styles.registerPrompt}>
              <p>Chưa có tài khoản?</p>
              <Link to="/register" className={styles.registerLink}>
                Đăng ký ngay
              </Link>
            </div>
          </form>

          <div className={styles.footer}>
            <p>© 2026 Trường Đại Học Nông Lâm TP.HCM</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
