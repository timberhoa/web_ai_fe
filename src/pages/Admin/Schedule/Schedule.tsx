import React, { useCallback, useEffect, useMemo, useState } from 'react'
import adminStyles from '../Admin.module.scss'
import styles from './Schedule.module.scss'
import { scheduleApi, type ClassSession, type ClassSessionRequest, type RecurringSessionRequest } from '../../../services/schedule'
import { coursesApi, type CourseSummary } from '../../../services/courses'
import { adminUsersApi, type AdminUser } from '../../../services/adminUsers'
import Modal from '../../../components/Modal/Modal'

type SingleFormState = {
  courseId: string
  startTime: string
  endTime: string
  roomName: string
  latitude: string
  longitude: string
  radiusMeters: string
}

type RecurringFormState = {
  courseId: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  daysOfWeek: string[]
  roomName: string
  latitude: string
  longitude: string
  radiusMeters: string
}

type FilterState = {
  courseId: string
  teacherId: string
  from: string
  to: string
  page: number
  size: number
  sort: string
}

const dayOptions = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const now = new Date()
const getDateAt = (date: Date, hours: number, minutes: number) => {
  const next = new Date(date)
  next.setHours(hours, minutes, 0, 0)
  return next
}

const toDateInputValue = (date: Date) => {
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const sanitizeDateTimeValue = (value: string) => {
  if (!value) return ''
  if (value.length === 16) return `${value}:00`
  return value
}

const sanitizeTimeValue = (value: string) => {
  if (!value) return ''
  if (value.length === 5) return `${value}:00`
  return value
}

const parseOptionalNumber = (value: string) => {
  if (!value) return undefined
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const formatDateTime = (value: string) => {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

const defaultSingleForm: SingleFormState = {
  courseId: '',
  startTime: toDateInputValue(getDateAt(now, 8, 0)),
  endTime: toDateInputValue(getDateAt(now, 10, 0)),
  roomName: '',
  latitude: '',
  longitude: '',
  radiusMeters: '',
}

const defaultRecurringForm: RecurringFormState = {
  courseId: '',
  startDate: toDateInputValue(getDateAt(now, 0, 0)).slice(0, 10),
  endDate: toDateInputValue(getDateAt(now, 0, 0)).slice(0, 10),
  startTime: '08:00',
  endTime: '10:00',
  daysOfWeek: ['MONDAY', 'WEDNESDAY'],
  roomName: '',
  latitude: '',
  longitude: '',
  radiusMeters: '',
}

const defaultFilters: FilterState = {
  courseId: '',
  teacherId: '',
  from: toDateInputValue(getDateAt(now, 0, 0)),
  to: toDateInputValue(getDateAt(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), 23, 59)),
  page: 0,
  size: 10,
  sort: 'startTime,asc',
}

 const Schedule: React.FC = () => {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [teachers, setTeachers] = useState<AdminUser[]>([])
  const [lookupsLoading, setLookupsLoading] = useState(false)

  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [sessionsError, setSessionsError] = useState<string | null>(null)

  const [singleForm, setSingleForm] = useState<SingleFormState>(defaultSingleForm)
  const [recurringForm, setRecurringForm] = useState<RecurringFormState>(defaultRecurringForm)
  const [singleLoading, setSingleLoading] = useState(false)
  const [recurringLoading, setRecurringLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const [editingSession, setEditingSession] = useState<ClassSession | null>(null)
  const [editForm, setEditForm] = useState<SingleFormState>(defaultSingleForm)
  const [editLoading, setEditLoading] = useState(false)

  const [actionSessionId, setActionSessionId] = useState<string | null>(null)

  const lookupLabel = useMemo(() => {
    if (lookupsLoading) return 'Loading reference data...'
    return feedback
  }, [lookupsLoading, feedback])

  const loadLookups = useCallback(async () => {
    setLookupsLoading(true)
    try {
      const [courseRes, teacherRes] = await Promise.all([
        coursesApi.adminList({ page: 0, size: 200, sort: 'name,asc' }),
        adminUsersApi.listByRole('TEACHER', { page: 0, size: 200, sort: 'fullName,asc' }),
      ])
      setCourses(courseRes.content || [])
      setTeachers(teacherRes.content || [])
    } catch (error: any) {
      setFeedback(error?.message ?? 'Failed to load courses or teachers')
    } finally {
      setLookupsLoading(false)
    }
  }, [])

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true)
    setSessionsError(null)
    try {
      const params = {
        courseId: filters.courseId || undefined,
        teacherId: filters.teacherId || undefined,
        from: filters.from ? sanitizeDateTimeValue(filters.from) : undefined,
        to: filters.to ? sanitizeDateTimeValue(filters.to) : undefined,
        page: filters.page,
        size: filters.size,
        sort: filters.sort,
      }
      const page = await scheduleApi.adminList(params)
      setSessions(page.content || [])
      setTotalPages(Math.max(1, page.totalPages || 1))
      setTotalElements(page.totalElements || (page.content || []).length)
    } catch (error: any) {
      setSessionsError(error?.message ?? 'Failed to load sessions')
    } finally {
      setSessionsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadLookups()
  }, [loadLookups])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const handleSingleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setSingleForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRecurringChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setRecurringForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleDay = (day: string) => {
    setRecurringForm((prev) => {
      const exists = prev.daysOfWeek.includes(day)
      const nextDays = exists ? prev.daysOfWeek.filter((d) => d !== day) : [...prev.daysOfWeek, day]
      return { ...prev, daysOfWeek: nextDays }
    })
  }

  const handleFiltersChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, page: 0, [name]: value }))
  }

  const handlePageChange = (direction: 'prev' | 'next') => {
    setFilters((prev) => {
      const currentPage = prev.page
      const nextPage = direction === 'prev' ? Math.max(0, currentPage - 1) : Math.min(totalPages - 1, currentPage + 1)
      return { ...prev, page: nextPage }
    })
  }

  const buildSinglePayload = (form: SingleFormState): ClassSessionRequest => ({
    courseId: form.courseId,
    startTime: sanitizeDateTimeValue(form.startTime),
    endTime: sanitizeDateTimeValue(form.endTime),
    roomName: form.roomName,
    latitude: parseOptionalNumber(form.latitude),
    longitude: parseOptionalNumber(form.longitude),
    radiusMeters: parseOptionalNumber(form.radiusMeters),
  })

  const buildRecurringPayload = (form: RecurringFormState): RecurringSessionRequest => ({
    courseId: form.courseId,
    startDate: form.startDate,
    endDate: form.endDate,
    startTime: sanitizeTimeValue(form.startTime),
    endTime: sanitizeTimeValue(form.endTime),
    daysOfWeek: form.daysOfWeek,
    roomName: form.roomName,
    latitude: parseOptionalNumber(form.latitude),
    longitude: parseOptionalNumber(form.longitude),
    radiusMeters: parseOptionalNumber(form.radiusMeters),
  })

  const handleCreateSingle = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!singleForm.courseId || !singleForm.roomName || !singleForm.startTime || !singleForm.endTime) {
      setFeedback('Please fill in all required fields')
      return
    }
    setSingleLoading(true)
    try {
      await scheduleApi.create(buildSinglePayload(singleForm))
      setSingleForm(defaultSingleForm)
      setFeedback('Session created')
      loadSessions()
    } catch (error: any) {
      setFeedback(error?.message ?? 'Failed to create session')
    } finally {
      setSingleLoading(false)
    }
  }

  const handleCreateRecurring = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!recurringForm.courseId || !recurringForm.roomName || !recurringForm.startDate || !recurringForm.endDate) {
      setFeedback('Please fill in the recurring schedule form')
      return
    }
    if (!recurringForm.daysOfWeek.length) {
      setFeedback('Select at least one weekday')
      return
    }
    setRecurringLoading(true)
    try {
      await scheduleApi.createRecurring(buildRecurringPayload(recurringForm))
      setRecurringForm(defaultRecurringForm)
      setFeedback('Recurring sessions created')
      loadSessions()
    } catch (error: any) {
      setFeedback(error?.message ?? 'Failed to create recurring sessions')
    } finally {
      setRecurringLoading(false)
    }
  }

  const openEditModal = (session: ClassSession) => {
    setEditingSession(session)
    setEditForm({
      courseId: session.courseId,
      roomName: session.roomName,
      startTime: session.startTime ? session.startTime.slice(0, 16) : '',
      endTime: session.endTime ? session.endTime.slice(0, 16) : '',
      latitude: session.latitude != null ? String(session.latitude) : '',
      longitude: session.longitude != null ? String(session.longitude) : '',
      radiusMeters: session.radiusMeters != null ? String(session.radiusMeters) : '',
    })
  }

  const closeEditModal = () => {
    setEditingSession(null)
    setEditForm(defaultSingleForm)
    setEditLoading(false)
  }

  const handleEditChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateSession = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editingSession) return
    setEditLoading(true)
    try {
      await scheduleApi.update(editingSession.sessionId, buildSinglePayload(editForm))
      setFeedback('Session updated')
      closeEditModal()
      loadSessions()
    } catch (error: any) {
      setFeedback(error?.message ?? 'Failed to update session')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteSession = async (session: ClassSession) => {
    const confirmDelete = window.confirm('Delete this session?')
    if (!confirmDelete) return
    setActionSessionId(session.sessionId)
    try {
      await scheduleApi.remove(session.sessionId)
      setFeedback('Session deleted')
      loadSessions()
    } catch (error: any) {
      setFeedback(error?.message ?? 'Failed to delete session')
    } finally {
      setActionSessionId(null)
    }
  }

  const handleToggleLock = async (session: ClassSession) => {
    setActionSessionId(session.sessionId)
    try {
      if (session.locked) {
        await scheduleApi.unlock(session.sessionId)
        setFeedback('Session unlocked')
      } else {
        await scheduleApi.lock(session.sessionId)
        setFeedback('Session locked')
      }
      loadSessions()
    } catch (error: any) {
      setFeedback(error?.message ?? 'Failed to toggle lock state')
    } finally {
      setActionSessionId(null)
    }
  }

  const sessionRows = useMemo(() => {
    return sessions.map((session) => ({
      ...session,
      startLabel: formatDateTime(session.startTime),
      endLabel: formatDateTime(session.endTime),
    }))
  }, [sessions])

  return (
    <div className={`${adminStyles.page} ${styles.root}`}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={adminStyles.title}>Sắp xếp lịch học</h1>
          <p className={styles.subtitle}>Sắp xếp lịch học cho sinh viên trong hệ thống</p>
        </div>
        {lookupLabel && <span className={styles.feedback}>{lookupLabel}</span>}
      </div>

      <section className={styles.filters}>
        <div className={styles.filterFields}>
          <label>
            Khóa học
            <select name="courseId" value={filters.courseId} onChange={handleFiltersChange}>
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
            <select name="teacherId" value={filters.teacherId} onChange={handleFiltersChange}>
              <option value="">Tất cả</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName || teacher.username}
                </option>
              ))}
            </select>
          </label>
          <label>
            From
            <input type="datetime-local" name="from" value={filters.from} onChange={handleFiltersChange} />
          </label>
          <label>
            To
            <input type="datetime-local" name="to" value={filters.to} onChange={handleFiltersChange} />
          </label>
        </div>
        <div className={styles.filterActions}>
          <button onClick={() => loadSessions()} disabled={sessionsLoading}>
            Refresh
          </button>
        </div>
      </section>

      <section className={styles.formGrid}>
        <div className={styles.card}>
          <h2>Sắp xếp 1 buổi học</h2>
          <form onSubmit={handleCreateSingle} className={styles.form}>
            <label>
              Khóa học *
              <select name="courseId" value={singleForm.courseId} onChange={handleSingleChange} required>
                <option value="">Chọn khóa học </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code ? `${course.code} - ${course.name}` : course.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Thời gian bắt đầu *
              <input type="datetime-local" name="startTime" value={singleForm.startTime} onChange={handleSingleChange} required />
            </label>
            <label>
              Thời gian kết thúc *
              <input type="datetime-local" name="endTime" value={singleForm.endTime} onChange={handleSingleChange} required />
            </label>
            <label>
              Phòng *
              <input type="text" name="roomName" value={singleForm.roomName} onChange={handleSingleChange} required />
            </label>
            <div className={styles.formRow}>
              <label>
                Vĩ độ
                <input type="number" step="0.000001" name="latitude" value={singleForm.latitude} onChange={handleSingleChange} />
              </label>
              <label>
                Kinh độ
                <input type="number" step="0.000001" name="longitude" value={singleForm.longitude} onChange={handleSingleChange} />
              </label>
              <label>
                Bán kính  (m)
                <input type="number" step="1" name="radiusMeters" value={singleForm.radiusMeters} onChange={handleSingleChange} />
              </label>
            </div>
            <button type="submit" disabled={singleLoading}>
              {singleLoading ? 'Creating...' : 'Create session'}
            </button>
          </form>
        </div>

        <div className={styles.card}>
          <h2>Buổi học định kỳ trong kỳ</h2>
          <form onSubmit={handleCreateRecurring} className={styles.form}>
            <label>
              Khóa học *
              <select name="courseId" value={recurringForm.courseId} onChange={handleRecurringChange} required>
                <option value="">Chọn khóa học</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code ? `${course.code} - ${course.name}` : course.name}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.formRow}>
              <label>
                Ngày bắt đầu *
                <input type="date" name="startDate" value={recurringForm.startDate} onChange={handleRecurringChange} required />
              </label>
              <label>
                Ngày kết thúc *
                <input type="date" name="endDate" value={recurringForm.endDate} onChange={handleRecurringChange} required />
              </label>
            </div>
            <div className={styles.formRow}>
              <label>
                Thời gian bắt đầu *
                <input type="time" name="startTime" value={recurringForm.startTime} onChange={handleRecurringChange} required />
              </label>
              <label>
                Thời gian kết thúc *
                <input type="time" name="endTime" value={recurringForm.endTime} onChange={handleRecurringChange} required />
              </label>
            </div>
            <label>
              Phòng *
              <input type="text" name="roomName" value={recurringForm.roomName} onChange={handleRecurringChange} required />
            </label>
            <div className={styles.dayPicker}>
              {dayOptions.map((day) => {
                const checked = recurringForm.daysOfWeek.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    className={checked ? styles.daySelected : styles.dayButton}
                    onClick={() => toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </button>
                )
              })}
            </div>
            <div className={styles.formRow}>
              <label>
                Vĩ độ
                <input type="number" step="0.000001" name="latitude" value={recurringForm.latitude} onChange={handleRecurringChange} />
              </label>
              <label>
                Kinh độ
                <input type="number" step="0.000001" name="longitude" value={recurringForm.longitude} onChange={handleRecurringChange} />
              </label>
              <label>
                Bán kính (m)
                <input type="number" step="1" name="radiusMeters" value={recurringForm.radiusMeters} onChange={handleRecurringChange} />
              </label>
            </div>
            <button type="submit" disabled={recurringLoading}>
              {recurringLoading ? 'Creating...' : 'Create recurring sessions'}
            </button>
          </form>
        </div>
      </section>

      <section className={styles.sessionsCard}>
        <div className={styles.sessionsHeader}>
          <div>
            <h2>Danh sách buổi học</h2>
            <p>
              Tổng cộng {totalElements} buổi học - Trang {filters.page + 1}/{totalPages}
            </p>
          </div>
          <div className={styles.pagination}>
            <button onClick={() => handlePageChange('prev')} disabled={filters.page === 0 || sessionsLoading}>
              Trang trước
            </button>
            <button onClick={() => handlePageChange('next')} disabled={filters.page + 1 >= totalPages || sessionsLoading}>
              Trang sau
            </button>
          </div>
        </div>
        <div className={adminStyles.tableWrap}>
          <table className={`${adminStyles.table} ${styles.sessionTable}`}>
            <thead>
              <tr>
                <th>Khóa học</th>
                <th>Giảng viên</th>
                <th>Thời gian bắt đầu</th>
                <th>Thời gian kết thúc</th>
                <th>Phòng</th>
                <th>Khóa</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!sessionsLoading && sessionRows.length === 0 && (
                <tr>
                  <td colSpan={7}>{sessionsError || 'No session found'}</td>
                </tr>
              )}
              {sessionsLoading && (
                <tr>
                  <td colSpan={7}>Đang tải...</td>
                </tr>
              )}
              {!sessionsLoading &&
                sessionRows.map((session) => (
                  <tr key={session.sessionId}>
                    <td>
                      <strong>{session.courseCode}</strong>
                      <div>{session.courseName}</div>
                    </td>
                    <td>{session.teacherName || '-'}</td>
                    <td>{session.startLabel}</td>
                    <td>{session.endLabel}</td>
                    <td>{session.roomName}</td>
                    <td>
                      <span className={session.locked ? styles.locked : styles.unlocked}>
                        {session.locked ? 'Locked' : 'Open'}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button onClick={() => openEditModal(session)}>Chỉnh sửa</button>
                      <button onClick={() => handleDeleteSession(session)} disabled={actionSessionId === session.sessionId}>
                        Xóa
                      </button>
                      <button onClick={() => handleToggleLock(session)} disabled={actionSessionId === session.sessionId}>
                        {session.locked ? 'Mở khóa' : 'Khóa'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={!!editingSession} onClose={closeEditModal} title="Edit session" size="lg">
        <form onSubmit={handleUpdateSession} className={styles.form}>
          <label>
            Khóa học *
            <select name="courseId" value={editForm.courseId} onChange={handleEditChange} required>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code ? `${course.code} - ${course.name}` : course.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Thời gian bắt đầu *
            <input type="datetime-local" name="startTime" value={editForm.startTime} onChange={handleEditChange} required />
          </label>
          <label>
            Thời gian kết thúc *
            <input type="datetime-local" name="endTime" value={editForm.endTime} onChange={handleEditChange} required />
          </label>
          <label>
            Phòng *
            <input type="text" name="roomName" value={editForm.roomName} onChange={handleEditChange} required />
          </label>
          <div className={styles.formRow}>
            <label>
              Vĩ độ
              <input type="number" step="0.000001" name="latitude" value={editForm.latitude} onChange={handleEditChange} />
            </label>
            <label>
              Kinh độ
              <input type="number" step="0.000001" name="longitude" value={editForm.longitude} onChange={handleEditChange} />
            </label>
            <label>
              Bán kính (m)
              <input type="number" step="1" name="radiusMeters" value={editForm.radiusMeters} onChange={handleEditChange} />
            </label>
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={closeEditModal} className={styles.secondary}>
              Hủy
            </button>
            <button type="submit" disabled={editLoading}>
              {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Schedule
