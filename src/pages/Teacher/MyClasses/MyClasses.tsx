import React from 'react'
import styles from '../Teacher.module.scss'

const MyClasses: React.FC = () => {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Classes</h1>
      <p>Danh sách lớp và môn đang dạy.</p>
    </div>
  )
}

export default MyClasses

