import React from 'react'
import styles from '../Teacher.module.scss'

const Reports: React.FC = () => {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Reports (Teacher)</h1>
      <p>Xuất báo cáo theo lớp của tôi.</p>
    </div>
  )
}

export default Reports

