import http from './http'
import type { Page } from './adminUsers'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
export type AttendanceMethod = 'FACE_RECOGNITION' | 'MANUAL' | 'IMPORT' | 'SEED' | 'FACE_AND_LOCATION' | 'TEACHER_FACE_SCAN'

export type AttendanceRecordDTO = {
  id: string
  studentId: string
  studentCode?: string
  studentName: string
  studentClass?: string
  sessionId?: string
  timestamp?: string
  markedAt?: string
  method?: AttendanceMethod | 'face_recognition' | 'manual'
  status: AttendanceStatus
  note?: string
}

export type SessionAttendanceRecord = {
  attendanceId: string
  studentId: string
  studentCode?: string
  fullName?: string
  studentName?: string
  status: AttendanceStatus
  markedAt?: string
  method?: AttendanceMethod
  note?: string
  avatarUrl?: string
}

export type AttendanceStats = {
  totalEnrolled: number
  present: number
  late: number
  absent: number
  excused: number
  totalMarked: number
}

export type SessionAttendanceDetail = {
  sessionId: string
  courseId: string
  courseName: string
  courseCode: string
  teacherId?: string
  teacherName?: string
  roomName: string
  startTime: string
  endTime: string
  locked?: boolean
  stats?: AttendanceStats
  records: SessionAttendanceRecord[]
}

export type SessionRosterRow = {
  studentId: string
  studentCode?: string
  studentName: string
  studentEmail?: string
  marked: boolean
  status?: AttendanceStatus | null
  checkedAt?: string | null
  studentLat?: number | null
  studentLng?: number | null
  note?: string | null
  method?: AttendanceMethod | null
}

export type MonitorWindowRequest = {
  courseId?: string
  teacherId?: string
  minutesBefore?: number
  minutesAfter?: number
}

export type MonitorSession = {
  sessionId: string
  courseId: string
  courseCode: string
  courseName: string
  teacherId?: string
  teacherName?: string
  roomName: string
  startTime: string
  endTime: string
  locked?: boolean
  totalEnrolled?: number
  present?: number
  late?: number
  absent?: number
  excused?: number
  totalMarked?: number
  status?: 'UPCOMING' | 'LIVE' | 'ENDED'
  streamStatus?: 'ONLINE' | 'OFFLINE'
  lastEvent?: string
}

export type AttendanceReviewRow = {
  sessionId: string
  courseId: string
  courseCode: string
  courseName: string
  roomName: string
  teacherId?: string
  teacherName?: string
  startTime: string
  endTime: string
  locked?: boolean
  totalEnrolled?: number
  present?: number
  late?: number
  absent?: number
  excused?: number
  totalMarked?: number
}

export type ReviewFilter = {
  from?: string
  to?: string
  courseId?: string
  teacherId?: string
  locked?: boolean
  page?: number
  size?: number
  sort?: string
}

export type CheckAttendanceRequest = {
  sessionId: string
  studentId: string
  status?: AttendanceStatus
  studentLat?: number
  studentLng?: number
  note?: string
}

export type UpdateAttendanceRequest = {
  status: AttendanceStatus
  studentLat?: number
  studentLng?: number
  note?: string
}

export type SelfCheckinRequest = {
  session_id: string
  studentLat?: number
  studentLng?: number
  imageId?: string
}

export const attendanceApi = {
  async today() {
    const { data } = await http.get<AttendanceRecordDTO[]>('/attendance/today')
    return data
  },

  async list(params?: { date?: string; studentId?: string }) {
    const { data } = await http.get<AttendanceRecordDTO[]>('/attendance', { params })
    return data
  },

  async monitor(params: MonitorWindowRequest = {}) {
    const { data } = await http.get<MonitorSession[]>('/attendance/monitor', {
      params,
    })
    return data
  },

  async review(params: ReviewFilter = {}) {
    const { data } = await http.get<Page<AttendanceReviewRow>>('/attendance/review', {
      params,
    })
    return data
  },

  async sessionDetail(sessionId: string) {
    const { data } = await http.get<SessionAttendanceDetail>(`/attendance/session/${sessionId}`)
    return data
  },

  async sessionRoster(sessionId: string) {
    const { data } = await http.get<SessionRosterRow[]>(`/attendance/session/${sessionId}/roster`)
    return data
  },

  async seed(sessionId: string) {
    const { data } = await http.post<SessionAttendanceDetail>(`/attendance/session/${sessionId}/seed`, {})
    return data
  },

  async mark(payload: CheckAttendanceRequest) {
    const body = {
      session_id: payload.sessionId,
      student_id: payload.studentId,
      status: payload.status ?? 'PRESENT',
      studentLat: payload.studentLat,
      studentLng: payload.studentLng,
      note: payload.note,
    }
    const { data } = await http.post<SessionAttendanceRecord>('/attendance', body)
    return data
  },

  async update(attendanceId: string, payload: UpdateAttendanceRequest) {
    const { data } = await http.put<SessionAttendanceRecord>(`/attendance/${attendanceId}`, payload)
    return data
  },

  async selfCheckin(payload: SelfCheckinRequest) {
    const { data } = await http.post<unknown>('/attendance/self', payload)
    return data
  },

  // --- Face Management (Admin) ---
  async registerFace(userId: string, formData: FormData) {
    // Endpoint: POST /api/admin/user/{userId}/face/register
    // Content-Type: multipart/form-data
    const { data } = await http.post<{
      success: boolean
      message: string
      imagesProcessed: number
      registeredAt: string
    }>(`/admin/user/${userId}/face/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  async deleteFace(userId: string) {
    // Endpoint: DELETE /api/admin/user/{userId}/face
    await http.delete(`/admin/user/${userId}/face`)
  },

  // --- Face Status (Student/Admin) ---
  async checkFaceStatus() {
    // Endpoint: GET /api/user/face/status
    const { data } = await http.get<{
      isRegistered: boolean
      registeredAt?: string
      qualityScore?: number
    }>('/user/face/status')
    return data
  },

  async getFaceStatus(userId: string) {
    // Endpoint: GET /api/admin/user/{userId}/face/status
    const { data } = await http.get<{
      isRegistered: boolean
      registeredAt?: string
      qualityScore?: number
    }>(`/admin/user/${userId}/face/status`)
    return data
  },

  // --- Hybrid Attendance (Student) ---
  async checkInHybrid(formData: FormData) {
    // Endpoint: POST /api/attendance/check-in-hybrid
    // Content-Type: multipart/form-data
    const { data } = await http.post<{
      success: boolean
      isMatch: boolean
      confidence: number
      status: AttendanceStatus
      message: string
      checkInType: string
    }>('/attendance/check-in-hybrid', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  // --- Teacher Face Scan Attendance ---
  async teacherCheckInFace(formData: FormData) {
    // Endpoint: POST /api/attendance/teacher-check-in-face
    // Content-Type: multipart/form-data
    const { data } = await http.post<{
      success: boolean
      studentId: string
      studentName: string
      studentCode: string
      status: AttendanceStatus
      message: string
    }>('/attendance/teacher-check-in-face', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },
}
