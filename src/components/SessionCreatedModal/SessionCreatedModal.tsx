import React from 'react'
import Modal from '../Modal/Modal'
import styles from './SessionCreatedModal.module.scss'
import type { ClassSession } from '../../services/schedule'

interface SessionCreatedModalProps {
    isOpen: boolean
    onClose: () => void
    sessions: ClassSession | ClassSession[]
    isRecurring: boolean
}

const SessionCreatedModal: React.FC<SessionCreatedModalProps> = ({
    isOpen,
    onClose,
    sessions,
    isRecurring,
}) => {
    const sessionArray = Array.isArray(sessions) ? sessions : [sessions]

    const formatDateTime = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return dateString
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isRecurring ? 'Đã tạo buổi học định kỳ' : 'Đã tạo buổi học'}
            size="lg"
        >
            <div className={styles.modalContent}>
                <div className={styles.successIcon}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {isRecurring && sessionArray.length > 0 && (
                    <p className={styles.summary}>
                        Đã tạo thành công <strong>{sessionArray.length}</strong> buổi học
                    </p>
                )}

                <div className={styles.sessionsList}>
                    {sessionArray.map((session, index) => (
                        <div key={session.sessionId || index} className={styles.sessionCard}>
                            <div className={styles.sessionHeader}>
                                <h3>Buổi học {isRecurring ? `${index + 1}` : ''}</h3>
                            </div>

                            <div className={styles.sessionInfo}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Khóa học:</span>
                                    <span className={styles.value}>
                                        <strong>{session.courseCode}</strong> - {session.courseName}
                                    </span>
                                </div>

                                {session.teacherName && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Giảng viên:</span>
                                        <span className={styles.value}>{session.teacherName}</span>
                                    </div>
                                )}

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Phòng:</span>
                                    <span className={styles.value}>{session.roomName}</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Thời gian bắt đầu:</span>
                                    <span className={styles.value}>{formatDateTime(session.startTime)}</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Thời gian kết thúc:</span>
                                    <span className={styles.value}>{formatDateTime(session.endTime)}</span>
                                </div>

                                {session.latitude && session.longitude && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Vị trí:</span>
                                        <span className={styles.value}>
                                            {session.latitude.toFixed(6)}, {session.longitude.toFixed(6)}
                                            {session.radiusMeters && ` (${session.radiusMeters}m)`}
                                        </span>
                                    </div>
                                )}

                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Trạng thái:</span>
                                    <span className={`${styles.value} ${session.locked ? styles.locked : styles.unlocked}`}>
                                        {session.locked ? 'Đã khóa' : 'Mở'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
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

export default SessionCreatedModal
