import React from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import AdminDashboard from './parts/AdminDashboard'
import TeacherDashboard from './parts/TeacherDashboard'
import StudentDashboard from './parts/StudentDashboard'

const Dashboard: React.FC = () => {
  const role = useAuthStore((s) => s.user?.role)

  if (role === 'TEACHER') return <TeacherDashboard />
  if (role === 'STUDENT') return <StudentDashboard />
  // Mặc định: ADMIN
  return <AdminDashboard />
}

export default Dashboard

