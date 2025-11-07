import React, { useMemo, useState } from 'react'

type Row = { id: string; date: string; classCode: string; lecturer: string; course: string; attendance: number }

const seed: Row[] = [
  { id: 'r1', date: '2025-10-10', classCode: '12A1', lecturer: 'GV A', course: 'CTDL', attendance: 28 },
  { id: 'r2', date: '2025-10-11', classCode: '11C2', lecturer: 'GV B', course: 'THCS', attendance: 27 },
]

const Reports: React.FC = () => {
  const [items] = useState<Row[]>(seed)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')
  const [classCode, setClassCode] = useState('')
  const [lecturer, setLecturer] = useState('')
  const [course, setCourse] = useState('')

  const filtered = useMemo(() => {
    return items.filter((x) => (!classCode || x.classCode.includes(classCode)) && (!lecturer || x.lecturer.includes(lecturer)) && (!course || x.course.includes(course)))
  }, [items, classCode, lecturer, course])

  const exportFile = (type: 'CSV' | 'XLSX' | 'PDF') => {
    alert(`Xuất ${type} (${filtered.length} dòng) - demo`)
  }

  return (
    <div>
      <h1>Báo cáo</h1>
      <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
        <select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
          <option value="day">Ngày</option>
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
        </select>
        <input placeholder="Lớp" value={classCode} onChange={(e) => setClassCode(e.target.value)} />
        <input placeholder="Giảng viên" value={lecturer} onChange={(e) => setLecturer(e.target.value)} />
        <input placeholder="Môn học" value={course} onChange={(e) => setCourse(e.target.value)} />
        <button onClick={() => exportFile('CSV')}>Export CSV</button>
        <button onClick={() => exportFile('XLSX')}>Export XLSX</button>
        <button onClick={() => exportFile('PDF')}>Export PDF</button>
      </div>
      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>Ngày</th>
            <th>Lớp</th>
            <th>Giảng viên</th>
            <th>Môn</th>
            <th>Điểm danh</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td>{r.date}</td>
              <td>{r.classCode}</td>
              <td>{r.lecturer}</td>
              <td>{r.course}</td>
              <td>{r.attendance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Reports

