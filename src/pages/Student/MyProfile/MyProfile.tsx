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
      <h1 className={styles.title}>Hồ sơ cá nhân</h1>

      {error && <div className={styles.error}>{error}</div>}

      {/* Profile Header Card */}
      <div className={styles.card} style={{background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px'}}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, #667eea 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.3)'
          }}>
            {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{margin: '0 0 8px 0', fontSize: '28px', color: 'var(--primary)'}}>
              {user?.fullName || user?.name || user?.username}
            </h2>
            <p style={{margin: 0, color: 'var(--text-muted)', fontSize: '16px'}}>
              Sinh viên · {user?.email || 'Chưa có email'}
            </p>
          </div>
        </div>
        
        <div className={styles.profileGrid}>
          <div>
            <p>Email</p>
            <strong>{user?.email || 'Chưa cập nhật'}</strong>
          </div>
          <div>
            <p>Tên đăng nhập</p>
            <strong>{user?.username || '-'}</strong>
          </div>
          <div>
            <p>Vai trò</p>
            <strong>{user?.role === 'STUDENT' ? 'Sinh viên' : user?.role || '-'}</strong>
          </div>
          <div>
            <p>Số điện thoại</p>
            <strong>{user?.phone || 'Chưa cập nhật'}</strong>
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
