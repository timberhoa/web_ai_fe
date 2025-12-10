import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import styles from './SessionDetail.module.scss'
import {
  attendanceApi,
  type AttendanceStatus,
  type SessionAttendanceDetail,
  type SessionRosterRow,
} from '../../services/attendance'
import { scheduleApi, type ClassSession } from '../../services/schedule'
import { useAuthStore } from '../../store/useAuthStore'

const attendanceStatuses: AttendanceStatus[] = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED']
const statusLabel: Record<AttendanceStatus | 'UNMARKED', string> = {
  PRESENT: 'Có mặt',
  LATE: 'Đi trễ',
  ABSENT: 'Vắng',
  EXCUSED: 'Miễn',
  UNMARKED: 'Chưa điểm danh',
}

type CombinedRosterRow = SessionRosterRow & { attendanceId?: string | null }

const formatDateTime = (value?: string | null) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

const SessionDetail: React.FC = () => {
  const { sessionId } = useParams()
  const user = useAuthStore((s) => s.user)
  const role = user?.role

  const [detail, setDetail] = useState<SessionAttendanceDetail | null>(null)
  const [roster, setRoster] = useState<SessionRosterRow[]>([])
  const [sessionMeta, setSessionMeta] = useState<ClassSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rowUpdating, setRowUpdating] = useState<string | null>(null)
  const [seedLoading, setSeedLoading] = useState(false)
  const [lockLoading, setLockLoading] = useState(false)
  const [manualSubmitting, setManualSubmitting] = useState(false)
  const [manualForm, setManualForm] = useState<{ studentId: string; status: AttendanceStatus; note: string }>({
    studentId: '',
    status: 'PRESENT',
    note: '',
  })
  const [filters, setFilters] = useState<{ keyword: string; status: 'ALL' | 'UNMARKED' | AttendanceStatus }>({
    keyword: '',
    status: 'ALL',
  })
  const [selfCheckLoading, setSelfCheckLoading] = useState(false)
  const [selfCheckMessage, setSelfCheckMessage] = useState<string | null>(null)
  const [selfCheckError, setSelfCheckError] = useState<string | null>(null)
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const canManageRoster = role === 'TEACHER' || role === 'ADMIN'
  const isStudent = role === 'STUDENT'
  const requiresGeo = (sessionMeta?.radiusMeters ?? 0) > 0

  const extractErrorMessage = useCallback((err: any, fallback: string) => {
    const data = err?.response?.data
    if (typeof data?.message === 'string') return data.message
    if (Array.isArray(data?.errors) && data.errors.length > 0) return data.errors.join(', ')
    if (typeof err?.message === 'string') return err.message
    return fallback
  }, [])

  const loadData = useCallback(async () => {
    if (!sessionId) return
    setLoading(true)
    setError(null)
    let nextError: string | null = null

    if (canManageRoster) {
      try {
        const detailRes = await attendanceApi.sessionDetail(sessionId)
        setDetail(detailRes)
        try {
          const rosterRes = await attendanceApi.sessionRoster(sessionId)
          setRoster(rosterRes || [])
        } catch (rosterError) {
          console.warn('Failed to load roster', rosterError)
          setRoster([])
        }
      } catch (err: any) {
        nextError = extractErrorMessage(err, 'Không thể tải thông tin điểm danh')
        setDetail(null)
        setRoster([])
      }
    } else {
      setDetail(null)
      setRoster([])
    }

    try {
      const metaRes = await scheduleApi.detail(sessionId)
      setSessionMeta(metaRes)
    } catch (metaError: any) {
      console.warn('Failed to load session metadata', metaError)
      setSessionMeta(null)
      if (!nextError) {
        nextError = extractErrorMessage(metaError, 'Khong the tai thong tin buoi hoc')
      }
    }

    setError(nextError)
    setLoading(false)
  }, [sessionId, canManageRoster, extractErrorMessage])

  useEffect(() => {
    loadData()
  }, [loadData])

  const combinedRows: CombinedRosterRow[] = useMemo(() => {
    const records = detail?.records || []
    const recordMap = new Map(records.map((record) => [record.studentId, record]))

    if (roster.length === 0) {
      return records.map((record) => ({
        studentId: record.studentId,
        studentCode: record.studentCode,
        studentName: record.fullName || record.studentName || record.studentId,
        studentEmail: undefined,
        marked: true,
        status: record.status,
        checkedAt: record.markedAt,
        note: record.note,
        attendanceId: record.attendanceId,
      }))
    }

    return roster.map((row) => {
      const match = recordMap.get(row.studentId)
      return {
        ...row,
        studentName: row.studentName || match?.fullName || match?.studentName || row.studentId,
        studentCode: row.studentCode || match?.studentCode,
        status: row.status ?? match?.status ?? null,
        checkedAt: row.checkedAt ?? match?.markedAt ?? null,
        note: row.note ?? match?.note ?? null,
        attendanceId: match?.attendanceId ?? null,
      }
    })
  }, [roster, detail])

  const filteredRows = useMemo(() => {
    return combinedRows.filter((row) => {
      if (filters.status !== 'ALL') {
        if (filters.status === 'UNMARKED') {
          if (row.status) return false
        } else if (row.status !== filters.status) {
          return false
        }
      }
      if (!filters.keyword) return true
      const keyword = filters.keyword.toLowerCase()
      const target = `${row.studentName} ${row.studentCode || ''} ${row.studentEmail || ''}`.toLowerCase()
      return target.includes(keyword)
    })
  }, [combinedRows, filters])

  const studentRow = useMemo(() => {
    if (!user?.id) return undefined
    return combinedRows.find((row) => row.studentId === user.id)
  }, [combinedRows, user?.id])

  const studentStatusKey = (studentRow?.status ?? 'UNMARKED') as AttendanceStatus | 'UNMARKED'

  const stats = useMemo(() => {
    return combinedRows.reduce(
      (acc, row) => {
        const status = row.status
        if (status) {
          const key = status.toLowerCase() as 'present' | 'late' | 'absent' | 'excused'
          if (typeof acc[key] === 'number') {
            acc[key] += 1
          }
          acc.marked += 1
        } else if (row.marked) {
          acc.marked += 1
        }
        return acc
      },
      {
        total: combinedRows.length,
        present: 0,
        late: 0,
        absent: 0,
        excused: 0,
        marked: 0,
      }
    )
  }, [combinedRows])

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('Trinh duyet khong ho tro dinh vi.')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeo({ lat: position.coords.latitude, lng: position.coords.longitude })
        setGeoLoading(false)
      },
      (geoErr) => {
        setGeoError(geoErr.message || 'Khong the lay vi tri.')
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleStatusChange = async (row: CombinedRosterRow, next: AttendanceStatus) => {
    if (!sessionId || !canManageRoster) return
    setRowUpdating(row.studentId)
    setError(null)
    try {
      if (row.attendanceId) {
        await attendanceApi.update(row.attendanceId, { status: next })
      } else {
        await attendanceApi.mark({ sessionId, studentId: row.studentId, status: next })
      }
      await loadData()
    } catch (err: any) {
      setError(err?.message ?? 'Không thể cập nhật trạng thái sinh viên')
    } finally {
      setRowUpdating(null)
    }
  }

  const handleManualSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!sessionId || !manualForm.studentId.trim()) return
    setManualSubmitting(true)
    setError(null)
    try {
      await attendanceApi.mark({
        sessionId,
        studentId: manualForm.studentId.trim(),
        status: manualForm.status,
        note: manualForm.note || undefined,
      })
      setManualForm({ studentId: '', status: 'PRESENT', note: '' })
      await loadData()
    } catch (err: any) {
      setError(err?.message ?? 'Không thể ghi nhận sinh viên')
    } finally {
      setManualSubmitting(false)
    }
  }

  const handleSeed = async () => {
    if (!sessionId) return
    setSeedLoading(true)
    setError(null)
    try {
      await attendanceApi.seed(sessionId)
      await loadData()
    } catch (err: any) {
      setError(err?.message ?? 'Không thể seed điểm danh')
    } finally {
      setSeedLoading(false)
    }
  }
  const handleToggleLock = async () => {
    if (!detail) return
    const currentLocked = (detail?.locked ?? sessionMeta?.locked) ?? false
    console.log('Toggling lock. Current status:', currentLocked)
    setLockLoading(true)
    setError(null)

    try {
      if (currentLocked) {
        console.log('Calling unlock API...')
        await scheduleApi.unlock(sessionId)
      } else {
        console.log('Calling lock API...')
        await scheduleApi.lock(sessionId)
      }
      await loadData()
    } catch (err: any) {
      console.error('Toggle lock error:', err)
      setError(err?.message ?? 'Không thể cập nhật trạng thái khóa')
    } finally {
      setLockLoading(false)
    }
  }

  const handleSelfCheck = async () => {
    if (!sessionId) return
    setSelfCheckLoading(true)
    setSelfCheckError(null)
    try {
      await attendanceApi.selfCheckin({
        session_id: sessionId,
        studentLat: geo?.lat,
        studentLng: geo?.lng,
      })
      setSelfCheckMessage('Điểm danh thành công')
      await loadData()
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message === 'OUT_OF_GEOFENCE') {
        setSelfCheckError('Vị trí của bạn không nằm trong phạm vi lớp học. Vui lòng di chuyển đến đúng phòng học và thử lại.')
      } else if (err.response?.status === 400 && err.response?.data?.message === 'SESSION_LOCKED') {
        setSelfCheckError('Giảng viên đã khóa điểm danh, vui lòng liên hệ với giảng viên để thực hiện điểm danh')
      } else {
        setSelfCheckError('Không thể điểm danh. Vui lòng thử lại.')
      }
    } finally {
      setSelfCheckLoading(false)
    }
  }

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    if (name === 'status') {
      setFilters((prev) => ({ ...prev, status: value as typeof prev.status }))
    } else {
      setFilters((prev) => ({ ...prev, keyword: value }))
    }
  }

  if (!sessionId) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Chi tiết buổi học</h1>
        <div className={styles.card}>Session ID không hợp lệ.</div>
      </div>
    )
  }

  const sessionStart = detail?.startTime ?? sessionMeta?.startTime ?? null
  const sessionEnd = detail?.endTime ?? sessionMeta?.endTime ?? null
  const sessionRange =
    sessionStart || sessionEnd ? `${formatDateTime(sessionStart)} - ${formatDateTime(sessionEnd)}` : '-'
  const displayCourseCode = detail?.courseCode ?? sessionMeta?.courseCode ?? ''
  const displayCourseName = detail?.courseName ?? sessionMeta?.courseName ?? 'Buổi học'
  const displayRoom = detail?.roomName ?? sessionMeta?.roomName ?? '-'
  const isLocked = (detail?.locked ?? sessionMeta?.locked) ?? false
  const teacherName = detail?.teacherName ?? sessionMeta?.teacherName
  const sessionInfoAvailable = Boolean(detail || sessionMeta)
  const showManagementSections = canManageRoster && !!detail

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Chi tiết buổi học</h1>

      {error && <div className={styles.error}>{error}</div>}

      {loading && !sessionInfoAvailable && <div className={styles.card}>Đang tải thông tin buổi học...</div>}

      {!loading && !sessionInfoAvailable && (
        <div className={styles.card}>Không tìm thấy thông tin buổi học.</div>
      )}

      {sessionInfoAvailable && (
        <>
          <section className={styles.card}>
            <div className={styles.sessionHeader}>
              <div>
                {displayCourseCode && <p className={styles.sessionCode}>{displayCourseCode}</p>}
                <h2 className={styles.sessionName}>{displayCourseName}</h2>
                <p className={styles.sessionMeta}>
                  {displayRoom} • {sessionRange}
                </p>
                {teacherName && <p className={styles.sessionMeta}>Giang vien: {teacherName}</p>}
              </div>
              <div className={styles.sessionActions}>
                <span className={`${styles.badge} ${isLocked ? styles.badgeDanger : styles.badgeNeutral}`}>
                  {isLocked ? 'Đã khóa' : 'Đang mở'}
                </span>
                {canManageRoster && (
                  <button
                    type="button"
                    className={isLocked ? styles.secondaryButton : styles.dangerButton}
                    onClick={handleToggleLock}
                    disabled={lockLoading}
                  >
                    {isLocked ? 'Mở khóa' : 'Khóa điểm danh'}
                  </button>
                )}
                <button type="button" className={styles.primaryButton} onClick={loadData} disabled={loading}>
                  Làm mới
                </button>
              </div>
            </div>
            {(sessionMeta?.radiusMeters ?? 0) > 0 && (
              <p className={styles.sessionMeta}>
                Geo-fence: {sessionMeta?.radiusMeters}m quanh (
                {sessionMeta?.latitude ?? '?'}, {sessionMeta?.longitude ?? '?'})
              </p>
            )}
          </section>

          {showManagementSections && (
            <section className={styles.card}>
              <h3>Thống kê</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <p>Tổng đăng ký</p>
                  <strong>{detail?.stats?.totalEnrolled ?? stats.total}</strong>
                </div>
                <div className={styles.statCard}>
                  <p>Đã điểm</p>
                  <strong>{detail?.stats?.totalMarked ?? stats.marked}</strong>
                </div>
                <div className={styles.statCard}>
                  <p>Có mặt</p>
                  <strong>{detail?.stats?.present ?? stats.present}</strong>
                </div>
                <div className={styles.statCard}>
                  <p>Đi trễ</p>
                  <strong>{detail?.stats?.late ?? stats.late}</strong>
                </div>
                <div className={styles.statCard}>
                  <p>Miễn</p>
                  <strong>{detail?.stats?.excused ?? stats.excused}</strong>
                </div>
                <div className={styles.statCard}>
                  <p>Vắng</p>
                  <strong>{detail?.stats?.absent ?? stats.absent}</strong>
                </div>
              </div>
            </section>
          )}

          {isStudent && (
            <section className={styles.card}>
              <h3>Trạng thái của bạn</h3>
              {studentRow ? (
                <div className={styles.studentStatus}>
                  <p>
                    Trạng thái hiện tại:{' '}
                    <span
                      className={`${styles.statusBadge} ${studentRow.status ? styles[`status-${studentRow.status.toLowerCase()}`] : styles.statusUnknown
                        }`}
                    >
                      {statusLabel[studentStatusKey]}
                    </span>
                  </p>
                  <p>Lần cuối: {formatDateTime(studentRow.checkedAt)}</p>
                </div>
              ) : (
                <p>Trạng thái điểm danh sẽ được cập nhật sau khi bạn điểm danh thành công.</p>
              )}
              {requiresGeo && <p className={styles.warning}>Buổi học này yêu cầu bật định vị khi điểm danh.</p>}
              <div className={styles.selfCheck}>
                <div className={styles.geoInputs}>
                  <button type="button" className={styles.secondaryButton} onClick={requestLocation} disabled={geoLoading}>
                    {geoLoading ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại'}
                  </button>
                  {geo && (
                    <p className={styles.geoHint}>
                      Lat: {geo.lat.toFixed(5)} • Lng: {geo.lng.toFixed(5)}
                    </p>
                  )}
                  {geoError && <p className={styles.errorText}>{geoError}</p>}
                </div>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSelfCheck}
                  disabled={selfCheckLoading || (requiresGeo && !geo) || isLocked}
                >
                  {selfCheckLoading ? 'Đang điểm danh...' : 'Điểm danh ngay'}
                </button>
              </div>
              {selfCheckMessage && <p className={styles.successText}>{selfCheckMessage}</p>}
              {selfCheckError && <p className={styles.errorText}>{selfCheckError}</p>}
            </section>
          )}

          {showManagementSections && (
            <section className={styles.card}>
              <h3>Ghi nhận nhanh</h3>
              <form className={styles.quickForm} onSubmit={handleManualSubmit}>
                <input
                  placeholder="ID sinh viên"
                  value={manualForm.studentId}
                  onChange={(event) => setManualForm((prev) => ({ ...prev, studentId: event.target.value }))}
                />
                <select
                  value={manualForm.status}
                  onChange={(event) => setManualForm((prev) => ({ ...prev, status: event.target.value as AttendanceStatus }))}
                >
                  {attendanceStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel[status]}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Ghi chú (tùy chọn)"
                  value={manualForm.note}
                  onChange={(event) => setManualForm((prev) => ({ ...prev, note: event.target.value }))}
                />
                <button type="submit" className={styles.primaryButton} disabled={manualSubmitting || isLocked}>
                  {manualSubmitting ? 'Đang ghi...' : 'Lưu'}
                </button>
              </form>
            </section>
          )}

          {showManagementSections && (
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <h3>Danh sách điểm danh</h3>
                <div className={styles.rosterActions}>
                  <input
                    name="keyword"
                    placeholder="Tìm tên hoặc mã sinh viên"
                    value={filters.keyword}
                    onChange={handleFilterChange}
                  />
                  <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="UNMARKED">Chưa điểm danh</option>
                    {attendanceStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel[status]}
                      </option>
                    ))}
                  </select>
                  <button type="button" className={styles.secondaryButton} onClick={loadData} disabled={loading}>
                    Làm mới
                  </button>
                  {canManageRoster && (
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={handleSeed}
                      disabled={seedLoading || isLocked}
                    >
                      {seedLoading ? 'Đang seed...' : 'Seed vắng mặt'}
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Sinh viên</th>
                      <th>Email</th>
                      <th>Trạng thái</th>
                      <th>Thời gian</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={5}>Đang tải danh sách...</td>
                      </tr>
                    )}
                    {!loading && filteredRows.length === 0 && (
                      <tr>
                        <td colSpan={5}>Không có sinh viên nào.</td>
                      </tr>
                    )}
                    {!loading &&
                      filteredRows.map((row) => (
                        <tr key={row.studentId}>
                          <td>
                            <strong>{row.studentName}</strong>
                            <div className={styles.subtle}>{row.studentCode || row.studentId}</div>
                          </td>
                          <td>{row.studentEmail || '-'}</td>
                          <td>
                            {canManageRoster ? (
                              <select
                                className={styles.statusSelect}
                                value={row.status ?? ''}
                                disabled={rowUpdating === row.studentId || isLocked}
                                onChange={(event) => {
                                  const nextValue = event.target.value as AttendanceStatus | ''
                                  if (!nextValue) return
                                  handleStatusChange(row, nextValue)
                                }}
                              >
                                <option value="">Chưa điểm danh</option>
                                {attendanceStatuses.map((status) => (
                                  <option key={status} value={status}>
                                    {statusLabel[status]}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span
                                className={`${styles.statusBadge} ${row.status ? styles[`status-${row.status.toLowerCase()}`] : styles.statusUnknown
                                  }`}
                              >
                                {statusLabel[row.status ?? 'UNMARKED']}
                              </span>
                            )}
                          </td>
                          <td>{formatDateTime(row.checkedAt)}</td>
                          <td>{row.note || '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default SessionDetail
