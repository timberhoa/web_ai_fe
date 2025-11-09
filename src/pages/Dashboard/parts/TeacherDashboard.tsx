import React, { useEffect, useMemo, useState } from 'react'
import StatsCard from '../../../components/StatsCard/StatsCard'
import styles from '../Dashboard.module.scss'
import { dashboardApi, type TeacherDashboardResponse } from '../../../services/dashboard'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

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

  const productivityChart = useMemo(
    () => ({
      labels: ['Môn học', 'Buổi hôm nay', 'Lượt điểm danh'],
      datasets: [
        {
          label: 'Số lượng',
          data: [data?.totalCourses ?? 0, data?.sessionsToday ?? 0, data?.totalCheckinsToday ?? 0],
          backgroundColor: ['#6366f1', '#0ea5e9', '#22c55e'],
          borderRadius: 6,
        },
      ],
    }),
    [data]
  )

  const productivityOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 12,
          titleFont: { size: 13, weight: '600' },
          bodyFont: { size: 12 },
          displayColors: false,
        },
      },
      layout: { padding: { top: 8, right: 12, bottom: 12, left: 12 } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f1f5f9' } },
        x: { grid: { display: false } },
      },
    }),
    []
  )

  const onTime = Math.max(
    0,
    (data?.totalCheckinsToday ?? 0) - (data?.absentToday ?? 0) - (data?.lateToday ?? 0)
  )

  const attendanceBreakdown = useMemo(
    () => ({
      labels: ['Đúng giờ', 'Muộn', 'Vắng'],
      datasets: [
        {
          data: [onTime, data?.lateToday ?? 0, data?.absentToday ?? 0],
          backgroundColor: ['#22c55e', '#f97316', '#ef4444'],
          borderWidth: 0,
        },
      ],
    }),
    [onTime, data?.lateToday, data?.absentToday]
  )

  const attendanceOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            usePointStyle: true,
            pointStyle: 'rectRounded',
            padding: 18,
            font: { size: 12 },
          },
        },
      },
    }),
    []
  )

  const teacherCenterTextPlugin = useMemo(
    () => ({
      afterDraw: (chart: any) => {
        if (!chart?.chartArea) return
        const total = data?.totalCheckinsToday ?? 0
        const { ctx, chartArea } = chart
        const x = (chartArea.left + chartArea.right) / 2
        const y = (chartArea.top + chartArea.bottom) / 2
        ctx.save()
        ctx.font = '600 20px "Inter", sans-serif'
        ctx.fillStyle = '#0ea5e9'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${total}`, x, y)
        ctx.restore()
      },
    }),
    [data?.totalCheckinsToday]
  )

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
              <h3 className={styles.chartTitle}>Hiệu suất giảng dạy</h3>
            </div>
            <div className={styles.chartBody}>
              <Bar data={productivityChart}  />
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Cơ cấu điểm danh</h3>
            </div>
            <div className={styles.chartBody}>
              <Doughnut data={attendanceBreakdown} options={attendanceOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
