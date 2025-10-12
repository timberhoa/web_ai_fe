import React, { useState } from 'react'
import Modal from '../Modal/Modal'
import { useErrorStore } from '../../store/useErrorStore'

export default function GlobalErrorModal() {
  const { isOpen, title, message, details, hide } = useErrorStore()
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Modal isOpen={isOpen} onClose={hide} title={title} size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ color: 'var(--text, #111)' }}>{message}</div>
        {details && (
          <>
            <button
              onClick={() => setShowDetails((s) => !s)}
              style={{
                alignSelf: 'flex-start',
                background: 'transparent',
                border: 'none',
                color: 'var(--primary, #3b82f6)',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
            </button>
            {showDetails && (
              <pre style={{
                maxHeight: 240,
                overflow: 'auto',
                background: 'var(--background-secondary, #f8f9fa)',
                padding: 12,
                borderRadius: 8,
                border: '1px solid var(--border, #e5e7eb)'
              }}>
                {details}
              </pre>
            )}
          </>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={hide} style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--border, #e5e7eb)',
            background: 'var(--background, #fff)',
            color: 'var(--text, #111)',
            cursor: 'pointer'
          }}>Đóng</button>
        </div>
      </div>
    </Modal>
  )
}

