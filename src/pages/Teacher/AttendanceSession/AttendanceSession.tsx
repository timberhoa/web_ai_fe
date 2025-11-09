import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import styles from '../Teacher.module.scss'
import {
  attendanceApi,
  type AttendanceStatus,
  type SessionAttendanceDetail,
  type SessionAttendanceRecord,
} from '../../../services/attendance'
import { scheduleApi } from '../../../services/schedule'

const attendanceStatuses: AttendanceStatus[] = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED']

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

const AttendanceSession: React.FC = () => {
  const { sessionId } = useParams()
  const [detail, setDetail] = useState<SessionAttendanceDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [newStudentId, setNewStudentId] = useState('')
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('PRESENT')
  const [newNote, setNewNote] = useState('')

  const loadDetail = async () => {
    if (!sessionId) return
    setLoading(true)
    setError(null)
    try {
      const data = await attendanceApi.sessionDetail(sessionId)
      setDetail(data)
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải dữ liệu buổi học')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetail()
  }, [sessionId])

  const handleToggleLock = async () => {
    if (!detail) return
    setUpdatingId('lock')
    try {
      if (detail.locked) {
        await scheduleApi.unlock(detail.sessionId)
      } else {
        await scheduleApi.lock(detail.sessionId)
      }
      await loadDetail()
    } catch (err: any) {
      setError(err?.message ?? 'Không thể cập nhật trạng thái khóa')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleStatusChange = async (record: SessionAttendanceRecord, next: AttendanceStatus) => {
    setUpdatingId(record.attendanceId)
    setError(null)
    try {
      await attendanceApi.update(record.attendanceId, { status: next, note: record.note })
      await loadDetail()
    } catch (err: any) {
      setError(err?.message ?? 'Không thể cập nhật trạng thái sinh viên')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleMarkStudent = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!sessionId || !newStudentId) return
    setUpdatingId('mark')
    setError(null)
    try {
      await attendanceApi.mark({
        sessionId,
        studentId: newStudentId,
        status: newStatus,
        note: newNote || undefined,
      })
      setNewStudentId('')
      setNewNote('')
      setNewStatus('PRESENT')
      await loadDetail()
    } catch (err: any) {
      setError(err?.message ?? 'Không thể ghi nhận sinh viên')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredRecords = useMemo(() => detail?.records ?? [], [detail])

  if (!sessionId) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Attendance Session</h1>
        <div className={styles.card}>Không tìm thấy sessionId trên URL.</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Điểm danh buổi học</h1>

      {error && <div className={styles.card}>{error}</div>}

      {loading && <div className={styles.card}>Đang tải thông tin buổi học...</div>}

      {!loading && detail && (
        <>
          <div className={styles.card}>
            <h2>{detail.courseName}</h2>
            <p>
              {detail.courseCode} · {detail.roomName}
            </p>
            <p>{formatDateTime(detail.startTime)}</p>
            <div className={styles.actions}>
              <span>{detail.locked ? 'Đã khóa' : 'Đang mở'}</span>
              <button
                type="button"
                className={detail.locked ? styles.primaryButton : styles.dangerButton}
                onClick={handleToggleLock}
                disabled={updatingId === 'lock'}
              >
                {detail.locked ? 'Mở khóa' : 'Khóa điểm danh'}
              </button>
              <button type="button" className={styles.primaryButton} onClick={loadDetail} disabled={loading}>
                Làm mới
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <h3>Ghi nhận nhanh</h3>
            <form className={styles.toolbar} onSubmit={handleMarkStudent}>
              <input
                placeholder="Mã sinh viên"
                value={newStudentId}
                onChange={(event) => setNewStudentId(event.target.value)}
              />
              <select value={newStatus} onChange={(event) => setNewStatus(event.target.value as AttendanceStatus)}>
                {attendanceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input placeholder="Ghi chú" value={newNote} onChange={(event) => setNewNote(event.target.value)} />
              <button type="submit" disabled={updatingId === 'mark' || detail.locked}>
                {updatingId === 'mark' ? 'Đang ghi...' : 'Ghi nhận'}
              </button>
            </form>
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
                    <td colSpan={4}>Không có dữ liệu điểm danh.</td>
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
                        disabled={detail.locked || updatingId === record.attendanceId}
                        onChange={(event) => handleStatusChange(record, event.target.value as AttendanceStatus)}
                      >
                        {attendanceStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{record.note || '-'}</td>
                    <td>{formatDateTime(record.markedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default AttendanceSession
