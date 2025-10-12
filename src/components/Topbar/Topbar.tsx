import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import type { Role } from '../../services/auth';
import styles from './Topbar.module.scss';

interface TopbarProps {
  title: string;
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
  showMenuToggle?: boolean;
}

const Topbar: React.FC<TopbarProps> = ({
  title,
  onMenuToggle,
  onSearch,
  showSearch = true,
  showMenuToggle = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setRole = useAuthStore((s) => s.setRole);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarContent}>
        {/* Left side */}
        <div className={styles.topbarLeft}>
          {showMenuToggle && (
            <button
              className={styles.menuToggle}
              onClick={onMenuToggle}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          
          {/* <h1 className={styles.title}>{title}</h1> */}
        </div>

        {/* Right side */}
        <div className={styles.topbarRight}>
          {/* Search */}
          {showSearch && (
            <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
              <div className={styles.searchInputWrapper}>
                <svg 
                  className={styles.searchIcon} 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      onSearch?.('');
                    }}
                    className={styles.searchClear}
                    aria-label="Clear search"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* User menu */}
          <div className={styles.userMenu}>
            <div className={styles.userPanel}>
              <div className={styles.userButton} aria-label="User menu">
                <div className={styles.userAvatar}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className={styles.userName}>{user?.name || user?.email || 'User'}</span>
              </div>
              <div className={styles.userControls}>
                {/* <select
                  className={styles.userSelect}
                  value={(user?.role || 'ADMIN') as Role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  aria-label="Select role"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="TEACHER">TEACHER</option>
                  <option value="STUDENT">STUDENT</option>
                </select> */}
                <button className={styles.logoutButton} onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
