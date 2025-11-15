import http from "./http"

export type Faculty = {
  id: string
  code: string
  name: string
  description?: string
}

export type CreateFacultyRequest = {
  code: string
  name: string
}

export type UpdateFacultyRequest = {
  code: string
  name: string
}

export const facultyApi = {
  async getFacultyList() {
    const { data } = await http.get<Faculty[]>('/faculties')
    return data
  },

  async getFacultyById(id: string) {
    const { data } = await http.get<Faculty>(`/faculties/${id}`)
    return data
  },

  async create(payload: CreateFacultyRequest) {
    const { data } = await http.post<Faculty>('/faculties', payload)
    return data
  },

  async update(id: string, payload: UpdateFacultyRequest) {
    const { data } = await http.put<Faculty>(`/faculties/${id}`, payload)
    return data
  },

  async remove(id: string) {
    await http.delete(`/faculties/${id}`)
  }
}

export default facultyApi