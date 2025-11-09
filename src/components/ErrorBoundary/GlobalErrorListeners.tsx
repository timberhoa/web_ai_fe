import { useEffect } from 'react'
import { useErrorStore } from '../../store/useErrorStore'

export default function GlobalErrorListeners() {
  const show = useErrorStore((s) => s.show)

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      show({
        title: 'Lỗi hệ thống',
        message: event.message || 'Đã xảy ra lỗi không xác định.',
        details: event.error?.stack || undefined,
      })
    }
    const onUnhandled = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      let message = 'Yêu cầu gặp lỗi không xác định.'
      let details: string | undefined
      if (reason instanceof Error) {
        message = reason.message
        details = reason.stack
      } else if (typeof reason === 'string') {
        message = reason
      } else {
        try { message = JSON.stringify(reason, null, 2) } catch {}
      }
      show({ title: 'Lỗi từ máy chủ', message, details })
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandled)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandled)
    }
  }, [show])

  return null
}

