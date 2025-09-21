import React, { useState } from 'react';
import styles from './Settings.module.scss';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    language: 'vi',
    theme: 'light',
    notifications: true,
    autoSave: true,
    cameraQuality: 'high',
    faceRecognitionThreshold: 0.8,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = () => {
    // Here you would typically save settings to localStorage or API
    localStorage.setItem('app-settings', JSON.stringify(settings));
    alert('Cài đặt đã được lưu thành công!');
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn reset về cài đặt mặc định?')) {
      setSettings({
        language: 'vi',
        theme: 'light',
        notifications: true,
        autoSave: true,
        cameraQuality: 'high',
        faceRecognitionThreshold: 0.8,
      });
    }
  };

  return (
    <div className={styles.settings}>
      <div className={styles.settingsHeader}>
        <h1 className={styles.title}>Cài đặt hệ thống</h1>
        <p className={styles.subtitle}>
          Quản lý cài đặt ứng dụng và tùy chỉnh giao diện
        </p>
      </div>

      <div className={styles.settingsContent}>
        <div className={styles.settingsGrid}>
          {/* General Settings */}
          <div className={styles.settingsCard}>
            <h3 className={styles.cardTitle}>Cài đặt chung</h3>
            <div className={styles.settingsList}>
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <label htmlFor="language" className={styles.settingLabel}>
                    Ngôn ngữ
                  </label>
                  <p className={styles.settingDescription}>
                    Chọn ngôn ngữ hiển thị cho ứng dụng
                  </p>
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
                  <p className={styles.settingDescription}>
                    Chọn chế độ sáng hoặc tối
                  </p>
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
                  <label htmlFor="notifications" className={styles.settingLabel}>
                    Thông báo
                  </label>
                  <p className={styles.settingDescription}>
                    Bật/tắt thông báo hệ thống
                  </p>
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

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <label htmlFor="autoSave" className={styles.settingLabel}>
                    Tự động lưu
                  </label>
                  <p className={styles.settingDescription}>
                    Tự động lưu dữ liệu khi có thay đổi
                  </p>
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

          {/* Camera Settings */}
          <div className={styles.settingsCard}>
            <h3 className={styles.cardTitle}>Cài đặt camera</h3>
            <div className={styles.settingsList}>
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <label htmlFor="cameraQuality" className={styles.settingLabel}>
                    Chất lượng camera
                  </label>
                  <p className={styles.settingDescription}>
                    Chọn chất lượng video cho nhận diện khuôn mặt
                  </p>
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
                  <label htmlFor="faceRecognitionThreshold" className={styles.settingLabel}>
                    Ngưỡng nhận diện
                  </label>
                  <p className={styles.settingDescription}>
                    Độ chính xác tối thiểu để nhận diện khuôn mặt ({Math.round(settings.faceRecognitionThreshold * 100)}%)
                  </p>
                </div>
                <input
                  type="range"
                  id="faceRecognitionThreshold"
                  name="faceRecognitionThreshold"
                  min="0.5"
                  max="1"
                  step="0.1"
                  value={settings.faceRecognitionThreshold}
                  onChange={handleInputChange}
                  className={styles.settingRange}
                />
              </div>
            </div>
          </div>

          {/* System Info */}
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
                <span className={`${styles.statusBadge} ${styles.statusBadgeActive}`}>
                  Hoạt động bình thường
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Dung lượng sử dụng:</span>
                <span className={styles.infoValue}>2.5 MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.settingsActions}>
          <button
            className={styles.resetButton}
            onClick={handleReset}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reset về mặc định
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
