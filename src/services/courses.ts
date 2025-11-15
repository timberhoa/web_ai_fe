import http from './http'
import type { Page } from './adminUsers'

export type CourseSummary = {
  id: string
  code: string
  name: string
  credits?: number
  teacherId?: string
  teacher_name?: string
  facultyId?: string
  faculty_name?: string
}

export type CreateCourseRequest = {
  code: string
  name: string
  teacher_id: string
  credits?: number
  faculty_id?: string
}

export type UpdateCourseRequest = Partial<CreateCourseRequest>

export const coursesApi = {
  async adminList(params: { page?: number; size?: number; sort?: string } = {}) {
    const { page = 0, size = 50, sort = 'name,asc' } = params
    const { data } = await http.get<Page<CourseSummary>>('/course/admin/all', {
      params: { page, size, sort },
    })
    return data
  },

  async search(name: string, params: { page?: number; size?: number; sort?: string } = {}) {
    const { page = 0, size = 20, sort = 'name,asc' } = params
    const { data } = await http.get<Page<CourseSummary>>('/course/search', {
      params: { name, page, size, sort },
    })
    return data
  },

  async create(payload: CreateCourseRequest) {
    const { data } = await http.post<CourseSummary>('/course/', payload)
    return data
  },

  async update(id: string, payload: UpdateCourseRequest) {
    const { data } = await http.put<CourseSummary>(`/course/${id}`, payload)
    return data
  },

  async remove(id: string) {
    await http.delete(`/course/${id}`)
  },

  async getById(id: string) {
    const { data } = await http.get<CourseSummary>(`/course/${id}`)
    return data
  },

  async listByFaculty(facultyCode: string, params: { page?: number; size?: number; sort?: string } = {}) {
    const { page = 0, size = 10, sort = 'name' } = params
    const { data } = await http.get<Page<CourseSummary>>(`/course/by-faculty/${facultyCode}`, {
      params: { page, size, sort },
    })
    return data
  },
}

export default coursesApi
