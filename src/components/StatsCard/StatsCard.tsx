import React from 'react';
import styles from './StatsCard.module.scss';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  className = '',
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('vi-VN');
    }
    return val;
  };

  const formatTrend = (trendValue: number): string => {
    const sign = trendValue > 0 ? '+' : '';
    return `${sign}${trendValue.toFixed(1)}%`;
  };

  return (
    <div className={`${styles.statsCard} ${styles[`statsCard--${color}`]} ${className}`}>
      <div className={styles.statsCardContent}>
        <div className={styles.statsCardHeader}>
          <div className={styles.statsCardIcon}>
            {icon}
          </div>
          {trend && (
            <div className={`${styles.trend} ${trend.isPositive ? styles.trendPositive : styles.trendNegative}`}>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={styles.trendIcon}
              >
                {trend.isPositive ? (
                  <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                ) : (
                  <path d="M17 10L12 15L7 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                )}
              </svg>
              <span className={styles.trendValue}>
                {formatTrend(trend.value)}
              </span>
            </div>
          )}
        </div>
        
        <div className={styles.statsCardBody}>
          <div className={styles.statsCardValue}>
            {formatValue(value)}
          </div>
          <div className={styles.statsCardTitle}>
            {title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
