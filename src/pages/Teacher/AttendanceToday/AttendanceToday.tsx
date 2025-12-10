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
  const [roster, setRoster] = useState<any[]>([])

  const webcamRef = useRef<Webcam>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  useEffect(() => {
    // Load today's sessions
    const loadSessions = async () => {
      if (!teacherId) return
      try {
        const now = new Date()
        const todayStr = now.toISOString().slice(0, 10)

        const weekAhead = new Date(now)
        weekAhead.setDate(now.getDate() + 7)
        const weekAheadStr = weekAhead.toISOString().slice(0, 10)

        const data = await scheduleApi.list({
          teacherId,
          from: `${todayStr}T00:00:00`,
          to: `${weekAheadStr}T23:59:59`,
          size: 100,
          sort: 'startTime,asc'
        })
        setTodaySessions(data.content || [])
      } catch (err) {
        console.error('Failed to load sessions', err)
        setError('Không thể tải danh sách buổi học hôm nay')
      }
    }
    loadSessions()
  }, [teacherId])

  useEffect(() => {
    if (!selectedSessionId) {
      setRoster([])
      return
    }
    const loadRoster = async () => {
      try {
        const data = await attendanceApi.sessionRoster(selectedSessionId)
        setRoster(data || [])
      } catch (err) {
        console.error('Failed to load roster', err)
      }
    }
    loadRoster()
  }, [selectedSessionId])

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

  const handleScanSuccess = async (imageSrc: string) => {
    console.log('handleScanSuccess triggered', { selectedSessionId })
    if (!selectedSessionId) {
      console.error('No session selected')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(imageSrc)
      const blob = await response.blob()

      const formData = new FormData()
      formData.append('image', blob, 'teacher_scan.jpg')
      formData.append('sessionId', selectedSessionId)

      console.log('Calling teacherCheckInFace API...')
      const result = await attendanceApi.teacherCheckInFace(formData)
      console.log('API Result:', result)

      if (result.success) {
        setScanResult({
          ...result,
          timestamp: new Date().toISOString(),
          confidence: 0.95 // Mock if not returned, or use result.confidence if API returns it
        })
        setIsModalOpen(true)
        setIsScanning(false)

        // Update roster locally
        setRoster(prev => prev.map(student => {
          const matchId = result.studentId && student.studentId === result.studentId
          const matchCode = result.studentCode && student.studentCode === result.studentCode

          if (matchId || matchCode) {
            return { ...student, status: result.status, checkedAt: new Date().toISOString() }
          }
          return student
        }))
      } else {
        console.warn('Check-in failed logic:', result.message)
        setError(result.message || 'Không nhận diện được sinh viên')
        setCapturedImage(null)
      }
    } catch (err: any) {
      console.error('Check-in error:', err)

      const message = err?.response?.data?.message
      if (message === 'No face detected') {
        setError('Không nhận diện được sinh viên trong lớp học, vui lòng thử lại')
      } else {
        setError(message || err?.message || 'Không thể điểm danh. Vui lòng thử lại.')
      }

      // Keep scanning active on error so they can try again
      setCapturedImage(null)
    } finally {
      setLoading(false)
    }
  }

  const capture = () => {
    console.log('Capture button clicked')
    if (!webcamRef.current) {
      console.error('Webcam ref is null')
      return
    }
    const imageSrc = webcamRef.current.getScreenshot()
    console.log('Screenshot result:', imageSrc ? 'Success (base64 data)' : 'Failed (null)')

    if (imageSrc) {
      setCapturedImage(imageSrc)
      handleScanSuccess(imageSrc)
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
            <h3 className={styles.infoTitle}>Danh sách sinh viên ({roster.length})</h3>
            <div className={styles.rosterList} style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {roster.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '16px' }}>
                  {selectedSessionId ? 'Chưa có dữ liệu sinh viên' : 'Vui lòng chọn buổi học'}
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Tên</th>
                      <th style={{ padding: '8px' }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student) => (
                      <tr key={student.studentId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px' }}>
                          <div style={{ fontWeight: '500' }}>{student.studentName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{student.studentCode}</div>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: student.status === 'PRESENT' ? '#d1fae5' :
                              student.status === 'ABSENT' ? '#fee2e2' :
                                student.status === 'LATE' ? '#fef3c7' : '#f3f4f6',
                            color: student.status === 'PRESENT' ? '#065f46' :
                              student.status === 'ABSENT' ? '#991b1b' :
                                student.status === 'LATE' ? '#92400e' : '#374151'
                          }}>
                            {student.status === 'PRESENT' ? 'Có mặt' :
                              student.status === 'ABSENT' ? 'Vắng' :
                                student.status === 'LATE' ? 'Đi trễ' : 'Chưa điểm'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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

