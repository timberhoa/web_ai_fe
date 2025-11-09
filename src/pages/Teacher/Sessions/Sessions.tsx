import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../Teacher.module.scss'
import { scheduleApi, type ClassSession, type SessionFilter } from '../../../services/schedule'
import { useAuthStore } from '../../../store/useAuthStore'

const formatRange = (start: string, end: string) => {
  try {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const startLabel = startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    const startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `${startLabel} · ${startTime} - ${endTime}`
  } catch {
    return `${start} - ${end}`
  }
}

const toDateInput = (date: Date) => date.toISOString().slice(0, 10)

const Sessions: React.FC = () => {
  const navigate = useNavigate()
  const teacherId = useAuthStore((state) => state.user?.id)
  const [filters, setFilters] = useState(() => {
    const today = new Date()
    const weekAhead = new Date(today)
    weekAhead.setDate(today.getDate() + 7)
    return {
      from: toDateInput(today),
      to: toDateInput(weekAhead),
      keyword: '',
    }
  })
  const filtersRef = useRef(filters)
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const fetchSessions = useCallback(
    async (params?: SessionFilter) => {
      if (!teacherId) return
      setLoading(true)
      setError(null)
      try {
        const range = params ?? { from: filtersRef.current.from, to: filtersRef.current.to }
        const response = await scheduleApi.list({
          teacherId,
          from: `${range.from}T00:00:00`,
          to: `${range.to}T23:59:59`,
          size: 200,
          sort: 'startTime,asc',
        })
        setSessions(response.content || [])
      } catch (err: any) {
        setError(err?.message ?? 'Không thể tải lịch dạy')
      } finally {
        setLoading(false)
      }
    },
    [teacherId]
  )

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const filteredSessions = useMemo(() => {
    if (!filters.keyword) return sessions
    const keyword = filters.keyword.toLowerCase()
    return sessions.filter((session) => {
      const text = `${session.courseName} ${session.courseCode} ${session.roomName}`.toLowerCase()
      return text.includes(keyword)
    })
  }, [sessions, filters.keyword])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleRefresh = () => {
    fetchSessions({ from: filters.from, to: filters.to })
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Lịch giảng dạy</h1>

      <div className={styles.toolbar}>
        <label>
          Từ ngày
          <input type="date" name="from" value={filters.from} onChange={handleInputChange} />
        </label>
        <label>
          Đến ngày
          <input type="date" name="to" value={filters.to} onChange={handleInputChange} />
        </label>
        <input placeholder="Tìm môn học hoặc phòng" name="keyword" value={filters.keyword} onChange={handleInputChange} />
        <button type="button" onClick={handleRefresh} disabled={loading || !teacherId}>
          Làm mới
        </button>
      </div>

      {error && <div className={styles.card}>{error}</div>}
      {!teacherId && <div className={styles.card}>Không tìm thấy thông tin giảng viên.</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Môn học</th>
              <th>Thời gian</th>
              <th>Phòng</th>
              <th>Trạng thái</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5}>Đang tải dữ liệu...</td>
              </tr>
            )}
            {!loading && filteredSessions.length === 0 && (
              <tr>
                <td colSpan={5}>Không có buổi học nào trong khoảng thời gian này.</td>
              </tr>
            )}
            {!loading &&
              filteredSessions.map((session) => (
                <tr key={session.sessionId}>
                  <td>
                    <strong>{session.courseCode}</strong>
                    <div>{session.courseName}</div>
                  </td>
                  <td>{formatRange(session.startTime, session.endTime)}</td>
                  <td>{session.roomName || '-'}</td>
                  <td>{session.locked ? 'Đã khóa' : 'Đang mở'}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.primaryButton}
                        type="button"
                        onClick={() => navigate(`/attendance/${session.sessionId}`)}
                      >
                        Quản lý roster
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Sessions
