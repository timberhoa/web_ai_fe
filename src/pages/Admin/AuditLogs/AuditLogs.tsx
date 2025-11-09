import React, { useMemo, useState } from 'react'
import styles from '../Admin.module.scss'
import pageStyles from './AuditLogs.module.scss'

type LogRow = { id: string; time: string; actor: string; action: string; detail?: string }

const seed: LogRow[] = [
  { id: 'lg1', time: '2025-10-10 08:00:01', actor: 'admin', action: 'LOGIN', detail: 'Đăng nhập hệ thống' },
  { id: 'lg2', time: '2025-10-10 08:31:22', actor: 'teacher.a', action: 'ATTENDANCE_MARK', detail: 'Điểm danh 12A1' },
]

const AuditLogs: React.FC = () => {
  const [items] = useState<LogRow[]>(seed)
  const [q, setQ] = useState('')
  const filtered = useMemo(() => (q ? items.filter((x) => (x.actor + x.action + (x.detail ?? '')).toLowerCase().includes(q.toLowerCase())) : items), [items, q])

  return (
    <div className={`${styles.page} ${pageStyles.root}`}>
      <h1 className={styles.title}>Nhật ký hoạt động</h1>
      <div className={styles.toolbar}>
        <input placeholder="Tìm theo actor/action" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Tác nhân</th>
              <th>Hành động</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.time}</td>
                <td><span className={pageStyles.actor}>{r.actor}</span></td>
                <td><span className={pageStyles.action}>{r.action}</span></td>
                <td>{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AuditLogs
