import React, { useState } from 'react';
import { useStudentsStore } from '../../store/useStudentsStore';
import CameraBox from '../../components/CameraBox/CameraBox';
import Modal from '../../components/Modal/Modal';
import styles from './Attendance.module.scss';

const Attendance: React.FC = () => {
  const { students, updateStudent } = useStudentsStore();
  const [isScanning, setIsScanning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScanStart = () => {
    setIsScanning(true);
  };

  const handleScanStop = () => {
    setIsScanning(false);
  };

  const handleScanSuccess = (result: any) => {
    setScanResult(result);
    
    // Update student status to attended
    const student = students.find(s => s.id === result.studentId);
    if (student) {
      updateStudent(result.studentId, { status: 'attended' });
    }
    
    // Show success modal
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setScanResult(null);
  };

  const handleManualAttendance = () => {
    // For demo purposes, we'll use the first student
    const firstStudent = students[0];
    if (firstStudent) {
      const mockResult = {
        studentId: firstStudent.id,
        studentName: firstStudent.name,
        studentClass: firstStudent.class,
        confidence: 1.0,
        timestamp: new Date().toISOString(),
      };
      
      handleScanSuccess(mockResult);
    }
  };

  return (
    <div className={styles.attendance}>
      <div className={styles.attendanceHeader}>
        <h1 className={styles.title}>Điểm danh bằng khuôn mặt</h1>
        <p className={styles.subtitle}>
          Sử dụng camera để nhận diện khuôn mặt và điểm danh tự động
        </p>
      </div>

      <div className={styles.attendanceContent}>
        <div className={styles.cameraSection}>
          <CameraBox
            isActive={true}
            onScanStart={handleScanStart}
            onScanStop={handleScanStop}
            onScanSuccess={handleScanSuccess}
          />
        </div>

        <div className={styles.instructionsSection}>
          <div className={styles.instructionsCard}>
            <h3 className={styles.instructionsTitle}>Hướng dẫn sử dụng</h3>
            <div className={styles.instructionsList}>
              <div className={styles.instructionItem}>
                <div className={styles.instructionNumber}>1</div>
                <div className={styles.instructionContent}>
                  <h4>Bấm "Quét khuôn mặt"</h4>
                  <p>Hệ thống sẽ kích hoạt camera và bắt đầu quét</p>
                </div>
              </div>
              <div className={styles.instructionItem}>
                <div className={styles.instructionNumber}>2</div>
                <div className={styles.instructionContent}>
                  <h4>Đặt khuôn mặt trong khung</h4>
                  <p>Đảm bảo khuôn mặt nằm trong khung màu xanh</p>
                </div>
              </div>
              <div className={styles.instructionItem}>
                <div className={styles.instructionNumber}>3</div>
                <div className={styles.instructionContent}>
                  <h4>Giữ nguyên vị trí</h4>
                  <p>Hệ thống sẽ tự động nhận diện và điểm danh</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.quickActionsCard}>
            <h3 className={styles.quickActionsTitle}>Thao tác nhanh</h3>
            <div className={styles.quickActionsList}>
              <button
                className={styles.quickActionButton}
                onClick={handleManualAttendance}
                disabled={isScanning}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4ZM16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14ZM8 4C10.2 4 12 5.8 12 8C12 10.2 10.2 12 8 12C5.8 12 4 10.2 4 8C4 5.8 5.8 4 8 4ZM8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Điểm danh thủ công
              </button>
              <button
                className={styles.quickActionButton}
                onClick={() => window.location.href = '/students'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Xem danh sách sinh viên
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Điểm danh thành công"
        size="md"
      >
        <div className={styles.successContent}>
          <div className={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className={styles.successInfo}>
            <h3 className={styles.successTitle}>Điểm danh thành công!</h3>
            {scanResult && (
              <div className={styles.studentInfo}>
                <p className={styles.studentName}>{scanResult.studentName}</p>
                <p className={styles.studentClass}>Lớp: {scanResult.studentClass}</p>
                <p className={styles.scanTime}>
                  Thời gian: {new Date(scanResult.timestamp).toLocaleString('vi-VN')}
                </p>
                <p className={styles.confidence}>
                  Độ chính xác: {(scanResult.confidence * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          <div className={styles.successActions}>
            <button
              className={styles.closeButton}
              onClick={handleCloseModal}
            >
              Đóng
            </button>
            <button
              className={styles.continueButton}
              onClick={handleCloseModal}
            >
              Tiếp tục điểm danh
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Attendance;
