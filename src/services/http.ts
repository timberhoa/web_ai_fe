import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import { useErrorStore } from '../store/useErrorStore'

const API_BASE_URL =
  (process.env.REACT_APP_API_BASE_URL as string) || 'http://localhost:3000/api'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  try {
    let token = useAuthStore.getState().token as string | null

    if (!token) {
      try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('auth-store') : null
        if (raw) {
          const parsed = JSON.parse(raw)
          token = (parsed?.state?.token as string | null | undefined) ?? null
        }
      } catch { }
    }

    if (token) {
      config.headers = config.headers || {}
        ; (config.headers as any).Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // Swallow errors in token retrieval to avoid breaking requests
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const data = error?.response?.data
    const isFaceVerificationError = status === 401 && data?.error === 'Face Verification Failed'
    const isUnregisteredFaceError = status === 400 && data?.message === 'User has not registered face data'

    if (status === 401 && !isFaceVerificationError) {
      try {
        useAuthStore.getState().logout()
      } catch (e) {
        throw new Error('Không thể đăng xuất')
      }
    }

    // Skip global error notification for Face Verification Failed errors
    // so they can be handled locally by the component
    if (!isFaceVerificationError && !isUnregisteredFaceError) {
      try {
        const method = error?.config?.method?.toUpperCase?.() || ''
        const url = error?.config?.url || ''
        const serverMessage =
          (typeof data?.message === 'string' && data.message) ||
          (Array.isArray(data?.errors) ? data.errors.join(', ') : '') ||
          error?.message ||
          'Yêu cầu không thành công.'

        useErrorStore.getState().show({
          title: 'Lỗi từ máy chủ',
          message: `${serverMessage}${url ? ` (${method} ${url})` : ''}`,
          details: data ? JSON.stringify(data, null, 2) : undefined,
        })
      } catch (e) {
        throw new Error('Không thể xử lý lỗi')
      }
    }

    return Promise.reject(error)
  }
)

export default http
