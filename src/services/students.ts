import http from './http'

export type StudentDTO = {
  id: string
  name: string
  class: string
  status: 'attended' | 'absent'
}

export type CreateStudentDTO = Omit<StudentDTO, 'id'>

export const studentsApi = {
  async list() {
    try {
      const { data } = await http.get<StudentDTO[]>('/students')
      return data
    } catch (_) {
      // Fallback to empty array if API not available
      return [] as StudentDTO[]
    }
  },
  async create(payload: CreateStudentDTO) {
    try {
      const { data } = await http.post<StudentDTO>('/students', payload)
      return data
    } catch (_) {
      // Mock created entity when API is unavailable
      return { id: Date.now().toString(), ...payload } as StudentDTO
    }
  },
  async update(id: string, patch: Partial<StudentDTO>) {
    try {
      const { data } = await http.patch<StudentDTO>(`/students/${id}`, patch)
      return data
    } catch (_) {
      // Return patch for optimistic update
      return { id, ...patch } as StudentDTO
    }
  },
  async remove(id: string) {
    try {
      await http.delete(`/students/${id}`)
    } catch (_) {
      // ignore
    }
  },
}

export default studentsApi

