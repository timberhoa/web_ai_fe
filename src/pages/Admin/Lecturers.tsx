import React, { useMemo, useState } from 'react'

type Lecturer = { id: string; name: string; email: string; dept?: string }

const seed: Lecturer[] = [
  { id: 'l1', name: 'ThS. Nguyễn Văn A', email: 'a@gv.edu', dept: 'CNTT' },
  { id: 'l2', name: 'Cô Trần Thị B', email: 'b@gv.edu', dept: 'Toán' },
]

const Lecturers: React.FC = () => {
  const [items, setItems] = useState<Lecturer[]>(seed)
  const [q, setQ] = useState('')
  const [form, setForm] = useState<Partial<Lecturer>>({})
  const [editing, setEditing] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!q) return items
    return items.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()))
  }, [items, q])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    if (editing) {
      setItems((arr) => arr.map((it) => (it.id === editing ? { ...(it as Lecturer), ...(form as Lecturer) } : it)))
      setEditing(null)
    } else {
      const id = `l${Date.now()}`
      setItems((arr) => [...arr, { id, name: form.name!, email: form.email!, dept: form.dept }])
    }
    setForm({})
  }

  const startEdit = (it: Lecturer) => {
    setEditing(it.id)
    setForm(it)
  }

  const remove = (id: string) => setItems((arr) => arr.filter((x) => x.id !== id))

  return (
    <div>
      <h1>Giảng viên</h1>
      <input placeholder="Tìm giảng viên" value={q} onChange={(e) => setQ(e.target.value)} />
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, gridTemplateColumns: '2fr 2fr 1fr auto' , marginTop: 12}}>
        <input placeholder="Họ tên" value={form.name ?? ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input placeholder="Email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
        <input placeholder="Bộ môn/Khoa" value={form.dept ?? ''} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))} />
        <button type="submit">{editing ? 'Lưu' : 'Thêm'}</button>
      </form>
      <ul>
        {filtered.map((it) => (
          <li key={it.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto auto', gap: 8, padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span>{it.name}</span>
            <span>{it.email}</span>
            <span>{it.dept}</span>
            <button onClick={() => startEdit(it)}>Sửa</button>
            <button onClick={() => remove(it.id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Lecturers

