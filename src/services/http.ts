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
    const token = useAuthStore.getState().token
    if (token) {
      config.headers = config.headers || {}
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }
  } catch (_) {
    // silent
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      try {
        useAuthStore.getState().logout()
      } catch (_) {
        // silent
      }
    }
    try {
      const data = error?.response?.data
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
    } catch (_) {
      // swallow
    }
    return Promise.reject(error)
  }
)

export default http
