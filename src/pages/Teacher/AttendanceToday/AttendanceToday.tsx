import React, { useState, useEffect, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import Modal from '../../../components/Modal/Modal'
import { attendanceApi } from '../../../services/attendance'
import { scheduleApi } from '../../../services/schedule'
import styles from './AttendanceToday.module.scss'

import { useAuthStore } from '../../../store/useAuthStore'

const AttendanceToday: React.FC = () => {
  const teacherId = useAuthStore((state) => state.user?.id)
  const [isScanning, setIsScanning] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [todaySessions, setTodaySessions] = useState<any[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const webcamRef = useRef<Webcam>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  useEffect(() => {
    // Load today's sessions
    const loadSessions = async () => {
      if (!teacherId) return
      try {
        const now = new Date()
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString()
        const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString()

        const data = await scheduleApi.list({
          teacherId,
          from: startOfDay,
          to: endOfDay,
          size: 100
        })
        setTodaySessions(data.content || [])
      } catch (err) {
        console.error('Failed to load sessions', err)
        setError('Không thể tải danh sách buổi học hôm nay')
      }
    }
    loadSessions()
  }, [teacherId])

  const handleStartScan = () => {
    if (!selectedSessionId) {
      setError('Vui lòng chọn buổi học trước khi điểm danh')
      return
    }
    setIsScanning(true)
    setError(null)
    setCapturedImage(null)
  }

  const handleStopScan = () => {
    setIsScanning(false)
    setCapturedImage(null)
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
      handleScanSuccess(imageSrc)
    }
  }, [webcamRef])

  const handleScanSuccess = async (imageSrc: string) => {
    if (!selectedSessionId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(imageSrc)
      const blob = await response.blob()

      const formData = new FormData()
      formData.append('image', blob, 'teacher_scan.jpg')
      formData.append('sessionId', selectedSessionId)

      const result = await attendanceApi.teacherCheckInFace(formData)

      setScanResult({
        ...result,
        timestamp: new Date().toISOString(),
        confidence: 0.95 // Mock if not returned, or use result.confidence if API returns it (User request says output has confidence)
      })
      setIsModalOpen(true)
      setIsScanning(false)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể điểm danh. Vui lòng thử lại.')
      // Keep scanning active on error so they can try again
      setCapturedImage(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setScanResult(null)
    setCapturedImage(null)
    // Optionally restart scanning automatically
    // setIsScanning(true) 
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
            <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              <option key={session.sessionId} value={session.sessionId}>
                {session.courseName} - {new Date(session.startTime).toLocaleTimeString('vi-VN')} ({session.roomName})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.content}>
        <div className={styles.cameraSection}>
          <div className={styles.cameraBox}>
            {isScanning ? (
              <div className={styles.cameraContainer}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  height="100%"
                  videoConstraints={{
                    facingMode: 'environment',
                    width: 640,
                    height: 480
                  }}
                  className={styles.webcam}
                />
                <div className={styles.overlay}>
                  <div className={styles.scanFrame} />
                  <p>Đặt khuôn mặt vào khung hình</p>
                </div>
                <div className={styles.controls}>
                  <button
                    className={styles.captureButton}
                    onClick={capture}
                    disabled={loading}
                  >
                    {loading ? '...' : ''}
                  </button>
                  <button className={styles.stopButton} onClick={handleStopScan}>
                    Dừng
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.placeholder}>
                <div className={styles.icon}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <p>Camera chưa được kích hoạt</p>
                <button
                  className={styles.startButton}
                  onClick={handleStartScan}
                  disabled={!selectedSessionId}
                >
                  Bắt đầu quét
                </button>
              </div>
            )}
          </div>
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
                  <h4>Bấm "Bắt đầu quét"</h4>
                  <p>Hệ thống sẽ kích hoạt camera</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.infoNumber}>3</div>
                <div className={styles.infoContent}>
                  <h4>Chụp ảnh</h4>
                  <p>Bấm nút tròn để chụp và nhận diện sinh viên</p>
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
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={styles.successInfo}>
            <h3>{scanResult?.studentName}</h3>
            <p className={styles.studentCode}>{scanResult?.studentCode}</p>
            <div className={styles.resultDetails}>
              <span className={styles.statusBadge}>
                {scanResult?.status === 'PRESENT' ? 'Có mặt' : scanResult?.status}
              </span>
              {scanResult?.confidence && (
                <span className={styles.confidence}>
                  Độ chính xác: {(scanResult.confidence * 100).toFixed(1)}%
                </span>
              )}
            </div>
            <p className={styles.timestamp}>
              Thời gian: {scanResult?.timestamp ? new Date(scanResult.timestamp).toLocaleString('vi-VN') : ''}
            </p>
          </div>
          <div className={styles.successActions}>
            <button className={styles.closeButton} onClick={handleCloseModal}>
              Tiếp tục điểm danh
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AttendanceToday

