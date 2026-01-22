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
  facultyId?: string
  active?: boolean
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
export type LoginResponse = { accessToken: string; tokenType?: string; user?: User }

// Forgot Password Types
export type ForgotPasswordRequest = { email: string }
export type ForgotPasswordResponse = {
  message: string
  tokenSentTo?: string
}

export type ValidateTokenResponse = {
  valid: boolean
  message: string
}

export type ResetPasswordRequest = {
  token: string
  newPassword: string
  confirmPassword: string
}

export type ResetPasswordResponse = {
  message: string
}

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
    await http.post('/auth/logout')
  },

  // Forgot Password API
  async forgotPassword(email: string) {
    const { data } = await http.post<ForgotPasswordResponse>('/auth/forgot-password', { email })
    return data
  },

  async validateResetToken(token: string) {
    const { data } = await http.get<ValidateTokenResponse>('/auth/validate-reset-token', {
      params: { token }
    })
    return data
  },

  async resetPassword(payload: ResetPasswordRequest) {
    const { data } = await http.post<ResetPasswordResponse>('/auth/reset-password', payload)
    return data
  },
}
