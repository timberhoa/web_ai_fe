import http from './http'
import type { Page } from './adminUsers'

export type ClassSession = {
  
  sessionId: string
  courseId: string
  courseName: string
  courseCode: string
  teacherId?: string
  teacherName?: string
  roomName: string
  startTime: string
  endTime: string
  latitude?: number
  longitude?: number
  radiusMeters?: number
  locked?: boolean
}

export type ClassSessionRequest = {
  courseId: string
  startTime: string
  endTime: string
  roomName: string
  latitude?: number
  longitude?: number
  radiusMeters?: number
}

export type RecurringSessionRequest = {
  courseId: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  daysOfWeek: string[]
  roomName: string
  latitude?: number
  longitude?: number
  radiusMeters?: number
}

export type SessionFilter = {
  courseId?: string
  teacherId?: string
  from?: string
  to?: string
  page?: number
  size?: number
  sort?: string
}

export type AttendanceStatsResponse = {
  sessionId: string
  courseName: string
  courseCode: string
  roomName: string
  totalEnrolledStudents: number
  presentStudents: number
  lateStudents: number
  absentStudents: number
  excusedStudents: number
  attendanceRate: number
}

export const scheduleApi = {
  async list(params: SessionFilter = {}) {
    const { data } = await http.get<Page<ClassSession>>('/schedule', {
      params,
    })
    return data
  },

  async adminList(params: SessionFilter = {}) {
    const { data } = await http.get<Page<ClassSession>>('/admin/sessions', {
      params,
    })
    return data
  },

  async detail(sessionId: string) {
    const { data } = await http.get<ClassSession>(`/schedule/${sessionId}`)
    return data
  },

  async create(payload: ClassSessionRequest) {
    const { data } = await http.post<ClassSession>('/schedule', payload)
    return data
  },

  async createRecurring(payload: RecurringSessionRequest) {
    const { data } = await http.post<ClassSession[]>('/schedule/recurring', payload)
    return data
  },

  async update(sessionId: string, payload: ClassSessionRequest) {
    const { data } = await http.put<ClassSession>(`/schedule/${sessionId}`, payload)
    return data
  },

  async remove(sessionId: string) {
    await http.delete(`/schedule/${sessionId}`)
  },

  async lock(sessionId: string | undefined ) {
    console.log("🚀 ~ sessionId:", sessionId)
    const { data } = await http.post<ClassSession>(`/attendance/review/${sessionId}/lock`, {})
    return data
  },

  async unlock(sessionId: string | undefined  ) {
    console.log("🚀 ~ (sessionId:", sessionId)
    const { data } = await http.post<ClassSession>(`/attendance/review/${sessionId}/unlock`, {})
    return data
  },

  async stats(sessionId: string | undefined) {
    const { data } = await http.get<AttendanceStatsResponse>(`/admin/stats/attendance/${sessionId}`)
    return data
  },
}

export default scheduleApi
