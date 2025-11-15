import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../Dashboard.module.scss'
import { dashboardApi, type StudentDashboardResponse } from '../../../services/dashboard'
import { studentApi, type StudentAttendanceStats } from '../../../services/student'
import { enrollmentsApi, type StudentCourse } from '../../../services/enrollments'

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<StudentDashboardResponse | null>(null)
  const [stats, setStats] = useState<StudentAttendanceStats[]>([])
  const [courses, setCourses] = useState<StudentCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [dashboardData, statsData, coursesData] = await Promise.all([
          dashboardApi.student().catch(() => null),
          studentApi.myAttendanceStats({}).catch(() => []),
          enrollmentsApi.myCourses().catch(() => [])
        ])
        
        setData(dashboardData)
        setStats(statsData || [])
        setCourses(coursesData || [])
      } catch (err: any) {
        setError('Không thể tải dữ liệu dashboard')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const needFaceEnroll = useMemo(() => {
    return !(data?.faceRegistered ?? false)
  }, [data])

  const overallRate = useMemo(() => {
    if (!stats.length) return 0
    const sum = stats.reduce((acc, item) => acc + item.attendanceRate, 0)
    return Math.round(sum / stats.length)
  }, [stats])

  const totalSessions = useMemo(() => {
    return stats.reduce((acc, item) => acc + item.totalSessions, 0)
  }, [stats])

  const totalPresent = useMemo(() => {
    return stats.reduce((acc, item) => acc + item.presentCount + item.lateCount + item.excusedCount, 0)
  }, [stats])

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <p className={styles.dashboardSubtitle}>Tổng quan học tập của bạn</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>Không thể tải một số dữ liệu. Vui lòng thử lại sau.</span>
        </div>
      )}

      <div className={styles.dashboardContent}>
        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Môn học</p>
              <h3 className={styles.statValue}>{courses.length}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Tổng buổi học</p>
              <h3 className={styles.statValue}>{totalSessions}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Đã điểm danh</p>
              <h3 className={styles.statValue}>{totalPresent}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Tỷ lệ điểm danh</p>
              <h3 className={styles.statValue}>{overallRate}%</h3>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.chartsSection}>
          {/* Today's Schedule */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Lịch học hôm nay</h3>
              <button 
                className={styles.viewAllBtn}
                onClick={() => navigate('/my-schedule')}
              >
                Xem tất cả
              </button>
            </div>
            <div className={styles.scheduleList}>
              {data?.todaySessions && data.todaySessions.length > 0 ? (
                data.todaySessions.slice(0, 5).map((session) => (
                  <div 
                    key={session.sessionId || session.id} 
                    className={styles.scheduleItem}
                    onClick={() => navigate(`/session/${session.sessionId || session.id}`)}
                  >
                    <div className={styles.scheduleTime}>
                      <span className={styles.timeLabel}>
                        {new Date(session.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={styles.timeSeparator}>-</span>
                      <span className={styles.timeLabel}>
                        {new Date(session.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={styles.scheduleInfo}>
                      <h4 className={styles.courseName}>
                        <span className={styles.courseCode}>{session.courseCode}</span>
                        {session.courseName}
                      </h4>
                      <p className={styles.roomInfo}>Phòng: {session.roomName}</p>
                    </div>
                    <div className={styles.scheduleAction}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Không có buổi học nào hôm nay</p>
                  <span>Hãy kiểm tra lịch học tuần này</span>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Stats by Course */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Điểm danh theo môn học</h3>
              <button 
                className={styles.viewAllBtn}
                onClick={() => navigate('/my-attendance')}
              >
                Xem chi tiết
              </button>
            </div>
            <div className={styles.courseStatsList}>
              {stats.length > 0 ? (
                stats.slice(0, 5).map((stat) => (
                  <div key={stat.courseId} className={styles.courseStatItem}>
                    <div className={styles.courseStatHeader}>
                      <span className={styles.courseStatCode}>{stat.courseCode}</span>
                      <span className={styles.courseStatRate}>{stat.attendanceRate.toFixed(1)}%</span>
                    </div>
                    <p className={styles.courseStatName}>{stat.courseName}</p>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{width: `${stat.attendanceRate}%`}}
                      ></div>
                    </div>
                    <div className={styles.courseStatDetails}>
                      <span>Có mặt: {stat.presentCount}</span>
                      <span>Vắng: {stat.absentCount}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Chưa có dữ liệu điểm danh</p>
                  <span>Dữ liệu sẽ được cập nhật sau buổi học đầu tiên</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className={styles.activitySection}>
          <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <h3 className={styles.activityTitle}>Thông báo</h3>
            </div>
            <div className={styles.activityList}>
              {needFaceEnroll && (
                <div className={styles.activityItem} onClick={() => navigate('/face-enrollment')}>
                  <div className={styles.activityIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 9V13M12 17H12.01M12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>Bạn chưa đăng ký khuôn mặt</p>
                    <span className={styles.activityTime}>Nhấn để đăng ký ngay</span>
                  </div>
                  <div className={styles.activityAction}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )}
              
              {data?.latestAttendance && (
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76489 14.1003 1.98232 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>
                      Điểm danh gần nhất: {data.latestAttendance.status}
                    </p>
                    <span className={styles.activityTime}>
                      {data.latestAttendance.courseCode} · {new Date(data.latestAttendance.checkedAt || data.latestAttendance.startTime).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              )}

              {!needFaceEnroll && !data?.latestAttendance && (
                <div className={styles.emptyState}>
                  <p>Không có thông báo mới</p>
                </div>
              )}
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <h3 className={styles.activityTitle}>Môn học đã đăng ký</h3>
            </div>
            <div className={styles.coursesList}>
              {courses.length > 0 ? (
                courses.slice(0, 5).map((course) => (
                  <div key={course.id} className={styles.courseItem}>
                    <div className={styles.courseItemHeader}>
                      <span className={styles.courseItemCode}>{course.code}</span>
                      <span className={styles.courseItemCredits}>{course.credits || 0} TC</span>
                    </div>
                    <p className={styles.courseItemName}>{course.name}</p>
                    <p className={styles.courseItemTeacher}>GV: {course.teacher_name || 'Chưa có'}</p>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Chưa đăng ký môn học nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
