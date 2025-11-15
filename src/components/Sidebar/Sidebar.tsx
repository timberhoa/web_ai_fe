import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.scss';

type MenuItem = {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  items?: MenuItem[];
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT' | null;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'students',
    label: 'Sinh viên',
    path: '/students',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M16 4C18.2 4 20 5.8 20 8C20 10.2 18.2 12 16 12C13.8 12 12 10.2 12 8C12 5.8 13.8 4 16 4ZM16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14ZM8 4C10.2 4 12 5.8 12 8C12 10.2 10.2 12 8 12C5.8 12 4 10.2 4 8C4 5.8 5.8 4 8 4ZM8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'attendance',
    label: 'Điểm danh',
    path: '/attendance',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V7.5C15 8.3 14.3 9 13.5 9H10.5C9.7 9 9 8.3 9 7.5V6.5L3 7V9L9 8.5V9.5C9 10.3 9.7 11 10.5 11H13.5C14.3 11 15 10.3 15 9.5V8.5L21 9ZM6 12H8V20H6V12ZM10 12H12V20H10V12ZM14 12H16V20H14V12Z" fill="currentColor"/>
      </svg>
    ),
  },
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
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, items, role }) => {
  const panelRef = useRef<HTMLElement>(null);
  const navItems = items ?? menuItems;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose && onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const firstLink = panelRef.current?.querySelector('a') as HTMLAnchorElement | null;
    firstLink?.focus();
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className={styles.overlay}
        aria-label="Đóng menu"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        data-open={isOpen}
      />
      <aside
        ref={panelRef}
        className={styles.sidebar}
        data-open={isOpen}
        aria-hidden={!isOpen && window.matchMedia && window.matchMedia('(max-width: 768px)').matches}
      >
        <div className={styles.sidebarContent}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                {/* Gradient Background Circle */}
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="20" fill="url(#logoGradient)"/>
                {/* Face Recognition Icon */}
                <circle cx="20" cy="15" r="4" fill="white" opacity="0.9"/>
                <path d="M13 25C13 21 16 19 20 19C24 19 27 21 27 25" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                {/* Check Mark for Attendance */}
                <circle cx="28" cy="12" r="6" fill="#10B981"/>
                <path d="M26 12L28 14L31 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.logoContent}>
              <span className={styles.logoText}>{role === 'STUDENT' ? 'Hệ thống điểm danh' : 'STUDENT ADMIN'}</span>
              <span className={styles.logoTagline}>Smart Attendance</span>
            </div>
          </div>

          <nav className={styles.nav} aria-label="Điều hướng chính">
            <ul className={styles.navList}>
              {navItems.map(item => (
                <li key={item.id} className={styles.navItem}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
                    }
                    onClick={onClose}
                    end={item.path === '/'}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navLabel}>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
