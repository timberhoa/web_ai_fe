import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  startTime: toDateInputValue(getDateAt(now, 8, 0)).slice(0, 16), // Format YYYY-MM-DDThh:mm
  endTime: toDateInputValue(getDateAt(now, 10, 0)).slice(0, 16), // Format YYYY-MM-DDThh:mm
  roomName: '',
  latitude: '',
  longitude: '',
  radiusMeters: '',
}

const defaultRecurringForm: RecurringFormState = {
  courseId: '',
  startDate: new Date().toISOString().slice(0, 10), // Format YYYY-MM-DD
  endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 ngày sau
  startTime: '08:00',
  endTime: '10:00',
  daysOfWeek: [],
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
  const navigate = useNavigate()
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [teachers, setTeachers] = useState<AdminUser[]>([])
  const [lookupsLoading, setLookupsLoading] = useState(false)
  const [showSingleModal, setShowSingleModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)

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
  const [searchField, setSearchField] = useState('courseName')
  const [searchQuery, setSearchQuery] = useState('')
  
  const [activeModalType, setActiveModalType] = useState<'single' | 'recurring' | null>(null)

  const lookupLabel = useMemo(() => {
    if (lookupsLoading) return 'Loading reference data...'
    return feedback
  }, [lookupsLoading, feedback])

  const getPageRange = (currentPage: number, totalPages: number): number[] => {
    const range = []
    const current = currentPage + 1
    const total = totalPages
    
    if (total <= 5) {
      for (let i = 1; i <= total; i++) range.push(i)
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) range.push(i)
      } else if (current >= total - 2) {
        for (let i = total - 4; i <= total; i++) range.push(i)
      } else {
        for (let i = current - 2; i <= current + 2; i++) range.push(i)
      }
    }
    return range
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    let searchParams = { ...filters, page: 0 }
    // Tìm ID dựa trên searchField và searchQuery
    switch (searchField) {
      case 'courseName':
        const foundCourse = courses.find(c => 
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        searchParams.courseId = foundCourse?.id || ''
        break
      case 'courseCode':
        const foundCourseByCode = courses.find(c => 
          c.code?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        searchParams.courseId = foundCourseByCode?.id || ''
        break
      case 'teacherName':
        const foundTeacher = teachers.find(t => 
          (t.fullName || t.username).toLowerCase().includes(searchQuery.toLowerCase())
        )
        searchParams.teacherId = foundTeacher?.id || ''
        break
      case 'roomName':
        // Để trống vì API không hỗ trợ tìm theo phòng
        break
    }

    setFilters(searchParams)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

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

  const handlePageChange = (pageOrDirection: number | 'prev' | 'next') => {
    setFilters((prev) => {
      let nextPage: number
      if (typeof pageOrDirection === 'number') {
        nextPage = pageOrDirection - 1
      } else {
        const currentPage = prev.page
        nextPage = pageOrDirection === 'prev' 
          ? Math.max(0, currentPage - 1) 
          : Math.min(totalPages - 1, currentPage + 1)
      }
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
    const sessionID = await window.location.pathname.split('/')[2];
    console.log("🚀 ~ handleToggleLock ~ sessionID:", sessionID)
    setActionSessionId(sessionID)
    try {
      if (session.locked) {
        await scheduleApi.unlock(sessionID)
        setFeedback('Session unlocked')
      } else {
        await scheduleApi.lock(sessionID)
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

            <section className={styles.buttonGroup}>
        <button 
          className={styles.addButton} 
          onClick={() => setActiveModalType('single')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sắp xếp 1 buổi học
        </button>
        <button 
          className={styles.addButton} 
          onClick={() => setActiveModalType('recurring')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Buổi học định kỳ trong kỳ
        </button>
      </section>

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
            Từ ngày
            <input type="datetime-local" name="from" value={filters.from} onChange={handleFiltersChange} />
          </label>
          <label>
            Đến ngày
            <input type="datetime-local" name="to" value={filters.to} onChange={handleFiltersChange} />
          </label>
        </div>
        <div className={styles.filterActions}>
          <button onClick={() => loadSessions()} disabled={sessionsLoading}>
            Refresh
          </button>
        </div>
      </section>


      <section className={styles.sessionsCard}>
        <div className={styles.sessionsHeader}>
          <div>
            <h2>Danh sách buổi học</h2>
            <div className={styles.searchForm}>
              <div className={styles.searchRow}>
                <label>
                  <span>Tìm theo</span>
                  <select 
                    value={searchField} 
                    onChange={(e) => setSearchField(e.target.value)}
                    className={styles.searchSelect}
                  >
                    <option value="courseName">Tên khóa học</option>
                    <option value="courseCode">Mã khóa học</option>
                    <option value="teacherName">Giảng viên</option>
                    <option value="roomName">Phòng</option>
                  </select>
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Nhập từ khóa tìm kiếm..."
                  className={styles.searchInput}
                />
                <button 
                  onClick={handleSearch}
                  className={styles.searchButton}
                  disabled={sessionsLoading}
                >
                  Tìm kiếm
                </button>
              </div>
              <div className={styles.resultInfo}>
                <p>
                  Tổng cộng {totalElements} buổi học - Trang {filters.page + 1}/{totalPages}
                </p>
              </div>
            </div>
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
                      <button
                        className={styles.viewButton}
                        type="button"
                        onClick={() => navigate(`/session/${session.sessionId}`)}
                        title="Mo trang diem danh"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className={styles.editButton}
                        onClick={() => openEditModal(session)}
                        title="Sửa"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDeleteSession(session)} 
                        disabled={actionSessionId === session.sessionId}
                        title="Xóa"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        className={styles.lockButton} 
                        onClick={() => handleToggleLock(session)} 
                        disabled={actionSessionId === session.sessionId}
                        title={session.locked ? 'Mở khóa' : 'Khóa'}
                      >
                        {session.locked ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11M5 11H19C20.1046 11 21 11.8954 21 13V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V13C3 11.8954 3.89543 11 5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 11H7C5.89543 11 5 11.8954 5 13V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V13C19 11.8954 18.1046 11 17 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
         <div className={styles.pagination}>
            
            <div className={styles.pageNumbers}>
              <button onClick={() => handlePageChange('prev')} disabled={filters.page === 0 || sessionsLoading}>
              Trang trước
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, index) => {
                const pageNum = getPageRange(filters.page, totalPages)[index];
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={pageNum === filters.page + 1 ? styles.currentPage : ''}
                    disabled={sessionsLoading}
                  >
                    {pageNum}
                  </button>
                  
                );
              })}
               <button onClick={() => handlePageChange('next')} disabled={filters.page + 1 >= totalPages || sessionsLoading}>
              Trang sau
            </button>
            </div>
           
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

      <Modal 
        isOpen={activeModalType === 'single'} 
        onClose={() => setActiveModalType(null)} 
        title="Sắp xếp 1 buổi học"
        size="lg"
      >
        <form onSubmit={handleCreateSingle} className={styles.form}>
          <label>
            Môn học
            <select name="courseId" value={singleForm.courseId} onChange={handleSingleChange} required>
              <option value="">Chọn môn học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.formRow}>
            <label>
              Thời gian bắt đầu
              <input
                type="datetime-local"
                name="startTime"
                value={singleForm.startTime}
                onChange={handleSingleChange}
                required
              />
            </label>
            <label>
              Thời gian kết thúc
              <input
                type="datetime-local"
                name="endTime"
                value={singleForm.endTime}
                onChange={handleSingleChange}
                required
              />
            </label>
          </div>

          <label>
            Phòng học
            <input
              type="text"
              name="roomName"
              value={singleForm.roomName}
              onChange={handleSingleChange}
              placeholder="VD: A2.01"
              required
            />
          </label>

          <div className={styles.formRow}>
            <label>
              Vĩ độ
              <input
                type="text"
                name="latitude"
                value={singleForm.latitude}
                onChange={handleSingleChange}
                placeholder="VD: 10.762622"
              />
            </label>
            <label>
              Kinh độ
              <input
                type="text"
                name="longitude"
                value={singleForm.longitude}
                onChange={handleSingleChange}
                placeholder="VD: 106.660172"
              />
            </label>
            <label>
              Bán kính (mét)
              <input
                type="text"
                name="radiusMeters"
                value={singleForm.radiusMeters}
                onChange={handleSingleChange}
                placeholder="VD: 100"
              />
            </label>
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={() => setActiveModalType(null)} className={styles.secondary}>
              Hủy
            </button>
            <button type="submit" disabled={singleLoading}>
              {singleLoading ? 'Đang xử lý...' : 'Tạo buổi học'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={activeModalType === 'recurring'} 
        onClose={() => setActiveModalType(null)} 
        title="Buổi học định kỳ trong kỳ"
        size="lg"
      >
        <form onSubmit={handleCreateRecurring} className={styles.form}>
          <label>
            Môn học
            <select name="courseId" value={recurringForm.courseId} onChange={handleRecurringChange} required>
              <option value="">Chọn môn học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.formRow}>
            <label>
              Từ ngày
              <input
                type="date"
                name="startDate"
                value={recurringForm.startDate}
                onChange={handleRecurringChange}
                required
              />
            </label>
            <label>
              Đến ngày
              <input
                type="date"
                name="endDate"
                value={recurringForm.endDate}
                onChange={handleRecurringChange}
                required
              />
            </label>
          </div>

          <div className={styles.formRow}>
            <label>
              Giờ bắt đầu
              <input
                type="time"
                name="startTime"
                value={recurringForm.startTime}
                onChange={handleRecurringChange}
                required
              />
            </label>
            <label>
              Giờ kết thúc
              <input
                type="time"
                name="endTime"
                value={recurringForm.endTime}
                onChange={handleRecurringChange}
                required
              />
            </label>
          </div>

          <div>
            <label>Các ngày trong tuần</label>
            <div className={styles.dayPicker}>
              {dayOptions.map((day) => (
                <button
                  key={day}
                  type="button"
                  className={recurringForm.daysOfWeek.includes(day) ? styles.daySelected : styles.dayButton}
                  onClick={() => toggleDay(day)}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <label>
            Phòng học
            <input
              type="text"
              name="roomName"
              value={recurringForm.roomName}
              onChange={handleRecurringChange}
              placeholder="VD: A2.01"
              required
            />
          </label>

          <div className={styles.formRow}>
            <label>
              Vĩ độ
              <input
                type="text"
                name="latitude"
                value={recurringForm.latitude}
                onChange={handleRecurringChange}
                placeholder="VD: 10.762622"
              />
            </label>
            <label>
              Kinh độ
              <input
                type="text"
                name="longitude"
                value={recurringForm.longitude}
                onChange={handleRecurringChange}
                placeholder="VD: 106.660172"
              />
            </label>
            <label>
              Bán kính (mét)
              <input
                type="text"
                name="radiusMeters"
                value={recurringForm.radiusMeters}
                onChange={handleRecurringChange}
                placeholder="VD: 100"
              />
            </label>
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={() => setActiveModalType(null)} className={styles.secondary}>
              Hủy
            </button>
            <button type="submit" disabled={recurringLoading}>
              {recurringLoading ? 'Đang xử lý...' : 'Tạo buổi học định kỳ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Schedule
