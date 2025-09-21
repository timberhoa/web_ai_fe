import React, { useState, useRef, useEffect } from 'react';
import styles from './CameraBox.module.scss';

interface CameraBoxProps {
  isActive?: boolean;
  onScanStart?: () => void;
  onScanStop?: () => void;
  onScanSuccess?: (result: any) => void;
  className?: string;
}

const CameraBox: React.FC<CameraBoxProps> = ({
  isActive = false,
  onScanStart,
  onScanStop,
  onScanSuccess,
  className = '',
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isActive && isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, isScanning]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleStartScan = () => {
    setIsScanning(true);
    onScanStart?.();
  };

  const handleStopScan = () => {
    setIsScanning(false);
    stopCamera();
    onScanStop?.();
  };

  const handleScanSuccess = () => {
    // Simulate successful face recognition
    const mockResult = {
      studentId: '1',
      studentName: 'Nguyễn Văn An',
      confidence: 0.95,
      timestamp: new Date().toISOString(),
    };
    
    onScanSuccess?.(mockResult);
    handleStopScan();
  };

  const handleSimulateScan = () => {
    // Simulate scanning process
    setTimeout(() => {
      handleScanSuccess();
    }, 2000);
  };

  return (
    <div className={`${styles.cameraBox} ${className}`}>
      <div className={styles.cameraContainer}>
        {isScanning ? (
          <div className={styles.cameraActive}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={styles.cameraVideo}
            />
            <div className={styles.cameraOverlay}>
              <div className={styles.scanFrame}>
                <div className={styles.scanFrameCorner}></div>
                <div className={styles.scanFrameCorner}></div>
                <div className={styles.scanFrameCorner}></div>
                <div className={styles.scanFrameCorner}></div>
              </div>
              <div className={styles.scanInstructions}>
                <p>Đặt khuôn mặt trong khung</p>
                <p>Giữ nguyên vị trí...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.cameraPlaceholder}>
            <div className={styles.placeholderIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className={styles.placeholderText}>
              Camera chưa được kích hoạt
            </p>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className={styles.cameraControls}>
        {!isScanning ? (
          <button
            className={styles.scanButton}
            onClick={handleStartScan}
            disabled={!isActive}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Quét khuôn mặt
          </button>
        ) : (
          <div className={styles.scanningControls}>
            <button
              className={styles.stopButton}
              onClick={handleStopScan}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dừng quét
            </button>
            <button
              className={styles.simulateButton}
              onClick={handleSimulateScan}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Mô phỏng thành công
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraBox;
