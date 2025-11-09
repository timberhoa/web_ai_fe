import React from 'react'
import { useParams } from 'react-router-dom'
import styles from '../Teacher.module.scss'

const MyClassDetail: React.FC = () => {
  const { id } = useParams()
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Class Detail</h1>
      <p>Class ID: {id}</p>
      <p>Roster, face status, and manual grading.</p>
    </div>
  )
}

export default MyClassDetail

