import http from './http'

export type Role = 'ADMIN' | 'STUDENT' | 'TEACHER'
export type LoginRequest = { username: string; password: string }
export type RegisterRequest = {
  fullName: string
  username: string
  password: string
  email: string
  phone: string
  role?: Role
}
export type User = {
  id: string
  email: string
  name?: string
  fullName?: string
  username?: string
  phone?: string
  role: Role
}
export type LoginResponse = { token: string; user: User }

export const authApi = {
  async login(payload: LoginRequest) {
    const { data } = await http.post<LoginResponse>('/auth/login', payload)
    return data
  },
  async register(payload: RegisterRequest) {
    const { data } = await http.post<LoginResponse>('/auth/register', payload)
    return data
  },
  async logout() {
   
  },
}
