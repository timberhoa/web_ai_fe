import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(formData.username, formData.password)
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    alert('Tính năng quên mật khẩu sẽ được phát triển sau')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className={styles.title}>Đăng nhập hệ thống</h1>
          <p className={styles.subtitle}>Quản lý học sinh/sinh viên</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Nhập email của bạn"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Mật khẩu</label>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
          </div>

          <div className={styles.checkboxGroup}>
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
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? (
              <>Đang đăng nhập...</>
            ) : (
              'Đăng nhập'
            )}
          </button>

          <div className={styles.footer}>
            <button type="button" onClick={handleForgotPassword} className={styles.link}>
              Quên mật khẩu?
            </button>
            <span> • </span>
            <Link to="/register" className={styles.link}>Tạo tài khoản</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
