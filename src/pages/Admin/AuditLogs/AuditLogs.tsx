import React, { useEffect, useState, useMemo } from 'react'
import styles from '../Admin.module.scss'
import pageStyles from './AuditLogs.module.scss'
import { activityLogsApi, type ActivityLogResponse, type ActivityLogFilter } from '../../../services/activityLogs'
import type { Role } from '../../../services/auth'
import Modal from '../../../components/Modal/Modal'

// Helper functions for date-time formatting
const toDateInputValue = (dateTime?: string): string => {
  if (!dateTime) return ''
  try {
    const date = new Date(dateTime)
    const pad = (value: number) => `${value}`.padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  } catch {
    return ''
  }
}

const sanitizeDateTimeValue = (value: string): string => {
  if (!value) return ''
  // datetime-local returns YYYY-MM-DDTHH:mm, we need YYYY-MM-DDTHH:mm:ss for API
  if (value.length === 16) return `${value}:00`
  return value
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLogResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  
  // Filters
  const [filters, setFilters] = useState<ActivityLogFilter>({
    sort: 'occurredAt,desc',
  })
  
  // Detail modal
  const [selectedLog, setSelectedLog] = useState<ActivityLogResponse | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Load logs
  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await activityLogsApi.list({
          ...filters,
          page: currentPage,
          size: pageSize,
        })
        setLogs(response.content || [])
        setTotalElements(response.totalElements || 0)
        setTotalPages(response.totalPages || 0)
      } catch (e: any) {
        setError(e?.message ?? 'Không thể tải nhật ký hoạt động')
      } finally {
        setLoading(false)
      }
    }
    loadLogs()
  }, [filters, currentPage, pageSize])

  const handleFilterChange = (key: keyof ActivityLogFilter, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }))
    setCurrentPage(0) // Reset to first page when filter changes
  }

  const handleResetFilters = () => {
    setFilters({
      sort: 'occurredAt,desc',
    })
    setCurrentPage(0)
  }

  const handleViewDetail = async (log: ActivityLogResponse) => {
    try {
      const detail = await activityLogsApi.detail(log.id)
      setSelectedLog(detail)
      setIsDetailModalOpen(true)
    } catch (e: any) {
      setError(e?.message ?? 'Không thể tải chi tiết nhật ký')
    }
  }

  const formatDateTime = (dateTime: string) => {
    try {
      const date = new Date(dateTime)
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return dateTime
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success'
    if (status >= 300 && status < 400) return 'warning'
    if (status >= 400) return 'error'
    return 'default'
  }

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'get'
      case 'POST':
        return 'post'
      case 'PUT':
      case 'PATCH':
        return 'put'
      case 'DELETE':
        return 'delete'
      default:
        return 'default'
    }
  }

  return (
    <div className={`${styles.page} ${pageStyles.root}`}>
      <h1 className={styles.title}>Nhật ký hoạt động (Activity Logs)</h1>

      {/* Filters */}
      <div className={styles.toolbar}>
        <input
          type="datetime-local"
          placeholder="Từ ngày"
          value={toDateInputValue(filters.from)}
          onChange={(e) => handleFilterChange('from', e.target.value ? sanitizeDateTimeValue(e.target.value) : undefined)}
        />
        <input
          type="datetime-local"
          placeholder="Đến ngày"
          value={toDateInputValue(filters.to)}
          onChange={(e) => handleFilterChange('to', e.target.value ? sanitizeDateTimeValue(e.target.value) : undefined)}
        />
        <input
          type="text"
          placeholder="Tên người dùng"
          value={filters.username || ''}
          onChange={(e) => handleFilterChange('username', e.target.value)}
        />
        <select
          value={filters.role || ''}
          onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
        >
          <option value="">Tất cả vai trò</option>
          <option value="ADMIN">ADMIN</option>
          <option value="TEACHER">TEACHER</option>
          <option value="STUDENT">STUDENT</option>
        </select>
        <select
          value={filters.method || ''}
          onChange={(e) => handleFilterChange('method', e.target.value || undefined)}
        >
          <option value="">Tất cả phương thức</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
        <input
          type="number"
          placeholder="Mã trạng thái"
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <input
          type="text"
          placeholder="Đường dẫn"
          value={filters.path || ''}
          onChange={(e) => handleFilterChange('path', e.target.value)}
        />
        <input
          type="text"
          placeholder="Hành động"
          value={filters.action || ''}
          onChange={(e) => handleFilterChange('action', e.target.value)}
        />
        <input
          type="text"
          placeholder="Tìm kiếm (từ khóa)"
          value={filters.keyword || ''}
          onChange={(e) => handleFilterChange('keyword', e.target.value)}
        />
        <button onClick={handleResetFilters}>Đặt lại</button>
      </div>

      {/* Error message */}
      {error && (
        <div className={pageStyles.error}>
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className={pageStyles.loading}>
          <div className={pageStyles.spinner}></div>
          <span>Đang tải...</span>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Phương thức</th>
                <th>Đường dẫn</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
                <th>Thời gian xử lý</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className={pageStyles.logRow}>
                    <td>{formatDateTime(log.occurredAt)}</td>
                    <td>
                      <span className={pageStyles.actor}>{log.username}</span>
                    </td>
                    <td>
                      <span className={pageStyles.role}>{log.role}</span>
                    </td>
                    <td>
                      <span className={`${pageStyles.method} ${pageStyles[`method--${getMethodColor(log.method)}`]}`}>
                        {log.method}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.path}
                    </td>
                    <td>
                      <span className={`${pageStyles.status} ${pageStyles[`status--${getStatusColor(log.status)}`]}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>
                      <span className={pageStyles.action} title={log.action}>
                        {log.action.length > 50 ? `${log.action.substring(0, 50)}...` : log.action}
                      </span>
                    </td>
                    <td>{log.durationMs}ms</td>
                    <td>
                      <button
                        className={pageStyles.viewButton}
                        onClick={() => handleViewDetail(log)}
                        title="Xem chi tiết"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 0 && (
        <div className={pageStyles.pagination}>
          <div className={pageStyles.paginationInfo}>
            <span>
              Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} trong {totalElements} kết quả
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(0)
              }}
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
          </div>
          <div className={pageStyles.paginationControls}>
            <button
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              className={pageStyles.paginationButton}
            >
              ««
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className={pageStyles.paginationButton}
            >
              ‹
            </button>
            <span className={pageStyles.paginationPage}>
              Trang {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className={pageStyles.paginationButton}
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className={pageStyles.paginationButton}
            >
              »»
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết nhật ký hoạt động"
        size="lg"
      >
        {selectedLog && (
          <div className={pageStyles.detailContent}>
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>ID:</span>
              <span className={pageStyles.detailValue}>{selectedLog.id}</span>
            </div>
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>Thời gian:</span>
              <span className={pageStyles.detailValue}>{formatDateTime(selectedLog.occurredAt)}</span>
            </div>
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>Người dùng:</span>
              <span className={pageStyles.detailValue}>
                {selectedLog.username} ({selectedLog.role})
              </span>
            </div>
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>User ID:</span>
              <span className={pageStyles.detailValue}>{selectedLog.userId}</span>
            </div>
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>Phương thức:</span>
              <span className={`${pageStyles.method} ${pageStyles[`method--${getMethodColor(selectedLog.method)}`]}`}>
                {selectedLog.method}
              </span>
            </div>
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>Đường dẫn:</span>
              <span className={pageStyles.detailValue}>{selectedLog.path}</span>
            </div>
            {selectedLog.query && (
              <div className={pageStyles.detailRow}>
                <span className={pageStyles.detailLabel}>Query:</span>
                <span className={pageStyles.detailValue}>{selectedLog.query}</span>
              </div>
            )}
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>Hành động:</span>
              <span className={pageStyles.detailValue}>{selectedLog.action}</span>
            </div>
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>Trạng thái:</span>
              <span className={`${pageStyles.status} ${pageStyles[`status--${getStatusColor(selectedLog.status)}`]}`}>
                {selectedLog.status}
              </span>
            </div>
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>Thông báo:</span>
              <span className={pageStyles.detailValue}>{selectedLog.message}</span>
            </div>
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>Thời gian xử lý:</span>
              <span className={pageStyles.detailValue}>{selectedLog.durationMs}ms</span>
            </div>
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>IP Address:</span>
              <span className={pageStyles.detailValue}>{selectedLog.ipAddress}</span>
            </div>
            <div className={pageStyles.detailRow}>
              <span className={pageStyles.detailLabel}>User Agent:</span>
              <span className={pageStyles.detailValue} style={{ wordBreak: 'break-word' }}>
                {selectedLog.userAgent}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AuditLogs
