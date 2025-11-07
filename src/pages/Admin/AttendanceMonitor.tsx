import React, { useEffect, useState } from 'react'

type RoomStatus = { id: string; room: string; classCode: string; camera: string; online: boolean; lastEvent?: string }

const seed: RoomStatus[] = [
  { id: 'r1', room: 'A101', classCode: '12A1', camera: 'CAM-01', online: true, lastEvent: '08:31: FR success' },
  { id: 'r2', room: 'A102', classCode: '11C2', camera: 'CAM-05', online: false, lastEvent: '08:10: camera offline' },
]

const AttendanceMonitor: React.FC = () => {
  const [items, setItems] = useState<RoomStatus[]>(seed)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    const t = setInterval(() => {
      // simulate status flip
      setItems((arr) => arr.map((x, idx) => (idx === 1 ? { ...x, online: !x.online } : x)))
    }, 5000)
    return () => clearInterval(t)
  }, [auto])

  return (
    <div>
      <h1>Giám sát điểm danh (Real-time)</h1>
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Tự động làm mới
      </label>
      <ul style={{ marginTop: 12 }}>
        {items.map((it) => (
          <li key={it.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 8, padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span>Phòng: {it.room}</span>
            <span>Lớp: {it.classCode}</span>
            <span>Camera: {it.camera}</span>
            <span>Trạng thái: <b style={{ color: it.online ? 'green' : 'red' }}>{it.online ? 'Online' : 'Offline'}</b></span>
            <span>{it.lastEvent}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AttendanceMonitor

