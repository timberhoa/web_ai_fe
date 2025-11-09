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
      } catch {}
    }

    if (token) {
      config.headers = config.headers || {}
      ;(config.headers as any).Authorization = `Bearer ${token}`
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
    if (status === 401) {
      try {
        useAuthStore.getState().logout()
      } catch (e) {
        throw new Error('Không thể đăng xuất')
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
    } catch (e) {
      throw new Error('Không thể xử lý lỗi')
    }
    return Promise.reject(error)
  }
)

export default http
