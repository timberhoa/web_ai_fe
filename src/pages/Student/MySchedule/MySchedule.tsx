import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../Student.module.scss'
import type { ClassSession } from '../../../services/schedule'
import { enrollmentsApi, type StudentCourse } from '../../../services/enrollments'
import { studentApi } from '../../../services/student'

const toDateInput = (date: Date) => {
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const formatDateLabel = (value: string) => {
  try {
    return new Date(value).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return value
  }
}

const formatTimeRange = (start: string, end: string) => {
  try {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`
  } catch {
    return `${start} - ${end}`
  }
}

const startOfWeek = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  now.setDate(now.getDate() + diff)
  now.setHours(0, 0, 0, 0)
  return now
}

const defaultFromDate = startOfWeek()
const defaultToDate = new Date(defaultFromDate.getTime() + 6 * 24 * 60 * 60 * 1000)
const defaultFrom = toDateInput(defaultFromDate)
const defaultTo = toDateInput(defaultToDate)

const MySchedule: React.FC = () => {
  const navigate = useNavigate()
  const [from, setFrom] = useState<string>(defaultFrom)
  const [to, setTo] = useState<string>(defaultTo)
  const [keyword, setKeyword] = useState('')
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myCourses, setMyCourses] = useState<StudentCourse[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [coursesError, setCoursesError] = useState<string | null>(null)
  const [courseFilter, setCourseFilter] = useState<string>('ALL')

  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await studentApi.mySessions({
        from: from ? `${from}T00:00:00` : undefined,
        to: to ? `${to}T23:59:59` : undefined,
        page: 0,
        size: 200,
        sort: 'startTime,asc',
      })
      setSessions(data.content || [])
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const loadCourses = async () => {
      setCoursesLoading(true)
      setCoursesError(null)
      try {
        const data = await enrollmentsApi.myCourses()
        setMyCourses(data || [])
      } catch (err: any) {
        setCoursesError(err?.message ?? 'Không thể tải danh sách môn học')
      } finally {
        setCoursesLoading(false)
      }
    }
    loadCourses()
  }, [])

  const filteredSessions = useMemo(() => {
    let list = sessions
    if (courseFilter !== 'ALL') {
      list = list.filter((session) => session.courseId === courseFilter)
    }
    if (!keyword) return list
    const q = keyword.toLowerCase()
    return list.filter((session) => {
      const target = [session.courseName, session.courseCode, session.roomName].join(' ').toLowerCase()
      return target.includes(q)
    })
  }, [keyword, sessions, courseFilter])

  const groupedSessions = useMemo(() => {
    const map = new Map<string, ClassSession[]>()
    filteredSessions.forEach((session) => {
      const key = session.startTime?.slice(0, 10) || 'Unknown'
      map.set(key, [...(map.get(key) || []), session])
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [filteredSessions])

  const totalSessions = filteredSessions.length
  const upcomingSessions = filteredSessions.filter(s => new Date(s.startTime) > new Date()).length

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Thời khóa biểu của tôi</h1>

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p>Tổng buổi học</p>
          <strong>{totalSessions}</strong>
        </div>
        <div className={styles.statCard}>
          <p>Sắp diễn ra</p>
          <strong>{upcomingSessions}</strong>
        </div>
        <div className={styles.statCard}>
          <p>Môn học</p>
          <strong>{myCourses.length}</strong>
        </div>
      </div>

      <div className={styles.toolbar}>
        <label>
          Từ ngày
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label>
          Đến ngày
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        <label>
          Lọc theo môn học
          <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
            <option value="ALL">Tất cả môn học</option>
            {myCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tìm kiếm
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm môn học hoặc phòng..."
          />
        </label>
        <button onClick={fetchSessions} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {coursesLoading && (
        <div className={styles.card}>
          <div className={styles.loading}>Đang tải danh sách môn học...</div>
        </div>
      )}

      {coursesError && <div className={styles.error}>{coursesError}</div>}

      {!coursesLoading && myCourses.length > 0 && (
        <div className={styles.card}>
          <h3>Môn học đã ghi danh ({myCourses.length})</h3>
          <ul className={styles.courseList}>
            {myCourses.map((course) => {
              const sessionsCount = sessions.filter(s => s.courseId === course.id).length
              return (
                <li key={course.id} className={styles.courseItem}>
                  <div>
                    <strong>{course.code}</strong> - {course.name}
                  </div>
                  <div className={styles.courseMeta}>
                    <span>Giảng viên: {course.teacher_name || 'Chưa có giảng viên'}</span>
                    <span>Tín chỉ: {course.credits ?? 0} · Buổi học: {sessionsCount}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {loading && (
        <div className={styles.card}>
          <div className={styles.loading}>Đang tải lịch học...</div>
        </div>
      )}

      {!loading && groupedSessions.length === 0 && (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <p>Không có buổi học nào trong khoảng thời gian này</p>
            <small>Thử thay đổi bộ lọc hoặc khoảng thời gian</small>
          </div>
        </div>
      )}

      <div className={styles.scheduleGrid}>
        {groupedSessions.map(([date, items]) => (
          <div key={date} className={styles.card}>
            <h3>{formatDateLabel(date)}</h3>
            <ul className={styles.sessionList}>
              {items.map((session) => (
                <li key={session.sessionId} className={styles.sessionItem}>
                  <div className={styles.sessionTime}>{formatTimeRange(session.startTime, session.endTime)}</div>
                  <div className={styles.sessionCourse}>
                    <strong>{session.courseCode}</strong> - {session.courseName}
                  </div>
                  <div className={styles.sessionMeta}>
                    <span>Room {session.roomName}</span>
                    <span>{session.locked ? 'Locked' : 'Open'}</span>
                  </div>
                  <div className={styles.sessionActions}>
                    <button
                      type="button"
                      className={styles.sessionButton}
                      onClick={() => navigate(`/face-enrollment?sessionId=${session.sessionId}`)}
                    >
                      Điểm danh
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MySchedule

