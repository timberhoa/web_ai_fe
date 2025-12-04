import http from './http'
import type { Role } from './auth'

export type AdminUser = {
  id: string
  fullName: string
  username: string
  email: string
  phone?: string
  role: Role
  active: boolean
  faculty?: { id: string; code?: string; name?: string } | null
  isFaceRegistered?: boolean
}

export type CreateAdminUserRequest = {
  fullName: string
  username: string
  password: string
  email: string
  phone?: string
  role: Role
  active?: boolean
  facultyId?: string
}

export type UpdateAdminUserRequest = {
  fullName?: string
  username?: string
  password?: string
  email?: string
  phone?: string
  role?: Role
  active?: boolean
  facultyId?: string
}

export type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first?: boolean
  last?: boolean
}

export const adminUsersApi = {
  async list(params: { page?: number; size?: number; sort?: string } = {}) {
    const { page = 0, size = 20, sort } = params
    const { data } = await http.get<Page<AdminUser>>('/admin/users', {
      params: { page, size, sort },
    })
    return data
  },

  async listByRole(role: Role, params: { page?: number; size?: number; sort?: string } = {}) {
    const { page = 0, size = 20, sort } = params
    const { data } = await http.get<Page<AdminUser>>('/admin/users/filter', {
      params: { role, page, size, sort },
    })
    return data
  },

  async create(payload: CreateAdminUserRequest) {
    // Backend expects POST /api/admin/addUser
    const { data } = await http.post<AdminUser>('/admin/addUser', payload)
    return data
  },

  async update(id: string, payload: UpdateAdminUserRequest) {
    const { data } = await http.put<AdminUser>(`/admin/users/${id}`, payload)
    return data
  },

  async remove(id: string) {
    await http.delete(`/admin/users/${id}`)
  },
}

export default adminUsersApi
