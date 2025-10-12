import React, { useState, useMemo } from 'react';
import styles from './DataTable.module.scss';

export interface Column<T> {
  key?: string;
  dataIndex?: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (record: T) => void;
  className?: string;
  pagination?: {
    pageSize: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
  };
}

type SortDirection = 'asc' | 'desc' | null;

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyText = 'Không có dữ liệu',
  onRowClick,
  className = '',
  pagination,
}: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: SortDirection;
  }>({ key: null, direction: null });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) {
      return sortedData;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') {
          return { key, direction: 'desc' } as typeof prev;
        } else if (prev.direction === 'desc') {
          return { key: null, direction: null } as typeof prev;
        }
      }
      return { key, direction: 'asc' } as typeof prev;
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 9L12 5L16 9M8 15L12 19L16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }

    if (sortConfig.direction === 'asc') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5L16 9L8 9L12 5Z" fill="currentColor"/>
        </svg>
      );
    }

    if (sortConfig.direction === 'desc') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19L8 15L16 15L12 19Z" fill="currentColor"/>
        </svg>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className={`${styles.dataTable} ${className}`}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.dataTable} ${className}`}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key || String(column.dataIndex)}
                  className={`${styles.tableHeader} ${column.sortable ? styles.tableHeaderSortable : ''}`}
                  style={{
                    width: column.width,
                    textAlign: column.align || 'left',
                  }}
                  onClick={() => column.sortable && column.dataIndex && handleSort(column.dataIndex as keyof T)}
                >
                  <div className={styles.tableHeaderContent}>
                    <span className={styles.tableHeaderTitle}>{column.title}</span>
                    {column.sortable && column.dataIndex && (
                      <span className={styles.tableHeaderSort}>
                        {getSortIcon(column.dataIndex as keyof T)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{emptyText}</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((record, index) => (
                <tr
                  key={index}
                  className={`${styles.tableRow} ${onRowClick ? styles.tableRowClickable : ''}`}
                  onClick={() => onRowClick?.(record)}
                >
                  {columns.map((column) => {
                    const value = column.dataIndex ? (record as any)[column.dataIndex] : undefined;
                    const cell = column.render ? column.render(value, record, index) : value;
                    return (
                      <td
                        key={column.key || String(column.dataIndex)}
                        className={styles.tableCell}
                        style={{ textAlign: column.align || 'left' }}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            <span>
              Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, sortedData.length)} trong {sortedData.length} kết quả
            </span>
          </div>
          
          <div className={styles.paginationControls}>
            <button
              className={`${styles.paginationButton} ${currentPage === 1 ? styles.paginationButtonDisabled : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className={styles.paginationPages}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber: number;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    className={`${styles.paginationButton} ${currentPage === pageNumber ? styles.paginationButtonActive : ''}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              className={`${styles.paginationButton} ${currentPage === totalPages ? styles.paginationButtonDisabled : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
