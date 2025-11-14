import React, { useEffect, useMemo, useState, useCallback } from 'react'
import DataTable, { Column } from '../../../components/DataTable/DataTable'
import styles from './Reports.module.scss'
import { reportsApi, type AttendanceReportResponse, type SessionReportResponse, type AttendanceDetail, type SessionReportItem } from '../../../services/reports'
import { coursesApi, type CourseSummary } from '../../../services/courses'
import { adminUsersApi, type AdminUser } from '../../../services/adminUsers'
import { exportAttendanceReportToExcel, exportSessionReportToExcel } from '../../../utils/reportExcelExport'

type ReportTab = 'attendance' | 'session'

type AttendanceFilterForm = {
  courseId?: string
  sessionId?: string
  studentId?: string
  fromDate: string
  toDate: string
}

type SessionFilterForm = {
  courseId?: string
  teacherId?: string
  fromDate: string
  toDate: string
}

// Helper functions for date formatting
const toDateTimeInputValue = (date: Date): string => {
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('vi-VN')
  } catch {
    return dateString
  }
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PRESENT: 'Có mặt',
    LATE: 'Đi muộn',
    ABSENT: 'Vắng mặt',
    EXCUSED: 'Có phép',
  }
  return labels[status] || status
}

const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    PRESENT: styles.statusBadgePresent,
    LATE: styles.statusBadgeLate,
    ABSENT: styles.statusBadgeAbsent,
    EXCUSED: styles.statusBadgeExcused,
  }
  return classes[status] || styles.statusBadgeDefault
}

const now = new Date()
const defaultFromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
const defaultToDate = now

const defaultAttendanceFilter: AttendanceFilterForm = {
  fromDate: toDateTimeInputValue(defaultFromDate).slice(0, 16),
  toDate: toDateTimeInputValue(defaultToDate).slice(0, 16),
}

const defaultSessionFilter: SessionFilterForm = {
  fromDate: toDateTimeInputValue(defaultFromDate).slice(0, 16),
  toDate: toDateTimeInputValue(defaultToDate).slice(0, 16),
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('attendance')
  
  // Data states
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReportResponse | null>(null)
  const [sessionReport, setSessionReport] = useState<SessionReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  // Filter states
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilterForm>(defaultAttendanceFilter)
  const [sessionFilter, setSessionFilter] = useState<SessionFilterForm>(defaultSessionFilter)

  // Lookup data
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [teachers, setTeachers] = useState<AdminUser[]>([])
  const [students, setStudents] = useState<AdminUser[]>([])
  const [lookupsLoading, setLookupsLoading] = useState(false)

  // Load lookup data
  useEffect(() => {
    const loadLookups = async () => {
      setLookupsLoading(true)
      try {
        const [coursesRes, teachersRes, studentsRes] = await Promise.all([
          coursesApi.adminList({ page: 0, size: 200, sort: 'name,asc' }),
          adminUsersApi.listByRole('TEACHER', { page: 0, size: 200, sort: 'fullName,asc' }),
          adminUsersApi.listByRole('STUDENT', { page: 0, size: 500, sort: 'fullName,asc' }),
        ])
        setCourses(coursesRes.content || [])
        setTeachers(teachersRes.content || [])
        setStudents(studentsRes.content || [])
      } catch (err: any) {
        console.warn('Failed to load lookup data', err)
      } finally {
        setLookupsLoading(false)
      }
    }
    loadLookups()
  }, [])

  // Load attendance report
  const loadAttendanceReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {
        fromDate: attendanceFilter.fromDate ? new Date(attendanceFilter.fromDate).toISOString() : undefined,
        toDate: attendanceFilter.toDate ? new Date(attendanceFilter.toDate).toISOString() : undefined,
        includeDetails: true,
      }
      if (attendanceFilter.courseId) params.courseId = attendanceFilter.courseId
      if (attendanceFilter.sessionId) params.sessionId = attendanceFilter.sessionId
      if (attendanceFilter.studentId) params.studentId = attendanceFilter.studentId

      const report = await reportsApi.getAttendanceReport(params)
      setAttendanceReport(report)
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải báo cáo điểm danh')
      setAttendanceReport(null)
    } finally {
      setLoading(false)
    }
  }, [attendanceFilter])

  // Load session report
  const loadSessionReport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {
        fromDate: sessionFilter.fromDate ? new Date(sessionFilter.fromDate).toISOString() : undefined,
        toDate: sessionFilter.toDate ? new Date(sessionFilter.toDate).toISOString() : undefined,
      }
      if (sessionFilter.courseId) params.courseId = sessionFilter.courseId
      if (sessionFilter.teacherId) params.teacherId = sessionFilter.teacherId

      const report = await reportsApi.getSessionReport(params)
      setSessionReport(report)
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải báo cáo buổi học')
      setSessionReport(null)
    } finally {
      setLoading(false)
    }
  }, [sessionFilter])

  // Handle filter changes
  const handleAttendanceFilterChange = (field: keyof AttendanceFilterForm, value: string) => {
    setAttendanceFilter((prev) => ({ ...prev, [field]: value }))
  }

  const handleSessionFilterChange = (field: keyof SessionFilterForm, value: string) => {
    setSessionFilter((prev) => ({ ...prev, [field]: value }))
  }

  // Handle form submissions
  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadAttendanceReport()
  }

  const handleSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadSessionReport()
  }

  // Handle exports
  const handleExportAttendance = async () => {
    if (!attendanceReport) return
    
    setExporting(true)
    try {
      await exportAttendanceReportToExcel(
        attendanceReport,
        (reportId, params) => reportsApi.downloadAttendanceReport(reportId, params)
      )
    } catch (err: any) {
      setError(err?.message ?? 'Xuất file Excel thất bại')
    } finally {
      setExporting(false)
    }
  }

  const handleExportSession = async () => {
    if (!sessionReport) return
    
    setExporting(true)
    try {
      await exportSessionReportToExcel(
        sessionReport,
        (reportId, params) => reportsApi.downloadSessionReport(reportId, params)
      )
    } catch (err: any) {
      setError(err?.message ?? 'Xuất file Excel thất bại')
    } finally {
      setExporting(false)
    }
  }

  // Attendance columns
  const attendanceColumns: Column<AttendanceDetail>[] = useMemo(() => [
    {
      key: 'sessionStartTime',
      title: 'Thời gian',
      width: '180px',
      render: (_: any, record) => (
        <div>
          <div>{formatDateTime(record.sessionStartTime)}</div>
          <div className={styles.subText}>{formatDateTime(record.sessionEndTime)}</div>
        </div>
      ),
    },
    {
      key: 'roomName',
      title: 'Phòng học',
      width: '120px',
      dataIndex: 'roomName' as keyof AttendanceDetail,
    },
    {
      key: 'studentName',
      title: 'Sinh viên',
      width: '200px',
      render: (_: any, record) => (
        <div>
          <div className={styles.primaryText}>{record.studentName}</div>
          <div className={styles.subText}>{record.studentEmail}</div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '120px',
      align: 'center',
      render: (_: any, record) => (
        <span className={`${styles.statusBadge} ${getStatusBadgeClass(record.status)}`}>
          {getStatusLabel(record.status)}
        </span>
      ),
    },
    {
      key: 'checkedAt',
      title: 'Thời gian check-in',
      width: '160px',
      render: (_: any, record) => (
        <span>{record.checkedAt ? formatDateTime(record.checkedAt) : '-'}</span>
      ),
    },
    {
      key: 'note',
      title: 'Ghi chú',
      width: '200px',
      dataIndex: 'note' as keyof AttendanceDetail,
      render: (_: any, record) => <span>{record.note || '-'}</span>,
    },
  ], [])

  // Session columns
  const sessionColumns: Column<SessionReportItem>[] = useMemo(() => [
    {
      key: 'startTime',
      title: 'Thời gian',
      width: '180px',
      render: (_: any, record) => (
        <div>
          <div>{formatDateTime(record.startTime)}</div>
          <div className={styles.subText}>{formatDateTime(record.endTime)}</div>
        </div>
      ),
    },
    {
      key: 'roomName',
      title: 'Phòng học',
      width: '120px',
      dataIndex: 'roomName' as keyof SessionReportItem,
    },
    {
      key: 'locked',
      title: 'Trạng thái',
      width: '100px',
      align: 'center',
      render: (_: any, record) => (
        <span className={`${styles.statusBadge} ${record.locked ? styles.statusBadgeLocked : styles.statusBadgeOpen}`}>
          {record.locked ? 'Đã khóa' : 'Mở'}
        </span>
      ),
    },
    {
      key: 'totalEnrolled',
      title: 'Tổng SV',
      width: '90px',
      align: 'center',
      dataIndex: 'totalEnrolled' as keyof SessionReportItem,
    },
    {
      key: 'presentCount',
      title: 'Có mặt',
      width: '90px',
      align: 'center',
      dataIndex: 'presentCount' as keyof SessionReportItem,
      render: (_: any, record) => (
        <span className={styles.countPresent}>{record.presentCount}</span>
      ),
    },
    {
      key: 'lateCount',
      title: 'Muộn',
      width: '90px',
      align: 'center',
      dataIndex: 'lateCount' as keyof SessionReportItem,
      render: (_: any, record) => (
        <span className={styles.countLate}>{record.lateCount}</span>
      ),
    },
    {
      key: 'absentCount',
      title: 'Vắng',
      width: '90px',
      align: 'center',
      dataIndex: 'absentCount' as keyof SessionReportItem,
      render: (_: any, record) => (
        <span className={styles.countAbsent}>{record.absentCount}</span>
      ),
    },
    {
      key: 'excusedCount',
      title: 'Có phép',
      width: '90px',
      align: 'center',
      dataIndex: 'excusedCount' as keyof SessionReportItem,
    },
    {
      key: 'attendanceRate',
      title: 'Tỷ lệ (%)',
      width: '110px',
      align: 'center',
      render: (_: any, record) => (
        <span className={styles.attendanceRate}>
          {record.attendanceRate.toFixed(1)}%
        </span>
      ),
    },
  ], [])

  return (
    <div className={styles.reports}>
      <div className={styles.reportsHeader}>
        <div className={styles.reportsTitle}>
          <h1 className={styles.title}>Báo cáo & Thống kê</h1>
          <p className={styles.subtitle}>Báo cáo điểm danh và buổi học</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'attendance' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Báo cáo điểm danh
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'session' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('session')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Báo cáo buổi học
        </button>
      </div>

      <div className={styles.reportsContent}>
        {/* Attendance Report Section */}
        {activeTab === 'attendance' && (
          <>
            {/* Filter Form */}
            <form className={styles.filterForm} onSubmit={handleAttendanceSubmit}>
              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Môn học</label>
                  <select
                    className={styles.filterSelect}
                    value={attendanceFilter.courseId || ''}
                    onChange={(e) => handleAttendanceFilterChange('courseId', e.target.value)}
                    disabled={lookupsLoading}
                  >
                    <option value="">Tất cả môn học</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Sinh viên</label>
                  <select
                    className={styles.filterSelect}
                    value={attendanceFilter.studentId || ''}
                    onChange={(e) => handleAttendanceFilterChange('studentId', e.target.value)}
                    disabled={lookupsLoading}
                  >
                    <option value="">Tất cả sinh viên</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.fullName} ({student.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Từ ngày</label>
                  <input
                    type="datetime-local"
                    className={styles.filterInput}
                    value={attendanceFilter.fromDate}
                    onChange={(e) => handleAttendanceFilterChange('fromDate', e.target.value)}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Đến ngày</label>
                  <input
                    type="datetime-local"
                    className={styles.filterInput}
                    value={attendanceFilter.toDate}
                    onChange={(e) => handleAttendanceFilterChange('toDate', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.filterActions}>
                <button type="submit" className={styles.filterButton} disabled={loading}>
                  {loading ? 'Đang tải...' : 'Tạo báo cáo'}
                </button>
                {attendanceReport && (
                  <button
                    type="button"
                    className={styles.exportButton}
                    onClick={handleExportAttendance}
                    disabled={exporting}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {exporting ? 'Đang xuất...' : 'Xuất Excel'}
                  </button>
                )}
              </div>
            </form>

            {/* Error Display */}
            {error && (
              <div className={styles.errorMessage}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Report Summary */}
            {attendanceReport && (
              <div className={styles.reportSummary}>
                <div className={styles.summaryHeader}>
                  <h2 className={styles.summaryTitle}>{attendanceReport.title}</h2>
                  <div className={styles.summaryMeta}>
                    <span>Tạo lúc: {formatDateTime(attendanceReport.generatedAt)}</span>
                    <span>Bởi: {attendanceReport.generatedBy}</span>
                  </div>
                </div>

                <div className={styles.summaryStats}>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng buổi học</div>
                    <div className={styles.statValue}>{attendanceReport.totalSessions}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng sinh viên</div>
                    <div className={styles.statValue}>{attendanceReport.totalStudents}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Có mặt</div>
                    <div className={`${styles.statValue} ${styles.statPresent}`}>{attendanceReport.presentCount}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Đi muộn</div>
                    <div className={`${styles.statValue} ${styles.statLate}`}>{attendanceReport.lateCount}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Vắng mặt</div>
                    <div className={`${styles.statValue} ${styles.statAbsent}`}>{attendanceReport.absentCount}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Có phép</div>
                    <div className={`${styles.statValue} ${styles.statExcused}`}>{attendanceReport.excusedCount}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tỷ lệ điểm danh</div>
                    <div className={`${styles.statValue} ${styles.statRate}`}>
                      {attendanceReport.attendanceRate.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {attendanceReport.courseName && (
                  <div className={styles.summaryInfo}>
                    <div><strong>Môn học:</strong> {attendanceReport.courseName} ({attendanceReport.courseCode})</div>
                    <div><strong>Thời gian:</strong> {formatDate(attendanceReport.fromDate)} - {formatDate(attendanceReport.toDate)}</div>
                  </div>
                )}
              </div>
            )}

            {/* Attendance Details Table */}
            {attendanceReport && attendanceReport.details && attendanceReport.details.length > 0 && (
              <DataTable
                data={attendanceReport.details}
                columns={attendanceColumns}
                loading={loading}
                emptyText="Không có dữ liệu điểm danh"
                pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true }}
              />
            )}
          </>
        )}

        {/* Session Report Section */}
        {activeTab === 'session' && (
          <>
            {/* Filter Form */}
            <form className={styles.filterForm} onSubmit={handleSessionSubmit}>
              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Môn học</label>
                  <select
                    className={styles.filterSelect}
                    value={sessionFilter.courseId || ''}
                    onChange={(e) => handleSessionFilterChange('courseId', e.target.value)}
                    disabled={lookupsLoading}
                  >
                    <option value="">Tất cả môn học</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Giảng viên</label>
                  <select
                    className={styles.filterSelect}
                    value={sessionFilter.teacherId || ''}
                    onChange={(e) => handleSessionFilterChange('teacherId', e.target.value)}
                    disabled={lookupsLoading}
                  >
                    <option value="">Tất cả giảng viên</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.fullName} ({teacher.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Từ ngày</label>
                  <input
                    type="datetime-local"
                    className={styles.filterInput}
                    value={sessionFilter.fromDate}
                    onChange={(e) => handleSessionFilterChange('fromDate', e.target.value)}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Đến ngày</label>
                  <input
                    type="datetime-local"
                    className={styles.filterInput}
                    value={sessionFilter.toDate}
                    onChange={(e) => handleSessionFilterChange('toDate', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.filterActions}>
                <button type="submit" className={styles.filterButton} disabled={loading}>
                  {loading ? 'Đang tải...' : 'Tạo báo cáo'}
                </button>
                {sessionReport && (
                  <button
                    type="button"
                    className={styles.exportButton}
                    onClick={handleExportSession}
                    disabled={exporting}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {exporting ? 'Đang xuất...' : 'Xuất Excel'}
                  </button>
                )}
              </div>
            </form>

            {/* Error Display */}
            {error && (
              <div className={styles.errorMessage}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Report Summary */}
            {sessionReport && (
              <div className={styles.reportSummary}>
                <div className={styles.summaryHeader}>
                  <h2 className={styles.summaryTitle}>{sessionReport.title}</h2>
                  <div className={styles.summaryMeta}>
                    <span>Tạo lúc: {formatDateTime(sessionReport.generatedAt)}</span>
                    <span>Bởi: {sessionReport.generatedBy}</span>
                  </div>
                </div>

                <div className={styles.summaryStats}>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng buổi học</div>
                    <div className={styles.statValue}>{sessionReport.totalSessions}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng sinh viên</div>
                    <div className={styles.statValue}>{sessionReport.totalStudents}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng có mặt</div>
                    <div className={`${styles.statValue} ${styles.statPresent}`}>{sessionReport.totalPresent}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng muộn</div>
                    <div className={`${styles.statValue} ${styles.statLate}`}>{sessionReport.totalLate}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng vắng</div>
                    <div className={`${styles.statValue} ${styles.statAbsent}`}>{sessionReport.totalAbsent}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tổng có phép</div>
                    <div className={`${styles.statValue} ${styles.statExcused}`}>{sessionReport.totalExcused}</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statLabel}>Tỷ lệ TB</div>
                    <div className={`${styles.statValue} ${styles.statRate}`}>
                      {sessionReport.averageAttendanceRate.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {(sessionReport.courseName || sessionReport.teacherName) && (
                  <div className={styles.summaryInfo}>
                    {sessionReport.courseName && (
                      <div><strong>Môn học:</strong> {sessionReport.courseName} ({sessionReport.courseCode})</div>
                    )}
                    {sessionReport.teacherName && (
                      <div><strong>Giảng viên:</strong> {sessionReport.teacherName}</div>
                    )}
                    <div><strong>Thời gian:</strong> {formatDate(sessionReport.fromDate)} - {formatDate(sessionReport.toDate)}</div>
                  </div>
                )}
              </div>
            )}

            {/* Session Details Table */}
            {sessionReport && sessionReport.sessions && sessionReport.sessions.length > 0 && (
              <DataTable
                data={sessionReport.sessions}
                columns={sessionColumns}
                loading={loading}
                emptyText="Không có dữ liệu buổi học"
                pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Reports
