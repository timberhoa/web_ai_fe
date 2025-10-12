import React from 'react'
import { useParams } from 'react-router-dom'

const AttendanceSession: React.FC = () => {
  const { sessionId } = useParams()
  return (
    <div>
      <h1>Attendance Session</h1>
      <p>Session ID: {sessionId}</p>
      <p>Bảng điểm danh, chỉnh sửa, ghi chú, lock.</p>
    </div>
  )
}

export default AttendanceSession

