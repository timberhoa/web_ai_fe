import React, { useEffect } from 'react'
import Modal from '../Modal/Modal'
import styles from './NotificationModal.module.scss'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationModalProps {
    isOpen: boolean
    onClose: () => void
    type: NotificationType
    title?: string
    message: string
    autoClose?: boolean
    autoCloseDuration?: number
}

const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    onClose,
    type,
    title,
    message,
    autoClose = false,
    autoCloseDuration = 3000,
}) => {
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose()
            }, autoCloseDuration)

            return () => clearTimeout(timer)
        }
    }, [isOpen, autoClose, autoCloseDuration, onClose])

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )
            case 'error':
                return (
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )
            case 'warning':
                return (
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64537 18.3024 1.55327 18.6453 1.55271 18.9945C1.55215 19.3437 1.64314 19.6869 1.81671 19.9897C1.99028 20.2925 2.24065 20.5443 2.5424 20.7197C2.84415 20.8951 3.18656 20.9881 3.53541 20.9899H20.4646C20.8134 20.9881 21.1558 20.8951 21.4576 20.7197C21.7594 20.5443 22.0097 20.2925 22.1833 19.9897C22.3569 19.6869 22.4479 19.3437 22.4473 18.9945C22.4467 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )
            case 'info':
                return (
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16V12M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )
        }
    }

    const getDefaultTitle = () => {
        switch (type) {
            case 'success':
                return 'Thành công'
            case 'error':
                return 'Lỗi'
            case 'warning':
                return 'Cảnh báo'
            case 'info':
                return 'Thông tin'
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title || getDefaultTitle()}
            size="md"
        >
            <div className={styles.modalContent}>
                <div className={`${styles.icon} ${styles[type]}`}>
                    {getIcon()}
                </div>

                <div className={styles.message}>
                    {message}
                </div>

                <div className={styles.actions}>
                    <button onClick={onClose} className={`${styles.button} ${styles[type]}`}>
                        Đồng ý
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default NotificationModal
