import http from './http'

export type EnrollmentRow = {
  enrollmentId: string
  courseId: string
  courseCode?: string
  courseName?: string
  studentId: string
  studentCode?: string
  studentName?: string
  facultyName?: string
  studentEmail?:string
  status?: 'ACTIVE' | 'DROPPED'
}

export type BulkEnrollRequest = {
  courseId: string
  studentIds: string[]
}

export type StudentCourse = {
  id: string
  code: string
  name: string
  credits?: number
  teacher_id?: string
  teacher_name?: string
  faculty_name?: string
}

export const enrollmentsApi = {
  async listByCourse(courseId: string) {
    const { data } = await http.get<EnrollmentRow[]>('/admin/enrollments', {
      params: { courseId },
    })
    return data
  },

  async bulkEnroll(payload: BulkEnrollRequest) {
    const { data } = await http.post<EnrollmentRow[]>('/admin/enrollments', payload)
    return data
  },

  async remove(enrollmentId: string) {
    await http.delete(`/admin/enrollments/${enrollmentId}`)
  },

  async myCourses() {
    const { data } = await http.get<StudentCourse[]>('/student/courses')
    return data
  },
}

export default enrollmentsApi
