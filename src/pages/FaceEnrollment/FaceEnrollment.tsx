import React, { useState } from 'react'
import CameraBox from '../../components/CameraBox/CameraBox'
import Modal from '../../components/Modal/Modal'
import { attendanceApi } from '../../services/attendance'
import styles from './FaceEnrollment.module.scss'

const FaceEnrollment: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScanStart = () => {
    setIsScanning(true)
    setError(null)
  }

  const handleScanStop = () => {
    setIsScanning(false)
  }

  const handleScanSuccess = async (result: any) => {
    setScanResult(result)
    setIsScanning(false)
    
    // Try to check in using face recognition
    try {
      setLoading(true)
      setError(null)
      // This would call the actual API endpoint for self check-in
      // await attendanceApi.selfCheckin({ imageId: result.imageId })
      setIsModalOpen(true)
    } catch (err: any) {
      setError(err?.message || 'Không thể điểm danh. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setScanResult(null)
  }

  return (
    <div className={styles.faceEnrollment}>
      <div className={styles.header}>
        <h1 className={styles.title}>Đăng ký & Điểm danh bằng khuôn mặt</h1>
        <p className={styles.subtitle}>
          Sử dụng camera để đăng ký khuôn mặt hoặc điểm danh tự động
        </p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.cameraSection}>
          <CameraBox
            isActive={true}
            onScanStart={handleScanStart}
            onScanStop={handleScanStop}
            onScanSuccess={handleScanSuccess}
          />
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Hướng dẫn</h3>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.infoNumber}>1</div>
                <div className={styles.infoContent}>
                  <h4>Đăng ký khuôn mặt</h4>
                  <p>Bấm "Quét khuôn mặt" để đăng ký khuôn mặt của bạn vào hệ thống</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoNumber}>2</div>
                <div className={styles.infoContent}>
                  <h4>Điểm danh</h4>
                  <p>Sau khi đã đăng ký, bạn có thể sử dụng tính năng này để điểm danh tự động</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoNumber}>3</div>
                <div className={styles.infoContent}>
                  <h4>Lưu ý</h4>
                  <p>Đảm bảo ánh sáng đủ và khuôn mặt rõ ràng trong khung</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Điểm danh thành công"
        size="md"
      >
        <div className={styles.successContent}>
          <div className={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.successInfo}>
            <h3>Điểm danh thành công!</h3>
            {scanResult && (
              <div className={styles.resultInfo}>
                <p>Thời gian: {new Date(scanResult.timestamp).toLocaleString('vi-VN')}</p>
                {scanResult.confidence && (
                  <p>Độ chính xác: {(scanResult.confidence * 100).toFixed(1)}%</p>
                )}
              </div>
            )}
          </div>
          <div className={styles.successActions}>
            <button className={styles.closeButton} onClick={handleCloseModal}>
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default FaceEnrollment

