import React, { useMemo, useState } from 'react'

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
    <div>
      <h1>Nhật ký hoạt động</h1>
      <input placeholder="Tìm theo actor/action" value={q} onChange={(e) => setQ(e.target.value)} />
      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>Thời gian</th>
            <th>Tác nhân</th>
            <th>Hành động</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td>{r.time}</td>
              <td>{r.actor}</td>
              <td>{r.action}</td>
              <td>{r.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AuditLogs

