import React, { useMemo, useState } from 'react'
import styles from './Settings.module.scss'

type SettingsState = {
  language: 'vi' | 'en'
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean
  autoSave: boolean
  cameraQuality: 'low' | 'medium' | 'high'
  faceRecognitionThreshold: number
}

const defaultSettings: SettingsState = {
  language: 'vi',
  theme: 'light',
  notifications: true,
  autoSave: true,
  cameraQuality: 'high',
  faceRecognitionThreshold: 0.8,
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

  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'camera' | 'system'>('general')

  const tabs = useMemo(
    () => [
      { key: 'general', label: 'Chung' },
      { key: 'notifications', label: 'Thông báo' },
      { key: 'camera', label: 'Camera & Nhận diện' },
      { key: 'system', label: 'Hệ thống' },
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
    alert('Cài đặt đã được lưu thành công!')
  }

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại về mặc định?')) {
      setSettings(defaultSettings)
    }
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
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className={styles.content}>
          <div className={styles.settingsGrid}>
            {/* General */}
            {activeTab === 'general' && (
              <div className={styles.settingsCard}>
                <h3 className={styles.cardTitle}>Cài đặt chung</h3>
                <div className={styles.settingsList}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="language" className={styles.settingLabel}>
                        Ngôn ngữ
                      </label>
                      <p className={styles.settingDescription}>Chọn ngôn ngữ hiển thị cho ứng dụng</p>
                    </div>
                    <select
                      id="language"
                      name="language"
                      value={settings.language}
                      onChange={handleInputChange}
                      className={styles.settingSelect}
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <label htmlFor="theme" className={styles.settingLabel}>
                        Giao diện
                      </label>
                      <p className={styles.settingDescription}>Chọn chế độ sáng/tối hoặc tự động</p>
                    </div>
                    <select
                      id="theme"
                      name="theme"
                      value={settings.theme}
                      onChange={handleInputChange}
                      className={styles.settingSelect}
                    >
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
                      <input
                        type="checkbox"
                        id="autoSave"
                        name="autoSave"
                        checked={settings.autoSave}
                        onChange={handleInputChange}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
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
    </div>
  )
}

export default Settings

