import React, { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import styles from './TeacherFaceScanModal.module.scss'
import { attendanceApi } from '../../services/attendance'

interface TeacherFaceScanModalProps {
    isOpen: boolean
    onClose: () => void
    sessionId: string
    onSuccess: () => void
}

const TeacherFaceScanModal: React.FC<TeacherFaceScanModalProps> = ({
    isOpen,
    onClose,
    sessionId,
    onSuccess,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const webcamRef = useRef<Webcam>(null)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            setCapturedImage(imageSrc)
        }
    }, [webcamRef])

    const retake = () => {
        setCapturedImage(null)
    }

    const handleSubmit = async () => {
        if (!capturedImage) return

        setIsSubmitting(true)
        try {
            const response = await fetch(capturedImage)
            const blob = await response.blob()

            const formData = new FormData()
            formData.append('image', blob, 'teacher_scan.jpg')
            formData.append('sessionId', sessionId)

            const result = await attendanceApi.teacherCheckInFace(formData)

            alert(`Điểm danh thành công!\nSinh viên: ${result.studentName} (${result.studentCode})\nTrạng thái: ${result.status}`)
            onSuccess()
            setCapturedImage(null)
        } catch (error: any) {
            console.error('Check-in failed:', error)
            alert(error?.response?.data?.message || error?.message || 'Điểm danh thất bại')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.header}>
                    <h2>Điểm danh hộ (Scan Face)</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.cameraWrapper}>
                        {!capturedImage ? (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                width="100%"
                                height="100%"
                                videoConstraints={{
                                    facingMode: 'environment', // Use back camera if available
                                    width: 640,
                                    height: 480
                                }}
                                style={{ borderRadius: '12px', objectFit: 'cover' }}
                            />
                        ) : (
                            <img src={capturedImage} alt="Captured" className={styles.previewImage} />
                        )}
                    </div>

                    <div className={styles.controls}>
                        {!capturedImage ? (
                            <button onClick={capture} className={styles.captureButton}>
                                <div className={styles.captureInner} />
                            </button>
                        ) : (
                            <div className={styles.actionButtons}>
                                <button
                                    className={`${styles.button} ${styles.secondary}`}
                                    onClick={retake}
                                    disabled={isSubmitting}
                                >
                                    Chụp lại
                                </button>
                                <button
                                    className={`${styles.button} ${styles.primary}`}
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận điểm danh'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeacherFaceScanModal
