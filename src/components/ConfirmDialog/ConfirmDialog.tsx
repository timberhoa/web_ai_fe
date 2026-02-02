import React from 'react'
import Modal from '../Modal/Modal'
import styles from './ConfirmDialog.module.scss'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDanger?: boolean
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    isDanger = false,
}) => {
    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="md"
        >
            <div className={styles.modalContent}>
                <div className={`${styles.icon} ${isDanger ? styles.danger : styles.normal}`}>
                    {isDanger ? (
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64537 18.3024 1.55327 18.6453 1.55271 18.9945C1.55215 19.3437 1.64314 19.6869 1.81671 19.9897C1.99028 20.2925 2.24065 20.5443 2.5424 20.7197C2.84415 20.8951 3.18656 20.9881 3.53541 20.9899H20.4646C20.8134 20.9881 21.1558 20.8951 21.4576 20.7197C21.7594 20.5443 22.0097 20.2925 22.1833 19.9897C22.3569 19.6869 22.4479 19.3437 22.4473 18.9945C22.4467 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>

                <div className={styles.message}>
                    {message}
                </div>

                <div className={styles.actions}>
                    <button onClick={onClose} className={`${styles.button} ${styles.cancel}`}>
                        {cancelText}
                    </button>
                    <button onClick={handleConfirm} className={`${styles.button} ${isDanger ? styles.danger : styles.confirm}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmDialog
