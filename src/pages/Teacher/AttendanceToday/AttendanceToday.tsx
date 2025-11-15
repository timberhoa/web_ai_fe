import React, { useState, useEffect } from 'react'
import CameraBox from '../../../components/CameraBox/CameraBox'
import Modal from '../../../components/Modal/Modal'
import { attendanceApi } from '../../../services/attendance'
import styles from './AttendanceToday.module.scss'

const AttendanceToday: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [todaySessions, setTodaySessions] = useState<any[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Load today's sessions
    const loadSessions = async () => {
      try {
        // This would load sessions for today
        // const sessions = await scheduleApi.getTodaySessions()
        // setTodaySessions(sessions)
      } catch (err) {
        console.error('Failed to load sessions', err)
      }
    }
    loadSessions()
  }, [])

  const handleScanStart = () => {
    setIsScanning(true)
    setError(null)
  }

  const handleScanStop = () => {
    setIsScanning(false)
  }

  const handleScanSuccess = async (result: any) => {
    if (!selectedSessionId) {
      setError('Vui lòng chọn buổi học trước khi điểm danh')
      setIsScanning(false)
      return
    }

    setScanResult(result)
    setIsScanning(false)
    
    try {
      setLoading(true)
      setError(null)
      // Mark attendance using face recognition
      // await attendanceApi.mark({
      //   sessionId: selectedSessionId,
      //   studentId: result.studentId,
      //   status: 'PRESENT',
      // })
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
    <div className={styles.attendanceToday}>
      <div className={styles.header}>
        <h1 className={styles.title}>Điểm danh hôm nay</h1>
        <p className={styles.subtitle}>
          Sử dụng camera để điểm danh học sinh bằng khuôn mặt
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

      <div className={styles.sessionSelector}>
        <label className={styles.label}>
          Chọn buổi học:
          <select
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className={styles.select}
          >
            <option value="">-- Chọn buổi học --</option>
            {todaySessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.courseName} - {new Date(session.startTime).toLocaleTimeString('vi-VN')}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.content}>
        <div className={styles.cameraSection}>
          <CameraBox
            isActive={!!selectedSessionId}
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
                  <h4>Chọn buổi học</h4>
                  <p>Chọn buổi học bạn muốn điểm danh từ danh sách</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoNumber}>2</div>
                <div className={styles.infoContent}>
                  <h4>Bấm "Quét khuôn mặt"</h4>
                  <p>Hệ thống sẽ kích hoạt camera và bắt đầu quét</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoNumber}>3</div>
                <div className={styles.infoContent}>
                  <h4>Đặt khuôn mặt trong khung</h4>
                  <p>Học sinh đặt khuôn mặt trong khung để hệ thống nhận diện</p>
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

export default AttendanceToday

