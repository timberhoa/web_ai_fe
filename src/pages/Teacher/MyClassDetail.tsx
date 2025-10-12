import React from 'react'
import { useParams } from 'react-router-dom'

const MyClassDetail: React.FC = () => {
  const { id } = useParams()
  return (
    <div>
      <h1>My Class Detail</h1>
      <p>Class ID: {id}</p>
      <p>Roster, face status, and manual grading.</p>
    </div>
  )
}

export default MyClassDetail

