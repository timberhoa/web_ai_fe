import React, { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import styles from './FaceRegistrationModal.module.scss'
import { attendanceApi } from '../../services/attendance'

interface FaceRegistrationModalProps {
    isOpen: boolean
    onClose: () => void
    studentId: string
    studentName: string
    studentCode?: string
    onSuccess?: () => void
}

const FaceRegistrationModal: React.FC<FaceRegistrationModalProps> = ({
    isOpen,
    onClose,
    studentId,
    studentName,
    studentCode,
    onSuccess,
}) => {
    const [images, setImages] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const webcamRef = useRef<Webcam>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            setImages((prev) => [...prev, imageSrc])
        }
    }, [webcamRef])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        Array.from(files).forEach((file) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (reader.result && typeof reader.result === 'string') {
                    setImages((prev) => [...prev, reader.result as string])
                }
            }
            reader.readAsDataURL(file)
        })

        // Reset input so same files can be selected again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const triggerFileUpload = () => {
        fileInputRef.current?.click()
    }

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {
        if (images.length < 3) {
            alert('Vui lòng chụp ít nhất 3 ảnh')
            return
        }

        setIsSubmitting(true)
        try {
            const formData = new FormData()

            // Convert base64 images to blobs and append to FormData
            for (let i = 0; i < images.length; i++) {
                const response = await fetch(images[i])
                const blob = await response.blob()
                formData.append('images', blob, `face_${i}.jpg`)
            }

            await attendanceApi.registerFace(studentId, formData)
            alert('Đăng ký khuôn mặt thành công!')
            onSuccess?.()
            onClose()
            setImages([])
        } catch (error: any) {
            console.error('Registration failed:', error)
            alert(error?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.header}>
                    <h2>Đăng ký khuôn mặt</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.studentInfo}>
                        <div className={styles.avatar}>
                            {studentName.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.details}>
                            <h3>{studentName}</h3>
                            <p>{studentCode || 'Chưa có mã sinh viên'}</p>
                        </div>
                    </div>

                    <div className={styles.captureSection}>
                        <div className={styles.cameraWrapper}>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width="100%"
                                height="100%"
                                videoConstraints={{
                                    facingMode: 'user',
                                    width: 640,
                                    height: 480
                                }}
                                style={{ borderRadius: '12px', objectFit: 'cover' }}
                            />

                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                            />

                            <div style={{
                                position: 'absolute',
                                bottom: '16px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 10,
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'center'
                            }}>
                                <button
                                    onClick={triggerFileUpload}
                                    className={styles.uploadButton}
                                    title="Tải ảnh lên"
                                    disabled={images.length >= 10}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 16V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V16M12 12V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>

                                <button
                                    onClick={capture}
                                    disabled={images.length >= 10}
                                    className={styles.button}
                                    style={{
                                        borderRadius: '50%',
                                        width: '64px',
                                        height: '64px',
                                        padding: 0,
                                        backgroundColor: images.length >= 10 ? '#9ca3af' : '#ef4444',
                                        border: '4px solid white',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className={styles.capturedImages}>
                            <h4>
                                Ảnh đã chụp
                                <span>{images.length}/10</span>
                            </h4>
                            <div className={styles.imageList}>
                                {images.map((img, idx) => (
                                    <div key={idx} className={styles.imageItem}>
                                        <img src={img} alt={`Capture ${idx + 1}`} />
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => removeImage(idx)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                {images.length === 0 && (
                                    <div style={{
                                        textAlign: 'center',
                                        color: '#9ca3af',
                                        padding: '20px',
                                        fontSize: '0.875rem',
                                        border: '2px dashed #e5e7eb',
                                        borderRadius: '8px'
                                    }}>
                                        Chưa có ảnh nào. Hãy chụp ít nhất 3 ảnh.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        className={`${styles.button} ${styles.secondary}`}
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        className={`${styles.button} ${styles.danger}`}
                        onClick={async () => {
                            if (!window.confirm('Bạn chắc chắn muốn xóa dữ liệu khuôn mặt cũ?')) return
                            try {
                                await attendanceApi.deleteFace(studentId)
                                alert('Đã xóa dữ liệu khuôn mặt cũ')
                            } catch (e: any) {
                                alert(e?.message || 'Xóa thất bại')
                            }
                        }}
                        disabled={isSubmitting}
                        style={{ marginRight: 'auto', marginLeft: '0', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                    >
                        Xóa dữ liệu cũ
                    </button>
                    <button
                        className={`${styles.button} ${styles.primary}`}
                        onClick={handleSubmit}
                        disabled={isSubmitting || images.length < 3}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký khuôn mặt'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FaceRegistrationModal
