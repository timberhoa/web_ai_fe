import React, { useEffect, useMemo, useState } from 'react'
import styles from '../Student.module.scss'
import { enrollmentsApi, type StudentCourse } from '../../../services/enrollments'
import {
  studentApi,
  type StudentAttendanceHistory,
  type StudentAttendanceStats,
} from '../../../services/student'

const toDateInput = (date: Date) => date.toISOString().slice(0, 10)

const defaultTo = new Date()
const defaultFrom = new Date()
defaultFrom.setMonth(defaultFrom.getMonth() - 1)

const statusLabel: Record<string, string> = {
  PRESENT: 'Có mặt',
  LATE: 'Đi trễ',
  ABSENT: 'Vắng',
  EXCUSED: 'Miễn',
}

const MyAttendance: React.FC = () => {
  const [courses, setCourses] = useState<StudentCourse[]>([])
  const [filters, setFilters] = useState({
    courseId: '',
    from: toDateInput(defaultFrom),
    to: toDateInput(defaultTo),
  })

  const [stats, setStats] = useState<StudentAttendanceStats[]>([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  const [history, setHistory] = useState<StudentAttendanceHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [pageMeta, setPageMeta] = useState({ totalPages: 1, totalElements: 0 })

  const fetchCourses = async () => {
    try {
      const data = await enrollmentsApi.myCourses()
      setCourses(data || [])
    } catch {
      // optional lookup
    }
  }

  const fetchStats = async () => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      const data = await studentApi.myAttendanceStats({
        courseId: filters.courseId || undefined,
        from: filters.from ? `${filters.from}T00:00:00` : undefined,
        to: filters.to ? `${filters.to}T23:59:59` : undefined,
      })
      setStats(data || [])
    } catch (err: any) {
      setStatsError(err?.message ?? 'Không thể tải thống kê')
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchHistory = async (pageIndex = 0) => {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const data = await studentApi.myAttendanceHistory({
        courseId: filters.courseId || undefined,
        from: filters.from ? `${filters.from}T00:00:00` : undefined,
        to: filters.to ? `${filters.to}T23:59:59` : undefined,
        page: pageIndex,
        size: 10,
        sort: 'startTime,desc',
      })
      setHistory(data.content || [])
      setPage(pageIndex)
      setPageMeta({ totalPages: data.totalPages, totalElements: data.totalElements })
    } catch (err: any) {
      setHistoryError(err?.message ?? 'Không thể tải lịch sử điểm danh')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
    fetchStats()
    fetchHistory(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => {
    fetchStats()
    fetchHistory(0)
  }

  const statusCounts = useMemo(() => {
    return stats.reduce(
      (acc, item) => {
        acc.totalSessions += item.totalSessions
        acc.present += item.presentCount
        acc.late += item.lateCount
        acc.excused += item.excusedCount
        acc.absent += item.absentCount
        return acc
      },
      { totalSessions: 0, present: 0, late: 0, excused: 0, absent: 0 }
    )
  }, [stats])

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Lịch sử điểm danh</h1>

      <div className={styles.toolbar}>
        <label>
          Môn học
          <select name="courseId" value={filters.courseId} onChange={handleFilterChange}>
            <option value="">Tất cả môn học</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Từ ngày
          <input type="date" name="from" value={filters.from} onChange={handleFilterChange} />
        </label>
        <label>
          Đến ngày
          <input type="date" name="to" value={filters.to} onChange={handleFilterChange} />
        </label>
        <button type="button" onClick={handleApplyFilters} disabled={historyLoading || statsLoading}>
          {historyLoading || statsLoading ? 'Đang tải...' : 'Áp dụng'}
        </button>
      </div>

      {statsError && <div className={styles.error}>{statsError}</div>}
      
      {statsLoading && (
        <div className={styles.card}>
          <div className={styles.loading}>Đang tải thống kê...</div>
        </div>
      )}

      {!statsLoading && stats.length > 0 && (
        <div className={styles.card}>
          <h3>Tổng quan điểm danh</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p>Tổng buổi</p>
              <strong>{statusCounts.totalSessions}</strong>
            </div>
            <div className={styles.statCard}>
              <p>Có mặt</p>
              <strong style={{color: 'var(--success)'}}>{statusCounts.present}</strong>
            </div>
            <div className={styles.statCard}>
              <p>Đi trễ</p>
              <strong style={{color: 'var(--warning)'}}>{statusCounts.late}</strong>
            </div>
            <div className={styles.statCard}>
              <p>Miễn</p>
              <strong style={{color: '#2b6cb0'}}>{statusCounts.excused}</strong>
            </div>
            <div className={styles.statCard}>
              <p>Vắng</p>
              <strong style={{color: 'var(--danger)'}}>{statusCounts.absent}</strong>
            </div>
            <div className={styles.statCard}>
              <p>Tỷ lệ</p>
              <strong style={{color: 'var(--primary)'}}>
                {statusCounts.totalSessions > 0 
                  ? ((statusCounts.present + statusCounts.late + statusCounts.excused) / statusCounts.totalSessions * 100).toFixed(1)
                  : 0}%
              </strong>
            </div>
          </div>
        </div>
      )}

      {!statsLoading && stats.length > 0 && (
        <div className={styles.card}>
          <h3>Chi tiết theo môn học</h3>
          <div className={styles.scheduleGrid}>
            {stats.map((item) => (
              <div key={item.courseId} className={styles.courseItem}>
                <div className={styles.courseHeader}>
                  <strong>{item.courseCode}</strong>
                  <span>{item.attendanceRate.toFixed(1)}%</span>
                </div>
                <p style={{marginBottom: '12px', color: 'var(--text)'}}>{item.courseName}</p>
                <div className={styles.statsRow}>
                  <span>Có mặt: {item.presentCount}</span>
                  <span>Trễ: {item.lateCount}</span>
                  <span>Miễn: {item.excusedCount}</span>
                  <span>Vắng: {item.absentCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.sectionHeader}>
          <h3>Lịch sử điểm danh chi tiết</h3>
          <span>
            Tổng {pageMeta.totalElements} bản ghi · Trang {page + 1}/{Math.max(pageMeta.totalPages, 1)}
          </span>
        </div>
        {historyError && <div className={styles.error}>{historyError}</div>}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Buổi học</th>
                <th>Thời gian</th>
                <th>Phòng</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading && (
                <tr>
                  <td colSpan={5} style={{textAlign: 'center', padding: '32px'}}>
                    <div className={styles.loading}>Đang tải lịch sử...</div>
                  </td>
                </tr>
              )}
              {!historyLoading && history.length === 0 && (
                <tr>
                  <td colSpan={5} style={{textAlign: 'center', padding: '32px'}}>
                    <div className={styles.emptyState}>
                      <p>Không có bản ghi điểm danh nào</p>
                      <small>Thử thay đổi bộ lọc hoặc khoảng thời gian</small>
                    </div>
                  </td>
                </tr>
              )}
              {!historyLoading &&
                history.map((record) => (
                  <tr key={record.attendanceId}>
                    <td>
                      <strong>{record.courseCode}</strong>
                      <div>{record.courseName}</div>
                    </td>
                    <td>
                      {new Date(record.startTime).toLocaleDateString('vi-VN', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit'
                      })} ·{' '}
                      {new Date(record.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>{record.roomName}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status-${record.status?.toLowerCase()}`]}`}>
                        {statusLabel[record.status] || record.status}
                      </span>
                    </td>
                    <td>{record.note || '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className={styles.pagination}>
          <button type="button" disabled={page === 0 || historyLoading} onClick={() => fetchHistory(page - 1)}>
            ← Trang trước
          </button>
          <span style={{display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px'}}>
            Trang {page + 1} / {Math.max(pageMeta.totalPages, 1)}
          </span>
          <button
            type="button"
            disabled={page + 1 >= pageMeta.totalPages || historyLoading}
            onClick={() => fetchHistory(page + 1)}
          >
            Trang sau →
          </button>
        </div>
      </div>
    </div>
  )
}

export default MyAttendance
