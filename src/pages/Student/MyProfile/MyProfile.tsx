import React, { useEffect, useMemo, useState } from 'react'
import styles from '../Student.module.scss'
import { useAuthStore } from '../../../store/useAuthStore'
import { studentApi, type StudentAttendanceStats } from '../../../services/student'
import type { ClassSession } from '../../../services/schedule'

const formatTime = (value: string) => {
  try {
    const date = new Date(value)
    return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } catch {
    return value
  }
}

const MyProfile: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState<StudentAttendanceStats[]>([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setStatsLoading(true)
      setSessionsLoading(true)
      setError(null)
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          studentApi.myAttendanceStats({}),
          studentApi.mySessions({
            from: new Date().toISOString(),
            size: 5,
            sort: 'startTime,asc',
          }),
        ])
        setStats(statsRes || [])
        setSessions(sessionsRes.content || [])
      } catch (err: any) {
        setError(err?.message ?? 'Không thể tải dữ liệu hồ sơ')
      } finally {
        setStatsLoading(false)
        setSessionsLoading(false)
      }
    }
    fetchData()
  }, [])

  const overallRate = useMemo(() => {
    if (!stats.length) return 0
    const sum = stats.reduce((acc, item) => acc + item.attendanceRate, 0)
    return sum / stats.length
  }, [stats])

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Profile</h1>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.card}>
        <h3>Thông tin cá nhân</h3>
        <div className={styles.profileGrid}>
          <div>
            <p>Tên</p>
            <strong>{user?.fullName || user?.name || user?.username}</strong>
          </div>
          <div>
            <p>Email</p>
            <strong>{user?.email || '-'}</strong>
          </div>
          <div>
            <p>Username</p>
            <strong>{user?.username || '-'}</strong>
          </div>
          <div>
            <p>Role</p>
            <strong>{user?.role || '-'}</strong>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3>Thống kê điểm danh</h3>
        {statsLoading && <div>Đang tải...</div>}
        {!statsLoading && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <p>Tỉ lệ trung bình</p>
                <strong>{overallRate.toFixed(1)}%</strong>
              </div>
              <div className={styles.statCard}>
                <p>Môn học đang theo</p>
                <strong>{stats.length}</strong>
              </div>
            </div>
            {stats.length === 0 && <p>Chưa có dữ liệu điểm danh.</p>}
            {stats.length > 0 && (
              <div className={styles.courseList}>
                {stats.slice(0, 5).map((item) => (
                  <div key={item.courseId} className={styles.courseItem}>
                    <div className={styles.courseHeader}>
                      <strong>{item.courseCode}</strong>
                      <span>{item.attendanceRate.toFixed(1)}%</span>
                    </div>
                    <p>{item.courseName}</p>
                    <div className={styles.statsRow}>
                      <span>Có mặt: {item.presentCount}</span>
                      <span>Trễ: {item.lateCount}</span>
                      <span>Miễn: {item.excusedCount}</span>
                      <span>Vắng: {item.absentCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.card}>
        <h3>Buổi học sắp tới</h3>
        {sessionsLoading && <div>Đang tải...</div>}
        {!sessionsLoading && sessions.length === 0 && <p>Không có buổi học nào trong danh sách.</p>}
        {!sessionsLoading && sessions.length > 0 && (
          <ul className={styles.sessionList}>
            {sessions.map((session) => (
              <li key={session.sessionId} className={styles.sessionItem}>
                <div className={styles.sessionCourse}>
                  <strong>{session.courseCode}</strong> - {session.courseName}
                </div>
                <div className={styles.sessionMeta}>
                  <span>{formatTime(session.startTime)}</span>
                  <span>Room {session.roomName || '-'}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default MyProfile
