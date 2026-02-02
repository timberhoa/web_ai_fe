import React, { useState } from 'react'
import styles from '../Admin.module.scss'
import pageStyles from './FacesSettings.module.scss'
import NotificationModal from '../../../components/NotificationModal/NotificationModal'

const FacesSettings: React.FC = () => {
  const [threshold, setThreshold] = useState(0.65)
  const [liveness, setLiveness] = useState(true)
  const [selfEnroll, setSelfEnroll] = useState(false)
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; message: string }>({ isOpen: false, type: 'success', message: '' })

  const save = () => {
    setNotification({ isOpen: true, type: 'success', message: `Đã lưu: threshold=${threshold}, liveness=${liveness}, self-enroll=${selfEnroll}` })
  }

  return (
    <div className={`${styles.page} ${pageStyles.root}`}>
      <h1 className={styles.title}>Cài đặt FR</h1>
      <div className={`${styles.card} ${pageStyles.form}`}>
        <label>
          Ngưỡng nhận diện (0-1)
          <input type="number" min={0} max={1} step={0.01} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={liveness} onChange={(e) => setLiveness(e.target.checked)} /> Bật kiểm tra liveness
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={selfEnroll} onChange={(e) => setSelfEnroll(e.target.checked)} /> Cho phép self-enrollment
        </label>
        <div>
          <button onClick={save}>Lưu</button>
        </div>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        message={notification.message}
      />
    </div>
  )
}

export default FacesSettings
