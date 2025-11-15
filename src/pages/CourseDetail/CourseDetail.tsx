import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './CourseDetail.module.scss'
import { coursesApi, type CourseSummary } from '../../services/courses'
import { enrollmentsApi, type EnrollmentRow } from '../../services/enrollments'
import { scheduleApi, type ClassSession } from '../../services/schedule'

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  
  const [course, setCourse] = useState<CourseSummary | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([])
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const [courseData, enrollmentData] = await Promise.all([
          coursesApi.getById(courseId),
          enrollmentsApi.listByCourse(courseId)
        ])
        
        setCourse(courseData)
        setEnrollments(enrollmentData || [])
      } catch (err: any) {
        setError(err?.message ?? 'Không thể tải thông tin môn học')
      } finally {
        setLoading(false)
      }
    }

    loadCourseData()
  }, [courseId])

  useEffect(() => {
    const loadSessions = async () => {
      if (!courseId) return
      
      setSessionsLoading(true)
      
      try {
        const response = await scheduleApi.list({
          courseId,
          size: 100,
          sort: 'startTime,asc'
        })
        
        setSessions(response.content || [])
      } catch (err: any) {
        console.error('Failed to load sessions:', err)
      } finally {
        setSessionsLoading(false)
      }
    }

    if (course) {
      loadSessions()
    }
  }, [courseId, course])

  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDayOfWeek = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return days[date.getDay()]
  }

  const groupSessionsByWeek = (sessions: ClassSession[]) => {
    const grouped: { [key: string]: ClassSession[] } = {}
    
    sessions.forEach(session => {
      const date = new Date(session.startTime)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay() + 1) // Monday
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = []
      }
      grouped[weekKey].push(session)
    })
    
    return grouped
  }

  const sessionsByWeek = groupSessionsByWeek(sessions)

  if (loading) {
    return (
      <div className={styles.root}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className={styles.root}>
        <div className={styles.error}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h2>{error || 'Không tìm thấy môn học'}</h2>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            ← Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Quay lại
        </button>
        <div className={styles.headerContent}>
          <div className={styles.courseIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>{course.name}</h1>
            <p className={styles.courseCode}>Mã môn: {course.code}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{enrollments.length}</div>
            <div className={styles.statLabel}>Sinh viên</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 11V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{course.teacher_name || 'Chưa gán'}</div>
            <div className={styles.statLabel}>Giảng viên</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{course.credits ?? '-'}</div>
            <div className={styles.statLabel}>Tín chỉ</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L1 9L12 15L23 9L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 13L12 19L23 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{course.faculty_name || 'Chưa gán'}</div>
            <div className={styles.statLabel}>Khoa</div>
          </div>
        </div>
      </div>

      {/* Course Info */}
      <div className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Thông tin môn học
        </h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Mã môn học:</span>
            <span className={styles.infoValue}>{course.code}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Tên môn học:</span>
            <span className={styles.infoValue}>{course.name}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Giảng viên:</span>
            <span className={styles.infoValue}>{course.teacher_name || 'Chưa gán'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Khoa:</span>
            <span className={styles.infoValue}>{course.faculty_name || 'Chưa gán'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Số tín chỉ:</span>
            <span className={styles.infoValue}>{course.credits ?? 'Chưa xác định'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Số sinh viên:</span>
            <span className={styles.infoValue}>{enrollments.length} sinh viên</span>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <div className={styles.scheduleSection}>
        <h2 className={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Lịch học ({sessions.length} buổi)
        </h2>
        
        {sessionsLoading && <div className={styles.loading}>Đang tải lịch học...</div>}
        
        {!sessionsLoading && sessions.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <p>Chưa có lịch học nào được tạo cho môn học này</p>
          </div>
        )}

        {!sessionsLoading && sessions.length > 0 && (
          <div className={styles.scheduleContent}>
            {Object.entries(sessionsByWeek).map(([weekStart, weekSessions]) => {
              const weekStartDate = new Date(weekStart)
              const weekEndDate = new Date(weekStartDate)
              weekEndDate.setDate(weekEndDate.getDate() + 6)
              
              return (
                <div key={weekStart} className={styles.weekBlock}>
                  <div className={styles.weekHeader}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <h3>
                      Tuần {weekStartDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {weekEndDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </h3>
                    <span className={styles.sessionCount}>{weekSessions.length} buổi</span>
                  </div>
                  
                  <div className={styles.sessionList}>
                    {weekSessions.map((session) => (
                      <div 
                        key={session.sessionId} 
                        className={styles.sessionCard}
                        onClick={() => navigate(`/session/${session.sessionId}`)}
                      >
                        <div className={styles.sessionDay}>
                          <div className={styles.dayLabel}>{getDayOfWeek(session.startTime)}</div>
                          <div className={styles.dateLabel}>
                            {new Date(session.startTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                          </div>
                        </div>
                        
                        <div className={styles.sessionDetails}>
                          <div className={styles.sessionTime}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
                          </div>
                          
                          <div className={styles.sessionRoom}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Phòng {session.roomName}</span>
                          </div>
                        </div>
                        
                        <div className={styles.sessionStatus}>
                          {session.locked ? (
                            <span className={styles.statusLocked}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              Đã khóa
                            </span>
                          ) : (
                            <span className={styles.statusOpen}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                              Mở
                            </span>
                          )}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={styles.arrowIcon}>
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Students List */}
      <div className={styles.studentsSection}>
        <h2 className={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Danh sách sinh viên ({enrollments.length})
        </h2>
        
        {!sessionsLoading && enrollments.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 9H9.01M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>Chưa có sinh viên nào đăng ký môn học này</p>
          </div>
        )}

        {enrollments.length > 0 && (
          <div className={styles.studentGrid}>
            {enrollments.map((enrollment, index) => (
              <div key={enrollment.enrollmentId} className={styles.studentCard}>
                <div className={styles.studentAvatar}>
                  {index + 1}
                </div>
                <div className={styles.studentInfo}>
                  <h3 className={styles.studentName}>{enrollment.studentName || 'N/A'}</h3>
                  <p className={styles.studentEmail}>{enrollment.studentEmail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseDetail
