import React, { useMemo, useState } from 'react'
import type { Role } from '../../services/auth'

type UserRow = {
  id: string
  fullName: string
  username: string
  email: string
  role: Role
}

const mockUsers: UserRow[] = [
  { id: 'u1', fullName: 'Quản trị viên', username: 'admin', email: 'admin@example.com', role: 'ADMIN' },
  { id: 'u2', fullName: 'Nguyễn Văn A', username: 'teacher.a', email: 'a@gv.edu', role: 'TEACHER' },
  { id: 'u3', fullName: 'Trần Thị B', username: 'sv.b', email: 'b@sv.edu', role: 'STUDENT' },
]

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>(mockUsers)
  const [q, setQ] = useState('')
  const [role, setRole] = useState<Role | 'ALL'>('ALL')

  const filtered = useMemo(() => {
    let data = users
    if (role !== 'ALL') data = data.filter((u) => u.role === role)
    if (q) data = data.filter((u) => u.fullName.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase()))
    return data
  }, [users, q, role])

  const handleResetPassword = (id: string) => {
    alert(`Đã gửi link đặt lại mật khẩu cho user ${id} (demo)`) // placeholder FE action
  }

  const handleChangeRole = (id: string, r: Role) => {
    setUsers((arr) => arr.map((u) => (u.id === id ? { ...u, role: r } : u)))
  }

  return (
    <div>
      <h1>Quản lý tài khoản</h1>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <input placeholder="Tìm tên/username" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value as any)}>
          <option value="ALL">Tất cả</option>
          <option value="ADMIN">ADMIN</option>
          <option value="TEACHER">TEACHER</option>
          <option value="STUDENT">STUDENT</option>
        </select>
      </div>
      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th>Họ tên</th>
            <th>Username</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td>{u.fullName}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>
                <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value as Role)}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="TEACHER">TEACHER</option>
                  <option value="STUDENT">STUDENT</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleResetPassword(u.id)}>Reset mật khẩu</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Users

