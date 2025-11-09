import React, { useEffect, useState } from 'react'
import StatsCard from '../../../components/StatsCard/StatsCard'
import styles from '../Dashboard.module.scss'
import { dashboardApi, type TeacherDashboardResponse } from '../../../services/dashboard'

const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<TeacherDashboardResponse | null>(null)

  useEffect(() => {
    let mounted = true
    dashboardApi
      .teacher()
      .then((res) => {
        if (mounted) setData(res)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const statsData = [
    {
      title: 'Môn học của tôi',
      value: data?.totalCourses ?? 0,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4ZM16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14ZM8 4C10.2 4 12 5.8 12 8C12 10.2 10.2 12 8 12C5.8 12 4 10.2 4 8C4 5.8 5.8 4 8 4ZM8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z" fill="currentColor"/>
        </svg>
      ),
      color: 'primary' as const,
    },
    {
      title: 'Buổi hôm nay',
      value: data?.sessionsToday ?? 0,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 11H17V13H7V11ZM7 7H17V9H7V7ZM5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3Z" fill="currentColor"/>
        </svg>
      ),
      color: 'info' as const,
    },
    {
      title: 'SV vắng (hôm nay)',
      value: data?.absentToday ?? 0,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM6 12H18V14H6V12ZM6 16H18V18H6V16Z" fill="currentColor"/>
        </svg>
      ),
      color: 'warning' as const,
    },
    {
      title: 'SV muộn (hôm nay)',
      value: data?.lateToday ?? 0,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V13L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: 'danger' as const,
    },
  ]

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Dashboard</h1>
        <p className={styles.dashboardSubtitle}>KPI giảng viên (TEACHER)</p>
      </div>

      <div className={styles.dashboardContent}>
        <div className={styles.statsGrid}>
          {statsData.map((stat, idx) => (
            <StatsCard key={idx} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
          ))}
        </div>

        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Điểm danh hôm nay</h3>
            </div>
            <div className={styles.chartPlaceholder}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 9L12 6L16 10L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Tổng lượt điểm danh: {data?.totalCheckinsToday ?? 0}</p>
              <span>Chi tiết xem tại mục Theo dõi/Review</span>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>SV vắng/muộn</h3>
            </div>
            <div className={styles.chartPlaceholder}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Vắng: {data?.absentToday ?? 0} • Muộn: {data?.lateToday ?? 0}</p>
              <span>Dữ liệu theo ngày hiện tại</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard

