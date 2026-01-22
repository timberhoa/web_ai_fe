import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './ForgotPassword.module.scss'
import { authApi } from '../../services/auth'

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const response = await authApi.forgotPassword(email)
            setMessage(response.message)
            setIsSubmitted(true)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
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
                        <h1 className={styles.title}>Kiểm Tra Email Của Bạn</h1>
                        <p className={styles.subtitle}>
                            Nếu tài khoản với email này tồn tại, chúng tôi đã gửi link reset mật khẩu.
                        </p>
                    </div>

                    <div className={styles.infoBox}>
                        <ul className={styles.infoList}>
                            <li>Link sẽ hết hạn sau <strong>24 giờ</strong></li>
                            <li>Kiểm tra cả thư mục <strong>spam/junk</strong></li>
                            <li>Trong môi trường development, token được in ra console của backend</li>
                        </ul>
                    </div>

                    {message && (
                        <div className={styles.successMessage}>
                            {message}
                        </div>
                    )}

                    <div className={styles.actions}>
                        <Link to="/login" className={styles.backButton}>
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 className={styles.title}>Quên Mật Khẩu?</h1>
                    <p className={styles.subtitle}>
                        Nhập email của bạn để nhận link đặt lại mật khẩu
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? (
                            <>Đang gửi...</>
                        ) : (
                            'Gửi Link Reset'
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

export default ForgotPassword
