import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Webcam from 'react-webcam'
import { attendanceApi } from '../../services/attendance'
import styles from './FaceEnrollment.module.scss'

const FaceEnrollment: React.FC = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  return (
    <AttendanceCheckInContent sessionId={sessionId} />
  )
}

const AttendanceCheckInContent: React.FC<{ sessionId: string | null }> = ({ sessionId }) => {
  const navigate = useNavigate()
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<any>(null)
  const [faceStatus, setFaceStatus] = useState<{ isRegistered: boolean; qualityScore?: number } | null>(null)

  useEffect(() => {
    // Check face status on load
    attendanceApi.checkFaceStatus().then(status => {
      setFaceStatus(status)
    }).catch(err => {
      console.error('Failed to check face status', err)
    })

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (err) => {
          setError('Vui lòng bật định vị (GPS) để điểm danh.')
        }
      )
    }
  }, [])

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setImgSrc(imageSrc)
    }
  }, [webcamRef])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          setImgSrc(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const retake = () => {
    setImgSrc(null)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!sessionId) {
      setError('Thiếu Session ID')
      return
    }
    if (!imgSrc) return
    if (!location) {
      setError('Chưa lấy được vị trí. Vui lòng thử lại.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Convert base64 to blob
      const res = await fetch(imgSrc)
      const blob = await res.blob()

      const formData = new FormData()
      formData.append('image', blob, 'checkin.jpg')
      formData.append('sessionId', sessionId)
      formData.append('latitude', location.lat.toString())
      formData.append('longitude', location.lng.toString())

      const response = await attendanceApi.checkInHybrid(formData)
      setSuccessData(response)
    } catch (err: any) {
      console.error(err)

      // Handle 401 Face Verification Failed
      if (err.response?.status === 401 && err.response?.data?.error === 'Face Verification Failed') {
        const msg = err.response?.data?.message || ''
        // Extract confidence using regex
        const match = msg.match(/Confidence:\s*([\d.]+)/)
        const confidence = match ? parseFloat(match[1]) : 0

        setError(`Khuôn mặt không khớp với dữ liệu đăng ký (Độ chính xác: ${confidence.toFixed(2)}). Vui lòng chụp rõ mặt hơn.`)
      } else if (err.response?.status === 400 && err.response?.data?.message === 'User has not registered face data') {
        setError('Bạn chưa thực hiện đăng kí khuôn mặt cho việc điểm danh, Vui lòng liên hệ với trường thông qua email suport@hcmuaf.edu.vn')
      } else if (err.response?.status === 400 && err.response?.data?.message === 'OUT_OF_GEOFENCE') {
        setError('Vị trí của bạn không nằm trong phạm vi lớp học. Vui lòng di chuyển đến đúng phòng học và thử lại.')
      } else if (err.response?.status === 400 && err.response?.data?.message === 'SESSION_LOCKED') {
        setError('Giảng viên đã khóa điểm danh, vui lòng liên hệ với giảng viên để thực hiện điểm danh')
      } else {
        setError('Điểm danh thất bại. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLocationCheckIn = async () => {
    if (!sessionId) return
    if (!location) {
      setError('Chưa lấy được vị trí.')
      return
    }
    setLoading(true)
    try {
      const res = await attendanceApi.selfCheckin({
        session_id: sessionId,
        studentLat: location.lat,
        studentLng: location.lng
      })
      setSuccessData({ ...(res as any), checkInType: 'LOCATION_ONLY' })
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message === 'OUT_OF_GEOFENCE') {
        setError('Vị trí của bạn không nằm trong phạm vi lớp học. Vui lòng di chuyển đến đúng phòng học và thử lại.')
      } else if (err.response?.status === 400 && err.response?.data?.message === 'SESSION_LOCKED') {
        setError('Giảng viên đã khóa điểm danh, vui lòng liên hệ với giảng viên để thực hiện điểm danh')
      } else {
        setError('Điểm danh vị trí thất bại. Vui lòng thử lại.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (successData) {
    return (
      <div className={styles.faceEnrollment}>
        <div className={styles.successContent}>
          <div className={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2>Điểm danh thành công!</h2>
          <p>Phương thức: {successData.checkInType === 'FACE_AND_LOCATION' ? 'Khuôn mặt + Vị trí' : 'Vị trí'}</p>
          {successData.confidence && <p>Độ chính xác: {(successData.confidence * 100).toFixed(1)}%</p>}
          <button className={styles.button} onClick={() => navigate('/my-schedule')}>
            Về lịch học
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.faceEnrollment}>
      <div className={styles.header}>
        <h1 className={styles.title}>Điểm danh</h1>
        <p className={styles.subtitle}>Chụp ảnh khuôn mặt để điểm danh</p>
        {faceStatus && (
          <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
            Trạng thái khuôn mặt:
            <span style={{
              fontWeight: 'bold',
              color: faceStatus.isRegistered ? '#059669' : '#d97706',
              marginLeft: '4px'
            }}>
              {faceStatus.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}
            </span>
          </div>
        )}
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.cameraSection}>
          {!imgSrc ? (
            <div className={styles.cameraWrapper}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                height="100%"
                videoConstraints={{ facingMode: 'user' }}
                className={styles.webcam}
              />

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />

              <div className={styles.controlsWrapper}>
                <button
                  onClick={triggerFileUpload}
                  className={styles.uploadButton}
                  title="Tải ảnh lên"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 16V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V16M12 12V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <button onClick={capture} className={styles.captureButton}>
                  <div className={styles.captureInner} />
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.previewWrapper}>
              <img src={imgSrc} alt="Preview" />
              <div className={styles.previewActions}>
                <button onClick={retake} className={styles.secondaryButton}>Chụp lại</button>
                <button onClick={handleSubmit} className={styles.primaryButton} disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Gửi điểm danh'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3>Thông tin vị trí</h3>
            {location ? (
              <p className={styles.locationSuccess}>
                ✓ Đã lấy được vị trí ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
              </p>
            ) : (
              <p className={styles.locationPending}>Dang lấy vị trí...</p>
            )}
          </div>

          <div className={styles.fallbackSection}>
            <p>Không thể nhận diện khuôn mặt?</p>
            <button
              onClick={handleLocationCheckIn}
              disabled={!location || loading}
              className={styles.textButton}
            >
              Điểm danh bằng vị trí (Fallback)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FaceEnrollment
