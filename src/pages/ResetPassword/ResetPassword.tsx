import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import styles from './ResetPassword.module.scss'
import { authApi } from '../../services/auth'

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [validToken, setValidToken] = useState<boolean | null>(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Kiểm tra token khi component mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setValidToken(false)
                setError('Link reset mật khẩu không hợp lệ. Vui lòng kiểm tra lại email của bạn.')
                return
            }

            try {
                const response = await authApi.validateResetToken(token)
                setValidToken(response.valid)
                if (!response.valid) {
                    setError(translateErrorMessage(response.message))
                }
            } catch (err) {
                setValidToken(false)
                setError('Token không hợp lệ hoặc đã hết hạn.')
            }
        }

        validateToken()
    }, [token])

    const translateErrorMessage = (msg: string): string => {
        const errorMessages: Record<string, string> = {
            'PASSWORD_CONFIRM_NOT_MATCH': 'Mật khẩu xác nhận không khớp',
            'PASSWORD_TOO_WEAK': 'Mật khẩu phải có ít nhất 8 ký tự',
            'INVALID_RESET_TOKEN': 'Token không hợp lệ',
            'TOKEN_ALREADY_USED': 'Token này đã được sử dụng',
            'TOKEN_EXPIRED': 'Token đã hết hạn',
            'NEW_PASSWORD_MUST_DIFFER_FROM_OLD': 'Mật khẩu mới phải khác mật khẩu cũ',
            'Invalid reset token': 'Token không hợp lệ',
            'This reset token has already been used': 'Token này đã được sử dụng',
            'Reset token has expired': 'Token đã hết hạn',
        }
        return errorMessages[msg] || msg
    }

    const getPasswordStrength = (password: string): number => {
        let strength = 0
        if (password.length >= 8) strength++
        if (password.length >= 12) strength++
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
        if (/\d/.test(password)) strength++
        if (/[^a-zA-Z0-9]/.test(password)) strength++
        return strength
    }

    const getPasswordStrengthLabel = (strength: number): string => {
        if (strength <= 1) return 'Yếu'
        if (strength <= 2) return 'Trung bình'
        if (strength <= 3) return 'Khá'
        return 'Mạnh'
    }

    const getPasswordStrengthColor = (strength: number): string => {
        if (strength <= 1) return styles.weak
        if (strength <= 2) return styles.medium
        if (strength <= 3) return styles.good
        return styles.strong
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            return
        }

        if (newPassword.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự')
            return
        }

        if (!token) {
            setError('Token không hợp lệ')
            return
        }

        setIsLoading(true)

        try {
            const response = await authApi.resetPassword({
                token,
                newPassword,
                confirmPassword
            })
            setMessage(response.message)
            setIsSuccess(true)

            // Redirect to login sau 2 giây
            setTimeout(() => {
                navigate('/login')
            }, 2000)

        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Đã xảy ra lỗi'
            setError(translateErrorMessage(errorMsg))
        } finally {
            setIsLoading(false)
        }
    }

    // Nếu đang kiểm tra token
    if (validToken === null) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Đang kiểm tra token...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Nếu token không hợp lệ
    if (validToken === false) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.errorIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h1 className={styles.title}>Token Không Hợp Lệ</h1>
                        <p className={styles.subtitle}>
                            {error || 'Link reset mật khẩu không hợp lệ hoặc đã hết hạn.'}
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <Link to="/forgot-password" className={styles.primaryButton}>
                            Yêu cầu link mới
                        </Link>
                        <Link to="/login" className={styles.secondaryButton}>
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Nếu reset thành công
    if (isSuccess) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <div className={styles.successIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className={styles.title}>Mật Khẩu Đã Được Đặt Lại</h1>
                        <p className={styles.subtitle}>
                            Mật khẩu của bạn đã được thay đổi thành công. Bạn sẽ được chuyển đến trang đăng nhập...
                        </p>
                    </div>

                    {message && (
                        <div className={styles.successMessage}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Form reset password
    const passwordStrength = getPasswordStrength(newPassword)

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className={styles.title}>Đặt Lại Mật Khẩu</h1>
                    <p className={styles.subtitle}>Nhập mật khẩu mới cho tài khoản của bạn</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="newPassword" className={styles.label}>Mật khẩu mới</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={styles.input}
                                placeholder="Tối thiểu 8 ký tự"
                                required
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>

                        {newPassword && (
                            <div className={styles.strengthMeter}>
                                <div className={styles.strengthBar}>
                                    <div
                                        className={`${styles.strengthFill} ${getPasswordStrengthColor(passwordStrength)}`}
                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <span className={styles.strengthLabel}>
                                    Độ mạnh: {getPasswordStrengthLabel(passwordStrength)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword" className={styles.label}>Xác nhận mật khẩu</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={styles.input}
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? (
                            <>Đang xử lý...</>
                        ) : (
                            'Đặt Lại Mật Khẩu'
                        )}
                    </button>

                    <div className={styles.footer}>
                        <Link to="/login" className={styles.link}>
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword
