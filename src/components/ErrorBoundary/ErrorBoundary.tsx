import React from 'react'
import { useErrorStore } from '../../store/useErrorStore'

type Props = { children: React.ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    try {
      const { show } = useErrorStore.getState()
      show({
        title: 'Đã xảy ra lỗi',
        message: error.message,
        details: `${error.stack ?? ''}\n\nComponent stack:\n${errorInfo.componentStack}`,
      })
    } catch (_) {
      // noop
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            maxWidth: 560,
            width: '100%',
            background: 'var(--background, #fff)',
            color: 'var(--text, #111)',
            border: '1px solid var(--border, #e5e7eb)',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 8px 0' }}>Đã xảy ra lỗi</h2>
            <p style={{ margin: 0 }}>Một lỗi không mong muốn đã xảy ra. Vui lòng thử lại.</p>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button onClick={() => window.location.reload()} style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid transparent',
                background: 'var(--primary, #3b82f6)',
                color: '#fff',
                cursor: 'pointer'
              }}>Tải lại trang</button>
              <button onClick={() => this.setState({ hasError: false })} style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border, #e5e7eb)',
                background: 'var(--background, #fff)',
                color: 'var(--text, #111)',
                cursor: 'pointer'
              }}>Ẩn thông báo</button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary

