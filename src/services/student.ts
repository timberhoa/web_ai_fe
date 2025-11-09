import http from './http'
import type { Page } from './adminUsers'
import type { ClassSession } from './schedule'

export type StudentSessionFilter = {
  from?: string
  to?: string
  page?: number
  size?: number
  sort?: string
}

export type StudentAttendanceHistory = {
  attendanceId: string
  sessionId: string
  courseId: string
  courseName: string
  courseCode: string
  startTime: string
  endTime: string
  roomName: string
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED'
  checkedAt?: string
  note?: string
}

export type StudentAttendanceStats = {
  courseId: string
  courseName: string
  courseCode: string
  totalSessions: number
  attendedSessions: number
  presentCount: number
  lateCount: number
  excusedCount: number
  absentCount: number
  attendanceRate: number
}

export type StudentHistoryFilter = {
  courseId?: string
  from?: string
  to?: string
  page?: number
  size?: number
  sort?: string
}

export type StudentStatsFilter = {
  courseId?: string
  from?: string
  to?: string
}

export const studentApi = {
  async mySessions(params: StudentSessionFilter = {}) {
    const { data } = await http.get<Page<ClassSession>>('/student/sessions', {
      params,
    })
    return data
  },

  async myAttendanceHistory(params: StudentHistoryFilter = {}) {
    const { data } = await http.get<Page<StudentAttendanceHistory>>('/student/attendance/history', {
      params,
    })
    return data
  },

  async myAttendanceStats(params: StudentStatsFilter = {}) {
    const { data } = await http.get<StudentAttendanceStats[]>('/student/attendance/stats', {
      params,
    })
    return data
  },
}

export default studentApi
