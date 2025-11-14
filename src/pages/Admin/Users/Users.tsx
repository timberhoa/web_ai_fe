import React, { useEffect, useMemo, useState } from 'react'
import type { Role } from '../../../services/auth'
import styles from './Users.module.scss'
import { adminUsersApi, type AdminUser } from '../../../services/adminUsers'
import Modal from '../../../components/Modal/Modal'
import { useFacultyStore } from '../../../store/useFacultyStore'
import DataTable, { Column } from '../../../components/DataTable/DataTable'
import { exportToExcel } from '../../../utils/excelExport'

type UserRow = {
  id: string
  fullName: string
  username: string
  email: string
  role: Role
  active: boolean
}

const mapToRow = (u: AdminUser): UserRow => ({
  id: u.id,
  fullName: u.fullName,
  username: u.username,
  email: u.email,
  role: u.role,
  active: !!u.active,
})

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([])
  const [q, setQ] = useState('')
  const [role, setRole] = useState<Role | 'ALL'>('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { fetchFacultyList, getFacultyList } = useFacultyStore()
  const faculties = getFacultyList()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    fullName: string
    username: string
    password?: string
    email: string
    phone?: string
    role: Role
    active: boolean
    facultyId?: string
  }>({
    fullName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'STUDENT',
    active: true,
    facultyId: undefined,
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        try { await fetchFacultyList() } catch {}
        if (role === 'ALL') {
          const res = await adminUsersApi.list({ page: 0, size: 200 })
          setUsers((res.content || []).map(mapToRow))
        } else {
          const res = await adminUsersApi.listByRole(role, { page: 0, size: 200 })
          setUsers((res.content || []).map(mapToRow))
        }
      } catch (e: any) {
        setError(e?.message ?? 'Không thể tải danh sách người dùng')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchFacultyList, role])

  const filtered = useMemo(() => {
    let data = users
    if (q) data = data.filter((u) => u.fullName.toLowerCase().includes(q.toLowerCase()) || u.username.toLowerCase().includes(q.toLowerCase()))
    return data
  }, [users, q])

  const handleExportExcel = () => {
    const columns: Column<UserRow>[] = [
      { dataIndex: 'fullName', title: 'Họ tên' },
      { dataIndex: 'username', title: 'Username' },
      { dataIndex: 'email', title: 'Email' },
      { dataIndex: 'role', title: 'Vai trò' },
      {
        key: 'active',
        title: 'Trạng thái',
        render: (_: any, r) => (r.active ? 'Đang hoạt động' : 'Tạm khóa'),
      },
    ]
    exportToExcel(filtered, columns, { filename: 'danh_sach_tai_khoan', sheetName: 'Tài khoản' })
  }

  const columns: Column<UserRow>[] = [
    { dataIndex: 'fullName', title: 'Họ tên', width: '180px', sortable: true },
    { dataIndex: 'username', title: 'Username', width: '140px', sortable: true },
    { dataIndex: 'email', title: 'Email', width: '220px' },
    { dataIndex: 'role', title: 'Vai trò', width: '120px' },
    {
      key: 'active',
      title: 'Trạng thái',
      width: '140px',
      align: 'center',
      render: (_: any, r) => (
        <span className={`${styles.statusBadge} ${r.active ? styles['statusBadge--active'] : styles['statusBadge--inactive']}`}>
          {r.active ? 'Đang hoạt động' : 'Tạm khóa'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      width: '180px',
      align: 'center',
      render: (_: unknown, record) => (
        <div className={styles.actionButtons}>
          <button className={styles.editButton} onClick={() => openEdit(record.id)} title="Sửa">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className={styles.deleteButton} onClick={() => handleDelete(record.id)} title="Xóa">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className={styles.resetButton} onClick={() => handleResetPassword(record.id)} title="Đặt lại mật khẩu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 4L20 9L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      ),
    },
  ]

  const handleResetPassword = (id: string) => {
    alert(`Đã gửi link đặt lại mật khẩu cho user ${id} (demo)`) // placeholder
  }

  const handleChangeRole = async (id: string, r: Role) => {
    try {
      setLoading(true)
      await adminUsersApi.update(id, { role: r })
      setUsers((arr) => arr.map((u) => (u.id === id ? { ...u, role: r } : u)))
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditingId(null)
    setFormData({
      fullName: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      role: 'STUDENT',
      active: true,
      facultyId: undefined,
    })
    setIsModalOpen(true)
  }

  const openEdit = (id: string) => {
    const u = users.find((x) => x.id === id)
    if (!u) return
    setEditingId(id)
    setFormData({
      fullName: u.fullName,
      username: u.username,
      password: '',
      email: u.email,
      phone: '',
      role: u.role,
      active: u.active,
      facultyId: undefined,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return
    setLoading(true)
    try {
      await adminUsersApi.remove(id)
      setUsers((arr) => arr.filter((u) => u.id !== id))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        const payload: any = { ...formData }
        if (!payload.password) delete payload.password
        const updated = await adminUsersApi.update(editingId, payload)
        setUsers((arr) => arr.map((u) => (u.id === editingId ? mapToRow(updated as AdminUser) : u)))
      } else {
        const created = await adminUsersApi.create(formData as any)
        setUsers((arr) => [...arr, mapToRow(created)])
      }
      setIsModalOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <div className={styles.users}>
      <div className={styles.usersHeader}>
        <div className={styles.usersTitle}>
          <h1 className={styles.title}>Quản lý tài khoản</h1>
          <p className={styles.subtitle}>Quản lý người dùng hệ thống theo vai trò</p>
        </div>
        <button className={styles.addButton} onClick={openAdd}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Thêm người dùng
        </button>
      </div>

      <div className={styles.usersContent}>
        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên/username..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={styles.searchInput}
            />
            {q && (
              <button className={styles.clearButton} onClick={() => setQ('')} title="Xóa tìm kiếm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value as any)} className={styles.roleFilter}>
            <option value="ALL">Tất cả</option>
            <option value="ADMIN">ADMIN</option>
            <option value="TEACHER">TEACHER</option>
            <option value="STUDENT">STUDENT</option>
          </select>
          <button className={styles.exportButton} onClick={handleExportExcel} title="Xuất Excel">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
            Xuất Excel
                      </button>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          loading={loading}
          emptyText={error || 'Không tìm thấy người dùng'}
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Sửa người dùng' : 'Thêm người dùng'}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.userForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Họ và tên</label>
              <input className={styles.formInput} name="fullName" value={formData.fullName} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Username</label>
              <input className={styles.formInput} name="username" value={formData.username} onChange={handleInputChange} required />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input type="email" className={styles.formInput} name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Số điện thoại</label>
              <input className={styles.formInput} name="phone" value={formData.phone || ''} onChange={handleInputChange} />
            </div>
          </div>

          {!editingId && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mật khẩu</label>
              <input type="password" className={styles.formInput} name="password" value={formData.password || ''} onChange={handleInputChange} required minLength={6} />
            </div>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Vai trò</label>
              <select className={styles.formSelect} name="role" value={formData.role} onChange={handleInputChange}>
                <option value="ADMIN">ADMIN</option>
                <option value="TEACHER">TEACHER</option>
                <option value="STUDENT">STUDENT</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Khoa</label>
              <select className={styles.formSelect} name="facultyId" value={formData.facultyId || ''} onChange={handleInputChange}>
                <option value="">-- Không chọn --</option>
                {faculties?.map((f) => (
                  <option key={f.id} value={f.id}>{f.name || f.code}</option>
                ))}
              </select> 
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="active" checked={!!formData.active} onChange={handleInputChange} /> Hoạt động
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Hủy</button>
            <button type="submit" className={styles.submitButton}>{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Users

