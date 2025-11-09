import React, { useEffect, useMemo, useState } from 'react'
import styles from '../Dashboard.module.scss'
import { dashboardApi, type StudentDashboardResponse } from '../../../services/dashboard'

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<StudentDashboardResponse | null>(null)

  useEffect(() => {
    let mounted = true
    dashboardApi
      .student()
      .then((res) => {
        if (mounted) setData(res)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const needFaceEnroll = useMemo(() => {
    return !(data?.faceRegistered ?? false)
  }, [data])

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <p className={styles.dashboardSubtitle}>Tổng quan cá nhân (STUDENT)</p>
      </div>

      <div className={styles.dashboardContent}>
        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Lịch học hôm nay</h3>
            </div>
            <div className={styles.chartPlaceholder}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 11H17V13H7V11ZM7 7H17V9H7V7ZM5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {data?.todaySessions && data.todaySessions.length > 0 ? (
                <div style={{ width: '100%' }}>
                  <p>{`Có ${data.todaySessions.length} buổi học hôm nay`}</p>
                  {data.todaySessions.slice(0, 3).map((s) => (
                    <div key={(s.sessionId || s.id)!} style={{ fontSize: 13, marginTop: 6 }}>
                      <strong>{s.courseCode}</strong> • {s.courseName}
                      <br />
                      {new Date(s.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(s.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      {' • Phòng '}
                      {s.roomName}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p>Chưa có dữ liệu lịch học</p>
                  <span>Vào mục "Thời khóa biểu" để xem chi tiết</span>
                </>
              )}
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Trạng thái điểm danh gần nhất</h3>
            </div>
            <div className={styles.chartPlaceholder}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {data?.latestAttendance ? (
                <>
                  <p>
                    {new Date(data.latestAttendance.checkedAt || data.latestAttendance.startTime).toLocaleString('vi-VN')}
                    {' • '}
                    {data.latestAttendance.status}
                  </p>
                  <span>Môn: {data.latestAttendance.courseCode} • {data.latestAttendance.courseName}</span>
                </>
              ) : (
                <>
                  <p>Chưa có lịch sử điểm danh</p>
                  <span>Bắt đầu điểm danh ở buổi học tiếp theo</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.activitySection}>
          <div className={styles.activityCard}>
            <div className={styles.activityHeader}>
              <h3 className={styles.activityTitle}>Cảnh báo khuôn mặt</h3>
            </div>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V13M12 17H12.01M12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.activityContent}>
                  {needFaceEnroll ? (
                    <>
                      <p className={styles.activityText}>Bạn chưa đăng ký ảnh khuôn mặt.</p>
                      <span className={styles.activityTime}>Vào mục "Đăng ký khuôn mặt" để thêm ảnh</span>
                    </>
                  ) : (
                    <>
                      <p className={styles.activityText}>Đã có mẫu khuôn mặt từ lần điểm danh gần nhất.</p>
                      <span className={styles.activityTime}>Không có cảnh báo</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard

