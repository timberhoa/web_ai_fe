import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Topbar from '../components/Topbar/Topbar';
import styles from './MainLayout.module.scss';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/students':
        return 'Quản lý sinh viên';
      case '/attendance':
        return 'Điểm danh';
      case '/settings':
        return 'Cài đặt';
      default:
        return 'Student Admin';
    }
  };

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSearch = (query: string) => {
    // Handle search functionality
    console.log('Search query:', query);
  };

  return (
    <div className={styles.mainLayout}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />
      
      <div className={styles.mainContent}>
        <Topbar
          title={getPageTitle(location.pathname)}
          onMenuToggle={handleMenuToggle}
          onSearch={handleSearch}
          showSearch={location.pathname === '/students'}
          showMenuToggle={true}
        />
        
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
