import React from 'react'
import Modal from '../Modal/Modal'
import styles from './AttendanceSuccessModal.module.scss'

interface AttendanceSuccessModalProps {
    isOpen: boolean
    onClose: () => void
    studentName: string
    studentCode: string
    status: string
}

const AttendanceSuccessModal: React.FC<AttendanceSuccessModalProps> = ({
    isOpen,
    onClose,
    studentName,
    studentCode,
    status,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Điểm danh thành công"
            size="md"
        >
            <div className={styles.modalContent}>
                <div className={styles.successIcon}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className={styles.message}>
                    <h3>Điểm danh đã được ghi nhận!</h3>
                </div>

                <div className={styles.studentInfo}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Sinh viên:</span>
                            <span className={styles.value}><strong>{studentName}</strong></span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Mã sinh viên:</span>
                            <span className={styles.value}>{studentCode}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Trạng thái:</span>
                            <span className={`${styles.value} ${styles.status}`}>{status}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button onClick={onClose} className={styles.confirmButton}>
                        Đồng ý
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default AttendanceSuccessModal
