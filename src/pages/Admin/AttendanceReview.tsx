import React, { useMemo, useState } from 'react'

type ReviewRow = { id: string; student: string; classCode: string; time: string; status: 'success' | 'absent' | 'late'; note?: string }

const seed: ReviewRow[] = [
  { id: 'a1', student: 'Nguyễn Văn A', classCode: '12A1', time: '08:31', status: 'success' },
  { id: 'a2', student: 'Trần Thị B', classCode: '12A1', time: '08:45', status: 'late' },
]

const AttendanceReview: React.FC = () => {
  const [items, setItems] = useState<ReviewRow[]>(seed)
  const [q, setQ] = useState('')

  const filtered = useMemo(() => (q ? items.filter((x) => x.student.toLowerCase().includes(q.toLowerCase())) : items), [items, q])

  const update = (id: string, patch: Partial<ReviewRow>) => setItems((arr) => arr.map((x) => (x.id === id ? { ...x, ...patch } : x)))

  return (
    <div>
      <h1>Rà soát điểm danh</h1>
      <input placeholder="Tìm sinh viên" value={q} onChange={(e) => setQ(e.target.value)} />
      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>SV</th>
            <th>Lớp</th>
            <th>Giờ</th>
            <th>Trạng thái</th>
            <th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((it) => (
            <tr key={it.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td>{it.student}</td>
              <td>{it.classCode}</td>
              <td>{it.time}</td>
              <td>
                <select value={it.status} onChange={(e) => update(it.id, { status: e.target.value as any })}>
                  <option value="success">Có mặt</option>
                  <option value="late">Muộn</option>
                  <option value="absent">Vắng</option>
                </select>
              </td>
              <td>
                <input value={it.note ?? ''} placeholder="Ghi chú" onChange={(e) => update(it.id, { note: e.target.value })} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AttendanceReview

