import React, { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import Topbar from '../components/Topbar/Topbar'
import styles from './MainLayout.module.scss'
import { useAuthStore } from '../store/useAuthStore'
import type { Role } from '../services/auth'
import { userApi } from '../services/user'

const MainLayout: React.FC = () => {
  const setUser = useAuthStore((s) => s.setUser)
  const token = useAuthStore((s) => s.token)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      // On mobile, start closed; on desktop, start open
      return !window.matchMedia('(max-width: 768px)').matches
    }
    return true
  })
  const location = useLocation()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  const pageTitle = useMemo(() => {
    const path = location.pathname
    if (path === '/') return 'Dashboard'
    if (path.startsWith('/users')) return 'Quản lý tài khoản'
    if (path.startsWith('/lecturers')) return 'Giảng viên'
    // if (path.startsWith('/classes')) return 'Lớp học'
    if (path.startsWith('/courses')) return 'Môn học'
    if (path.startsWith('/schedule')) return 'Lịch học'
    // if (path.startsWith('/attendance/monitor')) return 'Giám sát điểm danh'
    // if (path.startsWith('/attendance/review')) return 'Rà soát điểm danh'
    if (path.startsWith('/faces')) return 'Cài đặt FR'
    if (path.startsWith('/audit-logs')) return 'Nhật ký hoạt động'
    if (path.startsWith('/students')) return 'Quản lý sinh viên'
    if (path.startsWith('/attendance-today')) return 'Điểm danh hôm nay'
    if (path.startsWith('/attendance')) return 'Điểm danh'
    if (path.startsWith('/settings')) return 'Cài đặt hệ thống'
    if (path.startsWith('/my-classes')) return 'Lớp học của tôi'
    if (path.startsWith('/sessions')) return 'Buổi học'
    if (path.startsWith('/session/')) return 'Chi tiet buoi hoc'
    if (path.startsWith('/reports')) return 'Báo cáo'
    if (path.startsWith('/face-enrollment')) return 'Đăng ký khuôn mặt'
    if (path.startsWith('/my-schedule')) return 'Thời khóa biểu'
    if (path.startsWith('/my-attendance')) return 'Điểm danh'
    if (path.startsWith('/my-profile')) return 'Hồ sơ cá nhân'
    return 'Quản trị viên'
  }, [location.pathname])

  const handleMenuToggle = () => setSidebarOpen((v) => !v)
  const handleSidebarClose = () => setSidebarOpen(false)

  const handleSearch = (query: string) => {
    console.debug('Search query:', query)
  }

  const role = useAuthStore((s) => s.user?.role as Role | undefined)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await userApi.getProfile()
        setUser(profile)
      } catch (e) {
        // ignore; handled globally in http interceptor
      }
    }
    if (token) fetchData()
  }, [token, setUser])

  const menuItems = useMemo((): { id: string; label: string; path: string; icon: React.ReactNode }[] => {
    const dashboard = {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
        </svg>
      ),
    }

    if (role === 'TEACHER') {
      return [
        dashboard,
        // {
        //   id: 'my-classes',
        //   label: 'Lớp học',
        //   path: '/my-classes',
        //   icon: (
        //     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        //       <path d="M16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4ZM16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14ZM8 4C10.2 4 12 5.8 12 8C12 10.2 10.2 12 8 12C5.8 12 4 10.2 4 8C4 5.8 5.8 4 8 4ZM8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z" fill="currentColor"/>
        //     </svg>
        //   ),
        // },
        {
          id: 'sessions',
          label: 'Lịch theo buổi dạy',
          path: '/sessions',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 11H17V13H7V11ZM7 7H17V9H7V7ZM5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3ZM5 5V19H19V5H5Z" fill="currentColor"/>
            </svg>
          ),
        },
        // {
        //   id: 'attendance',
        //   label: 'Điểm danh',
        //   path: '/attendance',
        //   icon: (
        //     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        //       <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V7.5C15 8.3 14.3 9 13.5 9H10.5C9.7 9 9 8.3 9 7.5V6.5L3 7V9L9 8.5V9.5C9 10.3 9.7 11 10.5 11H13.5C14.3 11 15 10.3 15 9.5V8.5L21 9ZM6 12H8V20H6V12ZM10 12H12V20H10V12ZM14 12H16V20H14V12Z" fill="currentColor"/>
        //     </svg>
        //   ),
        // },
        {
          id: 'attendance-today',
          label: 'Điểm danh hôm nay',
          path: '/attendance-today',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 11H17V13H7V11ZM7 7H17V9H7V7ZM5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3Z" fill="currentColor"/>
            </svg>
          ),
        },
        {
          id: 'reports',
          label: 'Báo cáo',
          path: '/reports',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 3H21V5H3V3ZM3 7H13V13H3V7ZM3 15H21V21H3V15ZM15 7H21V13H15V7Z" fill="currentColor"/>
            </svg>
          ),
        },
        {
          id: 'face-enrollment',
          label: 'Đăng ký khuôn mặt',
          path: '/face-enrollment',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 5V3H9V5H5V9H3V5ZM15 3H21V5H19V9H17V5H15V3ZM19 15H21V21H15V19H19V15ZM5 19H9V21H3V15H5V19Z" fill="currentColor"/>
            </svg>
          ),
        },
      ]
    }

    if (role === 'STUDENT') {
      return [
        dashboard,
        {
          id: 'my-schedule',
          label: 'Thời khóa biểu',
          path: '/my-schedule',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 11H17V13H7V11ZM7 7H17V9H7V7ZM5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3Z" fill="currentColor"/>
            </svg>
          ),
        },
        {
          id: 'my-attendance',
          label: 'Điểm danh của tôi',
          path: '/my-attendance',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V7.5C15 8.3 14.3 9 13.5 9H10.5C9.7 9 9 8.3 9 7.5V6.5L3 7V9L9 8.5V9.5C9 10.3 9.7 11 10.5 11H13.5C14.3 11 15 10.3 15 9.5V8.5L21 9ZM6 12H8V20H6V12ZM10 12H12V20H10V12ZM14 12H16V20H14V12Z" fill="currentColor"/>
            </svg>
          ),
        },
        {
          id: 'my-profile',
          label: 'Hồ sơ cá nhân',
          path: '/my-profile',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" fill="currentColor"/>
            </svg>
          ),
        },
        {
          id: 'face-enrollment',
          label: 'Đăng ký khuôn mặt',
          path: '/face-enrollment',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 5V3H9V5H5V9H3V5ZM15 3H21V5H19V9H17V5H15V3ZM19 15H21V21H15V19H19V15ZM5 19H9V21H3V15H5V19Z" fill="currentColor"/>
            </svg>
          ),
        },
      ]
    }

    // ADMIN default
    return [
      dashboard,
      { id: 'users', label: 'Tài khoản', path: '/users', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" fill="currentColor"/><path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20V21H4V20Z" fill="currentColor"/></svg>
      ) },
      { id: 'lecturers', label: 'Giảng viên', path: '/lecturers', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" fill="currentColor"/><path d="M4 21C4 16.5817 7.58172 13 12 13C16.4183 13 20 16.5817 20 21H4Z" fill="currentColor"/></svg>
      ) },{
        id: 'students',
        label: 'Sinh viên',
        path: '/students',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4ZM16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14ZM8 4C10.2 4 12 5.8 12 8C12 10.2 10.2 12 8 12C5.8 12 4 10.2 4 8C4 5.8 5.8 4 8 4ZM8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z" fill="currentColor"/>
          </svg>
        ),
      },
      { id: 'courses', label: 'Môn học', path: '/courses', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6H20V18H4V6Z" fill="currentColor"/><path d="M8 10H16V14H8V10Z" fill="white"/></svg>
      ) },
      { id: 'schedule', label: 'Sắp xếp lịch học', path: '/schedule', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 11H17V13H7V11ZM7 7H17V9H7V7ZM5 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3Z" fill="currentColor"/></svg>
      ) },
      // { id: 'attendance-review', label: 'Rà soát điểm danh', path: '/attendance/review', icon: (
      //   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3H21V21H3V3Z" fill="currentColor"/><path d="M7 13H17V15H7V13ZM7 9H17V11H7V9Z" fill="white"/></svg>
      // ) },
      // { id: 'faces', label: 'Cài đặt FR', path: '/faces', icon: (
      //   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 5V3H9V5H5V9H3V5ZM15 3H21V5H19V9H17V5H15V3ZM19 15H21V21H15V19H19V15ZM5 19H9V21H3V15H5V19Z" fill="currentColor"/></svg>
      // ) },
      { id: 'reports', label: 'Báo cáo', path: '/reports', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/></svg>
      ) },
      { id: 'audit-logs', label: 'Audit logs', path: '/audit-logs', icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 3H19V21H5V3Z" fill="currentColor"/><path d="M8 7H16V9H8V7ZM8 11H16V13H8V11ZM8 15H13V17H8V15Z" fill="white"/></svg>
      ) },
     
      // {
      //   id: 'attendance',
      //   label: 'Điểm danh',
      //   path: '/attendance',
      //   icon: (
      //     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      //       <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V7.5C15 8.3 14.3 9 13.5 9H10.5C9.7 9 9 8.3 9 7.5V6.5L3 7V9L9 8.5V9.5C9 10.3 9.7 11 10.5 11H13.5C14.3 11 15 10.3 15 9.5V8.5L21 9ZM6 12H8V20H6V12ZM10 12H12V20H10V12ZM14 12H16V20H14V12Z" fill="currentColor"/>
      //     </svg>
      //   ),
      // },
      {
        id: 'settings',
        label: 'Cài đặt',
        path: '/settings',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5A3.5 3.5 0 0 1 15.5 12A3.5 3.5 0 0 1 12 15.5M19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.22 8.95 2.27 9.22 2.46 9.37L4.57 11C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.5 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" fill="currentColor"/>
          </svg>
        ),
      },
    ]
  }, [role])



  return (
    <div className={styles.mainLayout}>
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} items={menuItems} role={role} />
      <div className={styles.shell}>
        <Topbar
          title={pageTitle}
          onMenuToggle={handleMenuToggle}
          onSearch={handleSearch}
          showSearch={location.pathname.startsWith('/students')}
          showMenuToggle
        />

        <div className={styles.container}>
          {/* <header className={styles.breadcrumbs} aria-label="breadcrumbs">
            <span className={styles.crumbHome}>Trang chủ</span>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCurrent}>{pageTitle}</span>
          </header> */}

          <main className={styles.page}>
            <Outlet />
          </main>

          <footer className={styles.footer}>
            <span>© {new Date().getFullYear()} {role === 'STUDENT' ? 'Hệ thống điểm danh' : 'STUDENT ADMIN'}</span>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
