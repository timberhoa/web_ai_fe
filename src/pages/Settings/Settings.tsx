import React, { useMemo, useState } from 'react'
import styles from './Settings.module.scss'
import NotificationModal from '../../components/NotificationModal/NotificationModal'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'

type SettingsState = {
  // General
  language: 'vi' | 'en'
  theme: 'light' | 'dark' | 'auto'
  autoSave: boolean
  autoRefresh: boolean
  refreshInterval: number
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'
  timeFormat: '12h' | '24h'
  timezone: string

  // Notifications
  notifications: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  attendanceAlerts: boolean
  sessionReminders: boolean
  lowAttendanceAlerts: boolean
  alertThreshold: number

  // Camera & Face Recognition
  cameraQuality: 'low' | 'medium' | 'high'
  faceRecognitionThreshold: number
  faceDetectionSpeed: 'fast' | 'balanced' | 'accurate'
  enableFaceCaching: boolean
  faceCacheSize: number
  cameraFlip: boolean
  cameraMirror: boolean

  // Security & Privacy
  twoFactorAuth: boolean
  sessionTimeout: number
  passwordExpiry: number
  loginAttempts: number
  dataEncryption: boolean
  biometricAuth: boolean
  autoLogout: boolean
  logoutTimeout: number

  // Display & UI
  compactMode: boolean
  showAvatars: boolean
  showTooltips: boolean
  showAnimations: boolean
  fontSize: 'small' | 'medium' | 'large'
  sidebarCollapsed: boolean
  dashboardLayout: 'grid' | 'list'

  // Data Management
  dataRetentionDays: number
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  backupLocation: 'local' | 'cloud'
  exportFormat: 'xlsx' | 'csv' | 'pdf'
  clearCache: boolean

  // Attendance
  attendanceGracePeriod: number
  lateThreshold: number
  excusedMaxDays: number
  requirePhoto: boolean
  requireLocation: boolean
  attendanceLocationAccuracy: number
  geofenceEnabled: boolean
  geofenceRadius: number

  // Performance
  enableCaching: boolean
  cacheSize: number
  lazyLoading: boolean
  imageOptimization: boolean
  requestTimeout: number

  // Location
  locationTracking: boolean
  locationHistory: boolean
  locationAccuracy: 'low' | 'medium' | 'high'
  backgroundLocation: boolean
}

const defaultSettings: SettingsState = {
  language: 'vi',
  theme: 'light',
  autoSave: true,
  autoRefresh: true,
  refreshInterval: 30,
  dateFormat: 'dd/mm/yyyy',
  timeFormat: '24h',
  timezone: 'Asia/Ho_Chi_Minh',

  notifications: true,
  emailNotifications: true,
  pushNotifications: true,
  attendanceAlerts: true,
  sessionReminders: true,
  lowAttendanceAlerts: true,
  alertThreshold: 70,

  cameraQuality: 'high',
  faceRecognitionThreshold: 0.8,
  faceDetectionSpeed: 'balanced',
  enableFaceCaching: true,
  faceCacheSize: 100,
  cameraFlip: false,
  cameraMirror: false,

  twoFactorAuth: false,
  sessionTimeout: 30,
  passwordExpiry: 90,
  loginAttempts: 5,
  dataEncryption: true,
  biometricAuth: false,
  autoLogout: true,
  logoutTimeout: 15,

  compactMode: false,
  showAvatars: true,
  showTooltips: true,
  showAnimations: true,
  fontSize: 'medium',
  sidebarCollapsed: false,
  dashboardLayout: 'grid',

  dataRetentionDays: 365,
  autoBackup: true,
  backupFrequency: 'weekly',
  backupLocation: 'cloud',
  exportFormat: 'xlsx',
  clearCache: false,

  attendanceGracePeriod: 15,
  lateThreshold: 10,
  excusedMaxDays: 5,
  requirePhoto: true,
  requireLocation: true,
  attendanceLocationAccuracy: 50,
  geofenceEnabled: true,
  geofenceRadius: 100,

  enableCaching: true,
  cacheSize: 500,
  lazyLoading: true,
  imageOptimization: true,
  requestTimeout: 30,

  locationTracking: true,
  locationHistory: false,
  locationAccuracy: 'high',
  backgroundLocation: false,
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem('app-settings')
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings
    } catch {
      return defaultSettings
    }
  })

  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'camera' | 'security' | 'display' | 'data' | 'attendance' | 'performance' | 'location' | 'system'>('general')
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning'; message: string }>({ isOpen: false, type: 'success', message: '' })
  const [confirm, setConfirm] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({ isOpen: false, message: '', onConfirm: () => { } })

  const tabs = useMemo(
    () => [
      { key: 'general', label: 'Chung', icon: '⚙️' },
      { key: 'notifications', label: 'Thông báo', icon: '🔔' },
      { key: 'camera', label: 'Camera & Nhận diện', icon: '📷' },
      { key: 'security', label: 'Bảo mật', icon: '🔒' },
      { key: 'display', label: 'Hiển thị', icon: '🎨' },
      { key: 'data', label: 'Dữ liệu', icon: '💾' },
      { key: 'attendance', label: 'Điểm danh', icon: '✅' },
      { key: 'performance', label: 'Hiệu năng', icon: '⚡' },
      { key: 'location', label: 'Vị trí', icon: '📍' },
      { key: 'system', label: 'Hệ thống', icon: '🖥️' },
    ] as const,
    []
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'range' ? Number(value) : value,
    }))
  }

  const handleSave = () => {
    localStorage.setItem('app-settings', JSON.stringify(settings))
    setNotification({ isOpen: true, type: 'success', message: 'Cài đặt đã được lưu thành công!' })
  }

  const handleReset = () => {
    setConfirm({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn đặt lại về mặc định?',
      onConfirm: () => setSettings(defaultSettings)
    })
  }

  return (
    <div className={styles.settings}>
      <div className={styles.settingsHeader}>
        <h1 className={styles.title}>Cài đặt hệ thống</h1>
        <p className={styles.subtitle}>Quản lý cài đặt ứng dụng và tuỳ chỉnh giao diện</p>
      </div>

      <div className={styles.settingsLayout}>
        <aside className={styles.sidebar}>
          <nav className={styles.tabList} aria-label="Cài đặt">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`${styles.tabItem} ${activeTab === t.key ? styles.tabItemActive : ''}`}
                onClick={() => setActiveTab(t.key as any)}
              >
                <span className={styles.tabIcon}>{t.icon}</span>
                <span className={styles.tabLabel}>{t.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className={styles.content}>
          <div className={styles.settingsGrid}>
            {/* General */}
            {activeTab === 'general' && (
              <div className={styles.settingsCard}>
                <h3 className={styles.cardTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01131 9.77251C4.28062 9.5799 4.48571 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Cài đặt chung
                </h3>
                <div className={styles.settingsList}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="language" className={styles.settingLabel}>Ngôn ngữ</label>
                      <p className={styles.settingDescription}>Chọn ngôn ngữ hiển thị cho ứng dụng</p>
                    </div>
                    <select id="language" name="language" value={settings.language} onChange={handleInputChange} className={styles.settingSelect}>
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="theme" className={styles.settingLabel}>Giao diện</label>
                      <p className={styles.settingDescription}>Chọn chế độ sáng/tối hoặc tự động</p>
                    </div>
                    <select id="theme" name="theme" value={settings.theme} onChange={handleInputChange} className={styles.settingSelect}>
                      <option value="light">Sáng</option>
                      <option value="dark">Tối</option>
                      <option value="auto">Tự động</option>
                    </select>
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="autoSave" className={styles.settingLabel}>Tự động lưu</label>
                      <p className={styles.settingDescription}>Tự động lưu dữ liệu khi có thay đổi</p>
                    </div>
                    <label className={styles.toggleSwitch}>
                      <input type="checkbox" id="autoSave" name="autoSave" checked={settings.autoSave} onChange={handleInputChange} />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="autoRefresh" className={styles.settingLabel}>Tự động làm mới</label>
                      <p className={styles.settingDescription}>Tự động làm mới dữ liệu theo khoảng thời gian</p>
                    </div>
                    <label className={styles.toggleSwitch}>
                      <input type="checkbox" id="autoRefresh" name="autoRefresh" checked={settings.autoRefresh} onChange={handleInputChange} />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="refreshInterval" className={styles.settingLabel}>Khoảng thời gian làm mới (giây)</label>
                      <p className={styles.settingDescription}>Thời gian tự động làm mới dữ liệu</p>
                    </div>
                    <input type="number" id="refreshInterval" name="refreshInterval" value={settings.refreshInterval} onChange={handleInputChange} min={5} max={300} className={styles.settingInput} />
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="dateFormat" className={styles.settingLabel}>Định dạng ngày</label>
                      <p className={styles.settingDescription}>Cách hiển thị ngày tháng</p>
                    </div>
                    <select id="dateFormat" name="dateFormat" value={settings.dateFormat} onChange={handleInputChange} className={styles.settingSelect}>
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="timeFormat" className={styles.settingLabel}>Định dạng giờ</label>
                      <p className={styles.settingDescription}>Cách hiển thị thời gian</p>
                    </div>
                    <select id="timeFormat" name="timeFormat" value={settings.timeFormat} onChange={handleInputChange} className={styles.settingSelect}>
                      <option value="12h">12 giờ (AM/PM)</option>
                      <option value="24h">24 giờ</option>
                    </select>
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="timezone" className={styles.settingLabel}>Múi giờ</label>
                      <p className={styles.settingDescription}>Múi giờ hiện tại</p>
                    </div>
                    <select id="timezone" name="timezone" value={settings.timezone} onChange={handleInputChange} className={styles.settingSelect}>
                      <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className={styles.settingsCard}>
                <h3 className={styles.cardTitle}>Thông báo</h3>
                <div className={styles.settingsList}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="notifications" className={styles.settingLabel}>Thông báo hệ thống</label>
                      <p className={styles.settingDescription}>Bật/tắt thông báo quan trọng</p>
                    </div>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        id="notifications"
                        name="notifications"
                        checked={settings.notifications}
                        onChange={handleInputChange}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Camera & Face Recognition */}
            {activeTab === 'camera' && (
              <div className={styles.settingsCard}>
                <h3 className={styles.cardTitle}>Cài đặt camera & nhận diện</h3>
                <div className={styles.settingsList}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="cameraQuality" className={styles.settingLabel}>Chất lượng camera</label>
                      <p className={styles.settingDescription}>Chọn chất lượng video cho nhận diện khuôn mặt</p>
                    </div>
                    <select
                      id="cameraQuality"
                      name="cameraQuality"
                      value={settings.cameraQuality}
                      onChange={handleInputChange}
                      className={styles.settingSelect}
                    >
                      <option value="low">Thấp (480p)</option>
                      <option value="medium">Trung bình (720p)</option>
                      <option value="high">Cao (1080p)</option>
                    </select>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="faceRecognitionThreshold" className={styles.settingLabel}>Ngưỡng nhận diện</label>
                      <p className={styles.settingDescription}>
                        Độ chính xác tối thiểu để nhận diện ({Math.round(settings.faceRecognitionThreshold * 100)}%)
                      </p>
                    </div>
                    <input
                      type="range"
                      id="faceRecognitionThreshold"
                      name="faceRecognitionThreshold"
                      min={0.5}
                      max={1}
                      step={0.1}
                      value={settings.faceRecognitionThreshold}
                      onChange={handleInputChange}
                      className={styles.settingRange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* System Info */}
            {activeTab === 'system' && (
              <div className={styles.settingsCard}>
                <h3 className={styles.cardTitle}>Thông tin hệ thống</h3>
                <div className={styles.systemInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Phiên bản:</span>
                    <span className={styles.infoValue}>1.0.0</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ngày cập nhật:</span>
                    <span className={styles.infoValue}>21/01/2024</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Trạng thái:</span>
                    <span className={`${styles.statusBadge} ${styles.statusBadgeActive}`}>Hoạt động bình thường</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Dung lượng sử dụng:</span>
                    <span className={styles.infoValue}>2.5 MB</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.settingsActions}>
            <button className={styles.resetButton} onClick={handleReset}>
              Reset về mặc định
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              Lưu cài đặt
            </button>
          </div>
        </section>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        message={notification.message}
      />

      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={() => setConfirm({ ...confirm, isOpen: false })}
        onConfirm={confirm.onConfirm}
        title="Xác nhận"
        message={confirm.message}
        isDanger={false}
      />
    </div>
  )
}

export default Settings

