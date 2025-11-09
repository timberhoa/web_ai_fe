import http from './http'

export type AdminDashboardResponse = {
  totalStudents: number
  totalCourses: number
  sessionsToday: number
  checkinsToday: number
  attendanceRate: number // 0-100
}

export type SessionSummary = {
  id?: string
  sessionId?: string
  courseId: string
  courseName: string
  courseCode: string
  startTime: string
  endTime: string
  roomName: string
  locked?: boolean
}

export type TeacherDashboardResponse = {
  totalCourses: number
  sessionsToday: number
  totalCheckinsToday: number
  absentToday: number
  lateToday: number
  upcomingSessions: SessionSummary[]
}

export type StudentAttendanceHistoryResponse = {
  attendanceId: string
  sessionId: string
  courseId: string
  courseName: string
  courseCode: string
  startTime: string
  endTime: string
  roomName: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  checkedAt?: string
  note?: string
}

export type StudentDashboardResponse = {
  totalCourses: number
  todayCheckins: number
  faceRegistered: boolean
  todaySessions: SessionSummary[]
  latestAttendance: StudentAttendanceHistoryResponse | null
}

export const dashboardApi = {
  async admin() {
    const { data } = await http.get<AdminDashboardResponse>('/dashboard/admin')
    return data
  },

  async teacher() {
    const { data } = await http.get<TeacherDashboardResponse>('/dashboard/teacher')
    return data
  },

  async student() {
    const { data } = await http.get<StudentDashboardResponse>('/dashboard/student')
    return data
  },
}

export default dashboardApi

