import http from './http'

export type AttendanceRecordDTO = {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  timestamp: string
  method: 'face_recognition' | 'manual'
  status: 'success' | 'failed'
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
  async mark(payload: {
    studentId: string
    method: 'face_recognition' | 'manual'
  }) {
    const { data } = await http.post<AttendanceRecordDTO>('/attendance', payload)
    return data
  },
}

