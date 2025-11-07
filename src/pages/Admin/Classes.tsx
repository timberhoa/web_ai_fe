import React, { useMemo, useState } from 'react'

type ClassRow = { id: string; code: string; lecturer?: string; students: number }

const seed: ClassRow[] = [
  { id: 'c1', code: '12A1', lecturer: 'ThS. Nguyễn Văn A', students: 30 },
  { id: 'c2', code: '11C2', lecturer: 'Cô Trần Thị B', students: 28 },
]

const Classes: React.FC = () => {
  const [items, setItems] = useState<ClassRow[]>(seed)
  const [q, setQ] = useState('')
  const [form, setForm] = useState<Partial<ClassRow>>({})
  const [editing, setEditing] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!q) return items
    return items.filter((x) => x.code.toLowerCase().includes(q.toLowerCase()))
  }, [items, q])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code) return
    if (editing) {
      setItems((arr) => arr.map((it) => (it.id === editing ? { ...it, code: form.code!, lecturer: form.lecturer, students: Number(form.students) || it.students } : it)))
      setEditing(null)
    } else {
      const id = `c${Date.now()}`
      setItems((arr) => [...arr, { id, code: form.code!, lecturer: form.lecturer, students: Number(form.students) || 0 }])
    }
    setForm({})
  }

  const startEdit = (it: ClassRow) => { setEditing(it.id); setForm(it) }
  const remove = (id: string) => setItems((arr) => arr.filter((x) => x.id !== id))

  return (
    <div>
      <h1>Lớp học</h1>
      <input placeholder="Tìm lớp" value={q} onChange={(e) => setQ(e.target.value)} />
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 2fr 1fr auto', marginTop: 12 }}>
        <input placeholder="Mã lớp (vd: 12A1)" value={form.code ?? ''} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
        <input placeholder="Giảng viên phụ trách" value={form.lecturer ?? ''} onChange={(e) => setForm((f) => ({ ...f, lecturer: e.target.value }))} />
        <input placeholder="Số SV" type="number" value={form.students ?? ''} onChange={(e) => setForm((f) => ({ ...f, students: Number(e.target.value) }))} />
        <button type="submit">{editing ? 'Lưu' : 'Thêm'}</button>
      </form>
      <ul>
        {filtered.map((it) => (
          <li key={it.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto auto', gap: 8, padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span>{it.code}</span>
            <span>{it.lecturer || '-'}</span>
            <span>{it.students} SV</span>
            <button onClick={() => startEdit(it)}>Sửa</button>
            <button onClick={() => remove(it.id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Classes

