import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './Register.module.scss'
import { useAuthStore } from '../../store/useAuthStore'
import type { Role } from '../../services/auth'
import { facultyApi } from '../../services/faculty'

type FormData = {
  fullName: string
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: Role
  facultyId: string
}

const Register: React.FC = () => {
  const [facultyList, setFacultyList] = useState<any[]>([])
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    facultyId: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const refs = {
    fullName: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    username: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    confirmPassword: useRef<HTMLInputElement>(null),
    facultyId: useRef<HTMLSelectElement>(null),
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target
    let { value } = e.target
    if (name === 'phone') {
      value = (value || '').replace(/\D/g, '').slice(0, 10)
    }
    if (name === 'username') {
      value = (value || '').replace(/\s+/g, '')
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target
    setTouched((t) => ({ ...t, [name]: true }))
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
    if (!formData.facultyId) {
      next.facultyId = 'Vui lòng chọn khoa.'
    }
    return next
  }, [formData])

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setServerError(null)
    if (!isValid) {
      const order = [
        'fullName',
        'phone',
        'username',
        'email',
        'password',
        'confirmPassword',
        'facultyId',
      ] as const
      const firstInvalid = order.find((key) => (errors as any)[key])
      if (firstInvalid && refs[firstInvalid]?.current) {
        refs[firstInvalid]!.current!.focus()
      }
      return
    }
    setIsLoading(true)
    try {
      await register({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email.trim(),
        phone: formData.phone,
        role: formData.role,
        facultyId: formData.facultyId,
        active: true,
      })
      navigate('/login', { replace: true })
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors.join(', ')
          : null) ||
        err?.message ||
        'Đăng ký không thành công.'
      setServerError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const getListFaculty = async () => {
      const data = await facultyApi.getFacultyList()
      setFacultyList(data || [])
    }
    getListFaculty()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoTitleRow}>
            <div className={styles.logo}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              <input
                type="text"
                id="fullName"
                name="fullName"
                ref={refs.fullName}
                value={formData.fullName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={styles.input}
                placeholder="Ví dụ: Nguyễn Văn A"
                autoComplete="name"
                aria-invalid={!!(errors.fullName && (touched.fullName || submitted))}
                aria-describedby="error-fullName"
                required
                disabled={isLoading}
              />
            </div>
            {errors.fullName && (touched.fullName || submitted) && (
              <span id="error-fullName" className={styles.error} aria-live="polite">{errors.fullName}</span>
            )}
          </div>

          {/* Số điện thoại */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="phone" className={styles.label}>Số điện thoại</label>
              <span className={styles.helper}>10 số, bắt đầu bằng 0</span>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.11 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.81.3 1.6.54 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.72-1.11a2 2 0 0 1 2.11-.45c.76.24 1.55.42 2.36.54A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <input
                type="tel"
                id="phone"
                name="phone"
                ref={refs.phone}
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={styles.input}
                placeholder="Ví dụ: 0901234567"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                aria-invalid={!!(errors.phone && (touched.phone || submitted))}
                aria-describedby="error-phone"
                required
                disabled={isLoading}
              />
            </div>
            {errors.phone && (touched.phone || submitted) && (
              <span id="error-phone" className={styles.error} aria-live="polite">{errors.phone}</span>
            )}
          </div>

          {/* Tên đăng nhập */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="username" className={styles.label}>Tên đăng nhập</label>
              <span className={styles.helper}>Tối thiểu 3 ký tự</span>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"  >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 15s1.5-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M9 10h.01M15 10h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="text"
                id="username"
                name="username"
                ref={refs.username}
                value={formData.username}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={styles.input}
                placeholder="Tên đăng nhập"
                autoComplete="username"
                pattern="[a-zA-Z0-9_.-]{3,}"
                aria-invalid={!!(errors.username && (touched.username || submitted))}
                aria-describedby="error-username"
                required
                disabled={isLoading}
              />
            </div>
            {errors.username && (touched.username || submitted) && (
              <span id="error-username" className={styles.error} aria-live="polite">{errors.username}</span>
            )}
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="email" className={styles.label}>Email</label>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" />
                  <path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                ref={refs.email}
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={styles.input}
                placeholder="Email"
                autoComplete="email"
                aria-invalid={!!(errors.email && (touched.email || submitted))}
                aria-describedby="error-email"
                required
                disabled={isLoading}
              />
            </div>
            {errors.email && (touched.email || submitted) && (
              <span id="error-email" className={styles.error} aria-live="polite">{errors.email}</span>
            )}
          </div>

          {/* Mật khẩu */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password" className={styles.label}>Mật khẩu</label>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                ref={refs.password}
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={styles.input}
                placeholder="Nhập mật khẩu"
                autoComplete="new-password"
                aria-invalid={!!(errors.password && (touched.password || submitted))}
                aria-describedby="error-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" >
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10.58 10.58A2 2 0 1 0 13.42 13.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M9.88 5.09A9.37 9.37 0 0 1 12 5c7 0 10 7 10 7a16.5 16.5 0 0 1-3.12 4.56M6.61 6.61A16.5 16.5 0 0 0 2 12s3 7 10 7a9.46 9.46 0 0 0 3.23-.56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"  >
                    <path d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7S1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (touched.password || submitted) && (
              <span id="error-password" className={styles.error} aria-live="polite">{errors.password}</span>
            )}
          </div>

          {/* Nhập lại mật khẩu */}
          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="confirmPassword" className={styles.label}>Nhập lại mật khẩu</label>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"  >
                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                ref={refs.confirmPassword}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={styles.input}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                aria-invalid={!!(errors.confirmPassword && (touched.confirmPassword || submitted))}
                aria-describedby="error-confirmPassword"
                required
                disabled={isLoading}
              />
            </div>
            {errors.confirmPassword && (touched.confirmPassword || submitted) && (
              <span id="error-confirmPassword" className={styles.error} aria-live="polite">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Vai trò */}
          <div className={`${styles.inputGroup} ${styles.fullRow}`}>
            <div className={styles.labelRow}>
              <label htmlFor="role" className={styles.label}>Vai trò</label>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={styles.select}
                disabled={isLoading}
              >
                <option value="STUDENT">Học sinh/Sinh viên</option>
                <option value="TEACHER">Giáo viên</option>
                {/* <option value="ADMIN">Quản trị</option>*/}
              </select>
            </div>
          </div>

          {/* Khoa */}
          <div className={`${styles.inputGroup} ${styles.fullRow}`}>
            <div className={styles.labelRow}>
              <label htmlFor="facultyId" className={styles.label}>Khoa</label>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon} aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <select
                id="facultyId"
                name="facultyId"
                ref={refs.facultyId}
                value={formData.facultyId}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={styles.select}
                aria-invalid={!!(errors.facultyId && (touched.facultyId || submitted))}
                aria-describedby="error-facultyId"
                required
                disabled={isLoading}
              >
                <option value="" disabled>
                  Chọn khoa
                </option>
                {facultyList.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                ))}
              </select>
            </div>
            {errors.facultyId && (touched.facultyId || submitted) && (
              <span id="error-facultyId" className={styles.error} aria-live="polite">{errors.facultyId}</span>
            )}
          </div>

          {/* Actions */}
          <div className={`${styles.fullRow}`}>
            {serverError && (
              <div className={styles.error} role="alert" style={{ marginBottom: 12 }}>
                {serverError}
              </div>
            )}
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

