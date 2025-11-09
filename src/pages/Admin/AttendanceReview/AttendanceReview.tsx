import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from '../Admin.module.scss'
import pageStyles from './AttendanceReview.module.scss'
import Modal from '../../../components/Modal/Modal'
import { coursesApi, type CourseSummary } from '../../../services/courses'
import { adminUsersApi, type AdminUser } from '../../../services/adminUsers'
import {
  attendanceApi,
  type AttendanceReviewRow,
  type AttendanceStatus,
  type SessionAttendanceDetail,
  type SessionAttendanceRecord,
} from '../../../services/attendance'
import { scheduleApi } from '../../../services/schedule'

const attendanceStatuses: AttendanceStatus[] = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED']

const today = new Date()
const startDate = new Date(today)
startDate.setDate(startDate.getDate() - 7)

const toDateInput = (date: Date) => date.toISOString().slice(0, 10)

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

const AttendanceReview: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const focusSessionId = searchParams.get('sessionId')
  const [handledSessionId, setHandledSessionId] = useState<string | null>(null)

  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [teachers, setTeachers] = useState<AdminUser[]>([])

  const [filters, setFilters] = useState({
    from: toDateInput(startDate),
    to: toDateInput(today),
    courseId: '',
    teacherId: '',
    locked: 'all',
  })
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [sessions, setSessions] = useState<AttendanceReviewRow[]>([])
  const [pageMeta, setPageMeta] = useState({ totalPages: 1, totalElements: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [detail, setDetail] = useState<SessionAttendanceDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [updatingRecordId, setUpdatingRecordId] = useState<string | null>(null)
  const [rosterFilter, setRosterFilter] = useState<{ keyword: string; status: 'ALL' | AttendanceStatus }>({
    keyword: '',
    status: 'ALL',
  })

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
      const data = await attendanceApi.review({
        from: filters.from || undefined,
        to: filters.to || undefined,
        courseId: filters.courseId || undefined,
        teacherId: filters.teacherId || undefined,
        locked: filters.locked === 'locked' ? true : filters.locked === 'open' ? false : undefined,
        page,
        size: pageSize,
        sort: 'startTime,desc',
      })
      setSessions(data.content || [])
      setPageMeta({ totalPages: data.totalPages, totalElements: data.totalElements })
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải dữ liệu điểm danh')
    } finally {
      setLoading(false)
    }
  }, [filters, page, pageSize])

  useEffect(() => {
    loadLookups()
  }, [loadLookups])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  useEffect(() => {
    if (focusSessionId && handledSessionId !== focusSessionId) {
      openDetail(focusSessionId)
      setHandledSessionId(focusSessionId)
    }
    if (!focusSessionId) {
      setHandledSessionId(null)
    }
  }, [focusSessionId, handledSessionId])

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
    setPage(0)
  }

  const openDetail = async (sessionId: string) => {
    setActiveSessionId(sessionId)
    setDetail(null)
    setDetailLoading(true)
    setDetailError(null)
    try {
      const data = await attendanceApi.sessionDetail(sessionId)
      setDetail(data)
    } catch (err: any) {
      setDetailError(err?.message ?? 'Không thể tải roster buổi học')
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setActiveSessionId(null)
    setDetail(null)
    setDetailError(null)
    setUpdatingRecordId(null)
    setRosterFilter({ keyword: '', status: 'ALL' })
  }

  const refreshDetail = async () => {
    if (activeSessionId) {
      await openDetail(activeSessionId)
    }
  }

  const handleToggleLock = async (sessionId: string, locked: boolean) => {
    try {
      if (locked) {
        await scheduleApi.unlock(sessionId)
      } else {
        await scheduleApi.lock(sessionId)
      }
      setSessions((prev) =>
        prev.map((row) => (row.sessionId === sessionId ? { ...row, locked: !locked } : row))
      )
      setDetail((prev) => (prev && prev.sessionId === sessionId ? { ...prev, locked: !locked } : prev))
    } catch (err: any) {
      setDetailError(err?.message ?? 'Không thể cập nhật trạng thái khóa')
    }
  }

  const handleSeed = async () => {
    if (!activeSessionId) return
    setDetailLoading(true)
    setDetailError(null)
    try {
      const seeded = await attendanceApi.seed(activeSessionId)
      setDetail(seeded)
    } catch (err: any) {
      setDetailError(err?.message ?? 'Không thể tạo roster mặc định')
    } finally {
      setDetailLoading(false)
    }
  }

  const updateRecord = async (record: SessionAttendanceRecord, payload: { status: AttendanceStatus; note?: string }) => {
    setUpdatingRecordId(record.attendanceId)
    setDetailError(null)
    try {
      await attendanceApi.update(record.attendanceId, payload)
      await refreshDetail()
    } catch (err: any) {
      setDetailError(err?.message ?? 'Không thể cập nhật bản ghi điểm danh')
    } finally {
      setUpdatingRecordId(null)
    }
  }

  const filteredRecords = useMemo(() => {
    if (!detail) return []
    return detail.records.filter((record) => {
      if (rosterFilter.status !== 'ALL' && record.status !== rosterFilter.status) {
        return false
      }
      if (!rosterFilter.keyword) return true
      const keyword = rosterFilter.keyword.toLowerCase()
      const target = `${record.fullName || record.studentName || ''} ${record.studentCode || ''}`.toLowerCase()
      return target.includes(keyword)
    })
  }, [detail, rosterFilter])

  const totalMarked =
    detail?.stats?.totalMarked ??
    (detail?.records || []).filter((record) => record.status !== 'ABSENT').length

  return (
    <div className={`${styles.page} ${pageStyles.root}`}>
      <h1 className={styles.title}>Rà soát & khóa điểm danh</h1>

      <div className={pageStyles.filters}>
        <label>
          Từ ngày
          <input type="date" name="from" value={filters.from} onChange={handleFilterChange} />
        </label>
        <label>
          Đến ngày
          <input type="date" name="to" value={filters.to} onChange={handleFilterChange} />
        </label>
        <label>
          Môn học
          <select name="courseId" value={filters.courseId} onChange={handleFilterChange}>
            <option value="">Tất cả</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code ? `${course.code} - ${course.name}` : course.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Giảng viên
          <select name="teacherId" value={filters.teacherId} onChange={handleFilterChange}>
            <option value="">Tất cả</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.fullName || teacher.username}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select name="locked" value={filters.locked} onChange={handleFilterChange}>
            <option value="all">Tất cả</option>
            <option value="open">Chưa khóa</option>
            <option value="locked">Đã khóa</option>
          </select>
        </label>
        <button type="button" onClick={fetchSessions} disabled={loading}>
          Xem
        </button>
      </div>

      {error && <div className={pageStyles.error}>{error}</div>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Môn học</th>
              <th>Giảng viên</th>
              <th>Phòng</th>
              <th>Thời gian</th>
              <th>Thống kê</th>
              <th>Trạng thái</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7}>Đang tải dữ liệu...</td>
              </tr>
            )}
            {!loading && sessions.length === 0 && (
              <tr>
                <td colSpan={7}>Không có phiên học nào</td>
              </tr>
            )}
            {!loading &&
              sessions.map((session) => (
                <tr key={session.sessionId}>
                  <td>
                    <strong>{session.courseCode}</strong>
                    <div>{session.courseName}</div>
                  </td>
                  <td>{session.teacherName || '-'}</td>
                  <td>{session.roomName || '-'}</td>
                  <td>{formatDateTime(session.startTime)}</td>
                  <td>
                    <div className={pageStyles.statLine}>
                      <span>P: {session.present ?? 0}</span>
                      <span>V: {session.absent ?? 0}</span>
                      <span>Muộn: {session.late ?? 0}</span>
                      <span>Miễn: {session.excused ?? 0}</span>
                    </div>
                  </td>
                  <td>
                    <span className={session.locked ? pageStyles.locked : pageStyles.unlocked}>
                      {session.locked ? 'Đã khóa' : 'Đang mở'}
                    </span>
                  </td>
                  <td className={pageStyles.actionColumn}>
                    <button type="button" onClick={() => openDetail(session.sessionId)}>
                      Roster
                    </button>
                    <button type="button" onClick={() => navigate('/session/' + session.sessionId)}>
                      Mo trang diem danh
                    </button>
                    <button type="button" onClick={() => handleToggleLock(session.sessionId, !!session.locked)}>
                      {session.locked ? 'Mở khóa' : 'Khóa'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className={pageStyles.pagination}>
        <button type="button" disabled={page === 0} onClick={() => setPage((prev) => Math.max(0, prev - 1))}>
          Trang trước
        </button>
        <span>
          Trang {page + 1}/{Math.max(pageMeta.totalPages, 1)}
        </span>
        <button
          type="button"
          disabled={page + 1 >= pageMeta.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Trang sau
        </button>
      </div>

      <Modal isOpen={!!activeSessionId} onClose={closeDetail} title="Roster buổi học" size="xl">
        {detailError && <div className={pageStyles.error}>{detailError}</div>}
        {detailLoading && <div>Đang tải roster...</div>}
        {!detailLoading && detail && (
          <div className={pageStyles.detail}>
            <header className={pageStyles.detailHeader}>
              <div>
                <h3>{detail.courseName}</h3>
                <p>
                  {detail.courseCode} · {detail.roomName}
                </p>
                <p>{formatDateTime(detail.startTime)}</p>
              </div>
              <div className={pageStyles.detailActions}>
                <span className={detail.locked ? pageStyles.locked : pageStyles.unlocked}>
                  {detail.locked ? 'Đã khóa' : 'Đang mở'}
                </span>
                <button type="button" onClick={() => navigate('/session/' + detail.sessionId)}>
                  Mo trang diem danh
                </button>
                <button type="button" onClick={() => handleToggleLock(detail.sessionId, !!detail.locked)}>
                  {detail.locked ? 'Mở khóa' : 'Khóa'}
                </button>
                <button type="button" onClick={refreshDetail}>
                  Làm mới
                </button>
                <button type="button" disabled={detail.locked} onClick={handleSeed}>
                  Tạo roster ABSENT
                </button>
              </div>
            </header>

            <div className={pageStyles.statsGrid}>
              <div>
                <p>Tổng sinh viên</p>
                <strong>{detail.stats?.totalEnrolled ?? detail.records.length}</strong>
              </div>
              <div>
                <p>Đã điểm danh</p>
                <strong>{totalMarked}</strong>
              </div>
              <div>
                <p>Có mặt</p>
                <strong>{detail.stats?.present ?? 0}</strong>
              </div>
              <div>
                <p>Vắng</p>
                <strong>{detail.stats?.absent ?? 0}</strong>
              </div>
              <div>
                <p>Đi trễ</p>
                <strong>{detail.stats?.late ?? 0}</strong>
              </div>
              <div>
                <p>Miễn</p>
                <strong>{detail.stats?.excused ?? 0}</strong>
              </div>
            </div>

            <div className={pageStyles.rosterFilters}>
              <input
                placeholder="Tìm sinh viên"
                value={rosterFilter.keyword}
                onChange={(event) => setRosterFilter((prev) => ({ ...prev, keyword: event.target.value }))}
              />
              <select
                value={rosterFilter.status}
                onChange={(event) => setRosterFilter((prev) => ({ ...prev, status: event.target.value as any }))}
              >
                <option value="ALL">Tất cả</option>
                {attendanceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sinh viên</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={4}>Không có bản ghi phù hợp</td>
                    </tr>
                  )}
                  {filteredRecords.map((record) => (
                    <tr key={record.attendanceId}>
                      <td>
                        <strong>{record.fullName || record.studentName}</strong>
                        <div>{record.studentCode || record.studentId}</div>
                      </td>
                      <td>
                        <select
                          value={record.status}
                          disabled={detail.locked || updatingRecordId === record.attendanceId}
                          onChange={(event) =>
                            updateRecord(record, { status: event.target.value as AttendanceStatus, note: record.note })
                          }
                        >
                          {attendanceStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          defaultValue={record.note ?? ''}
                          disabled={detail.locked || updatingRecordId === record.attendanceId}
                          onBlur={(event) => {
                            if (event.target.value !== (record.note ?? '')) {
                              updateRecord(record, { status: record.status, note: event.target.value || undefined })
                            }
                          }}
                        />
                      </td>
                      <td>{formatDateTime(record.markedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AttendanceReview
