import React, { useMemo, useState } from 'react'

type Course = { id: string; code: string; name: string }
type Mapping = { id: string; courseId: string; classCode: string }

const seedCourses: Course[] = [
  { id: 'm1', code: 'CTDL', name: 'Cấu trúc dữ liệu' },
  { id: 'm2', code: 'THCS', name: 'Tin học cơ sở' },
]

const seedMaps: Mapping[] = [
  { id: 'mp1', courseId: 'm1', classCode: '12A1' },
]

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(seedCourses)
  const [maps, setMaps] = useState<Mapping[]>(seedMaps)
  const [q, setQ] = useState('')
  const [form, setForm] = useState<Partial<Course>>({})
  const [mapForm, setMapForm] = useState<{ courseId?: string; classCode?: string }>({})

  const filtered = useMemo(() => (q ? courses.filter((c) => (c.name + c.code).toLowerCase().includes(q.toLowerCase())) : courses), [courses, q])

  const addCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code || !form.name) return
    const id = `m${Date.now()}`
    setCourses((arr) => [...arr, { id, code: form.code!, name: form.name! }])
    setForm({})
  }

  const addMapping = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mapForm.courseId || !mapForm.classCode) return
    const id = `mp${Date.now()}`
    setMaps((arr) => [...arr, { id, courseId: mapForm.courseId!, classCode: mapForm.classCode! }])
    setMapForm({})
  }

  return (
    <div>
      <h1>Môn học & Mapping</h1>
      <input placeholder="Tìm môn" value={q} onChange={(e) => setQ(e.target.value)} />

      <h3 style={{ marginTop: 12 }}>Thêm môn</h3>
      <form onSubmit={addCourse} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8 }}>
        <input placeholder="Mã môn" value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
        <input placeholder="Tên môn" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <button type="submit">Thêm</button>
      </form>

      <ul style={{ marginTop: 8 }}>
        {filtered.map((c) => (
          <li key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', padding: '6px 0', borderBottom: '1px solid #eee' }}>
            <span>{c.code}</span>
            <span>{c.name}</span>
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: 16 }}>Gán môn ↔ lớp</h3>
      <form onSubmit={addMapping} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8 }}>
        <select value={mapForm.courseId ?? ''} onChange={(e) => setMapForm((f) => ({ ...f, courseId: e.target.value }))}>
          <option value="">Chọn môn</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
          ))}
        </select>
        <input placeholder="Mã lớp" value={mapForm.classCode ?? ''} onChange={(e) => setMapForm((f) => ({ ...f, classCode: e.target.value }))} />
        <button type="submit">Thêm mapping</button>
      </form>

      <ul style={{ marginTop: 8 }}>
        {maps.map((m) => {
          const course = courses.find((c) => c.id === m.courseId)
          return (
            <li key={m.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', padding: '6px 0', borderBottom: '1px solid #eee' }}>
              <span>{course ? `${course.code} - ${course.name}` : m.courseId}</span>
              <span>{m.classCode}</span>
              <button onClick={() => setMaps((arr) => arr.filter((x) => x.id !== m.id))}>Xóa</button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Courses

