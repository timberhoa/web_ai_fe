import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.scss';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5"/>
            <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="2"/>
            <path d="M60 60L140 140M140 60L60 140" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        
        <div className={styles.text}>
          <h1 className={styles.title}>404</h1>
          <h2 className={styles.subtitle}>Trang không tìm thấy</h2>
          <p className={styles.description}>
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>

        <div className={styles.actions}>
          <button onClick={handleGoBack} className={styles.buttonSecondary}>
            Quay lại
          </button>
          <button onClick={handleGoHome} className={styles.buttonPrimary}>
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
