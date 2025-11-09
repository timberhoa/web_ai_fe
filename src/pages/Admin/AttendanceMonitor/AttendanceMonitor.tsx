import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../Admin.module.scss'
import pageStyles from './AttendanceMonitor.module.scss'
import { coursesApi, type CourseSummary } from '../../../services/courses'
import { adminUsersApi, type AdminUser } from '../../../services/adminUsers'
import { attendanceApi, type MonitorSession } from '../../../services/attendance'

const formatDateRange = (start?: string, end?: string) => {
  if (!start || !end) return '-'
  try {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } catch {
    return `${start} - ${end}`
  }
}

const statusLabel: Record<string, { text: string; tone: 'live' | 'upcoming' | 'done' }> = {
  LIVE: { text: 'Đang diễn ra', tone: 'live' },
  UPCOMING: { text: 'Sắp diễn ra', tone: 'upcoming' },
  ENDED: { text: 'Đã kết thúc', tone: 'done' },
}

const AttendanceMonitor: React.FC = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [teachers, setTeachers] = useState<AdminUser[]>([])
  const [sessions, setSessions] = useState<MonitorSession[]>([])
  const [filters, setFilters] = useState({
    courseId: '',
    teacherId: '',
    minutesBefore: 30,
    minutesAfter: 20,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadLookups = useCallback(async () => {
    try {
      const [coursePage, teacherPage] = await Promise.all([
        coursesApi.adminList({ page: 0, size: 200, sort: 'name,asc' }),
        adminUsersApi.listByRole('TEACHER', { page: 0, size: 200, sort: 'fullName,asc' }),
      ])
      setCourses(coursePage.content || [])
      setTeachers(teacherPage.content || [])
    } catch (err) {
      console.warn('Không thể tải dữ liệu tham chiếu', err)
    }
  }, [])

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await attendanceApi.monitor({
        courseId: filters.courseId || undefined,
        teacherId: filters.teacherId || undefined,
        minutesBefore: filters.minutesBefore,
        minutesAfter: filters.minutesAfter,
      })
      setSessions(data || [])
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải dữ liệu giám sát')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadLookups()
    fetchSessions()
  }, [loadLookups, fetchSessions])

  useEffect(() => {
    if (!autoRefresh) return
    const id = window.setInterval(() => {
      fetchSessions()
    }, 30000)
    return () => window.clearInterval(id)
  }, [autoRefresh, fetchSessions])

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
  }, [sessions])

  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: name === 'minutesBefore' || name === 'minutesAfter' ? Number(value) : value,
    }))
  }

  const renderStatus = (session: MonitorSession) => {
    const meta = statusLabel[session.status || ''] ?? statusLabel.UPCOMING
    return (
      <span className={`${pageStyles.statusBadge} ${pageStyles[`statusBadge--${meta.tone}`]}`}>
        {meta.text}
      </span>
    )
  }

  const renderLock = (locked?: boolean) => (
    <span className={locked ? pageStyles.locked : pageStyles.unlocked}>
      {locked ? 'Đã khóa' : 'Đang mở'}
    </span>
  )

  return (
    <div className={`${styles.page} ${pageStyles.root}`}>
      <h1 className={styles.title}>Giám sát điểm danh theo thời gian thực</h1>

      <div className={styles.toolbar}>
        <select name="courseId" value={filters.courseId} onChange={handleInputChange}>
          <option value="">Tất cả môn học</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code ? `${course.code} - ${course.name}` : course.name}
            </option>
          ))}
        </select>
        <select name="teacherId" value={filters.teacherId} onChange={handleInputChange}>
          <option value="">Tất cả giảng viên</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName || teacher.username}
            </option>
          ))}
        </select>
        <label>
          Trước (phút)
          <input
            type="number"
            min={5}
            max={180}
            name="minutesBefore"
            value={filters.minutesBefore}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Sau (phút)
          <input
            type="number"
            min={5}
            max={180}
            name="minutesAfter"
            value={filters.minutesAfter}
            onChange={handleInputChange}
          />
        </label>
        <button type="button" onClick={fetchSessions} disabled={loading}>
          Làm mới
        </button>
        <label className={pageStyles.autoToggle}>
          <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
          Tự động cập nhật
        </label>
      </div>

      <div className={pageStyles.metaRow}>
          <span>
            {lastUpdated ? `Cập nhật: ${lastUpdated.toLocaleTimeString()}` : 'Chưa có dữ liệu'}
          </span>
          <span>{sortedSessions.length} phiên trong cửa sổ theo dõi</span>
      </div>

      {error && <div className={pageStyles.error}>{error}</div>}

      <div className={pageStyles.sessionGrid}>
        {loading && <div className={pageStyles.card}>Đang tải dữ liệu...</div>}
        {!loading && sortedSessions.length === 0 && <div className={pageStyles.card}>Không có phiên học trong khoảng thời gian này.</div>}
        {!loading &&
          sortedSessions.map((session) => (
            <div key={session.sessionId} className={pageStyles.card}>
              <div className={pageStyles.cardHeader}>
                <div>
                  <strong>{session.courseCode || session.courseName}</strong>
                  <p>{session.courseName}</p>
                </div>
                <div className={pageStyles.badgeStack}>
                  {renderStatus(session)}
                  {renderLock(session.locked)}
                </div>
              </div>

              <div className={pageStyles.cardBody}>
                <div>
                  <p className={pageStyles.label}>Giảng viên</p>
                  <span>{session.teacherName || '-'}</span>
                </div>
                <div>
                  <p className={pageStyles.label}>Phòng</p>
                  <span>{session.roomName || '-'}</span>
                </div>
                <div>
                  <p className={pageStyles.label}>Thời gian</p>
                  <span>{formatDateRange(session.startTime, session.endTime)}</span>
                </div>
                <div>
                  <p className={pageStyles.label}>Camera</p>
                  <span className={session.streamStatus === 'ONLINE' ? pageStyles.online : pageStyles.offline}>
                    {session.streamStatus === 'ONLINE' ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className={pageStyles.statsRow}>
                <div>
                  <p className={pageStyles.label}>Đã điểm danh</p>
                  <strong>{session.totalMarked ?? session.present ?? 0}</strong>
                </div>
                <div>
                  <p className={pageStyles.label}>Có mặt</p>
                  <strong>{session.present ?? 0}</strong>
                </div>
                <div>
                  <p className={pageStyles.label}>Đi trễ</p>
                  <strong>{session.late ?? 0}</strong>
                </div>
                <div>
                  <p className={pageStyles.label}>Vắng</p>
                  <strong>{session.absent ?? 0}</strong>
                </div>
              </div>

              <div className={pageStyles.cardFooter}>
                <div>
                  <p className={pageStyles.label}>Sự kiện gần nhất</p>
                  <span>{session.lastEvent || 'Chưa có sự kiện'}</span>
                </div>
                <button type="button" onClick={() => navigate(`/attendance/review?sessionId=${session.sessionId}`)}>
                  Rà soát
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default AttendanceMonitor
