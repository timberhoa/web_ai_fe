import React, { useMemo, useState } from 'react'

type Session = { id: string; classCode: string; course: string; date: string; time: string; room?: string }

const seed: Session[] = [
  { id: 's1', classCode: '12A1', course: 'CTDL', date: '2025-10-10', time: '07:30-09:30', room: 'A101' },
]

const Schedule: React.FC = () => {
  const [items, setItems] = useState<Session[]>(seed)
  const [q, setQ] = useState('')
  const [form, setForm] = useState<Partial<Session>>({})

  const filtered = useMemo(() => {
    if (!q) return items
    return items.filter((x) => [x.classCode, x.course, x.room].join(' ').toLowerCase().includes(q.toLowerCase()))
  }, [items, q])

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.classCode || !form.course || !form.date || !form.time) return
    const id = `s${Date.now()}`
    setItems((arr) => [...arr, { id, classCode: form.classCode!, course: form.course!, date: form.date!, time: form.time!, room: form.room }])
    setForm({})
  }

  const generate = () => {
    alert('Đã generate các buổi học thực tế (demo)')
  }

  return (
    <div>
      <h1>Lịch/Session</h1>
      <input placeholder="Tìm (lớp/môn/phòng)" value={q} onChange={(e) => setQ(e.target.value)} />
      <form onSubmit={add} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: 8, marginTop: 12 }}>
        <input placeholder="Mã lớp" value={form.classCode ?? ''} onChange={(e) => setForm((f) => ({ ...f, classCode: e.target.value }))} />
        <input placeholder="Mã môn" value={form.course ?? ''} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))} />
        <input type="date" value={form.date ?? ''} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        <input placeholder="Giờ (07:30-09:30)" value={form.time ?? ''} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
        <input placeholder="Phòng" value={form.room ?? ''} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} />
        <button type="submit">Thêm</button>
      </form>

      <div style={{ marginTop: 8 }}>
        <button onClick={generate}>Generate buổi học thực tế</button>
      </div>

      <table width="100%" cellPadding={8} style={{ marginTop: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>Lớp</th>
            <th>Môn</th>
            <th>Ngày</th>
            <th>Giờ</th>
            <th>Phòng</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((it) => (
            <tr key={it.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td>{it.classCode}</td>
              <td>{it.course}</td>
              <td>{it.date}</td>
              <td>{it.time}</td>
              <td>{it.room}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Schedule

