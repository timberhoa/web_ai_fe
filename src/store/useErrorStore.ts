import { create } from 'zustand'

type ErrorPayload = {
  title?: string
  message: string
  details?: string
}

type ErrorState = {
  isOpen: boolean
  title: string
  message: string
  details?: string
  show: (payload: ErrorPayload) => void
  hide: () => void
  fromUnknown: (err: unknown, fallbackTitle?: string) => void
}

export const useErrorStore = create<ErrorState>()((set) => ({
  isOpen: false,
  title: '',
  message: '',
  details: undefined,
  show: ({ title, message, details }) =>
    set({ isOpen: true, title: title ?? 'Đã xảy ra lỗi', message, details }),
  hide: () => set({ isOpen: false }),
  fromUnknown: (err, fallbackTitle = 'Đã xảy ra lỗi') => {
    let message = 'Lỗi không xác định.'
    let details: string | undefined
    if (err instanceof Error) {
      message = err.message
      details = err.stack
    } else if (typeof err === 'string') {
      message = err
    } else if (typeof err === 'object' && err) {
      try {
        message = JSON.stringify(err)
      } catch {
        message = 'Lỗi không xác định.'
      }
    }
    set({ isOpen: true, title: fallbackTitle, message, details })
  },
}))

