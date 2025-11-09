import React from 'react'
import styles from '../Teacher.module.scss'

const AttendanceToday: React.FC = () => {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Attendance Today</h1>
      <p>Điểm danh nhanh cho ca học hôm nay.</p>
    </div>
  )
}

export default AttendanceToday

