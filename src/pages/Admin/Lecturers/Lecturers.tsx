import React, { useEffect, useMemo, useState } from 'react'
import DataTable, { Column } from '../../../components/DataTable/DataTable'
import Modal from '../../../components/Modal/Modal'
import styles from './Lecturers.module.scss'
import { adminUsersApi, type AdminUser } from '../../../services/adminUsers'
import type { Role } from '../../../services/auth'
import { useFacultyStore } from '../../../store/useFacultyStore'

type StudentUser = AdminUser & { role: Extract<Role, 'TEACHER'> }

type StudentFormData = {
  fullName: string
  username: string
  password?: string
  email: string
  phone?: string
  facultyId?: string
  active: boolean
}

const Students: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<StudentFormData>({
    fullName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    facultyId: undefined,
    active: true,
  })

  const { fetchFacultyList, getFacultyList } = useFacultyStore()
  const faculties = getFacultyList()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        try { await fetchFacultyList() } catch {}
        const page = await adminUsersApi.listByRole('TEACHER', { page: 0, size: 200 })
        setUsers(page.content || [])
      } catch (e: any) {
        setError(e?.message ?? 'Không thể tải danh sách giảng viên')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const students: StudentUser[] = useMemo(() => {
    return (users || []).filter((u) => u.role === 'TEACHER') as StudentUser[]
  }, [users])

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students
    const q = searchQuery.toLowerCase()
    return students.filter(
      (s) =>
        (s.fullName || '').toLowerCase().includes(q) ||
        (s.username || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q)
    )
  }, [students, searchQuery])

  const handleAddStudent = () => {
    setEditingId(null)
    setFormData({
      fullName: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      facultyId: undefined,
      active: true,
    })
    setIsModalOpen(true)
  }

  const handleEditStudent = (id: string) => {
    const student = students.find((s) => s.id === id)
    if (!student) return
    setEditingId(id)
    setFormData({
      fullName: student.fullName || '',
      username: student.username || '',
      password: '',
      email: student.email || '',
      phone: student.phone || '',
      facultyId: student.faculty?.id,
      active: !!student.active,
    })
    setIsModalOpen(true)
  }

  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa giảng viên này?')) return
    setLoading(true)
    try {
      await adminUsersApi.remove(id)
      setUsers((arr) => arr.filter((u) => u.id !== id))
    } catch (e: any) {
      setError(e?.message ?? 'Xóa giảng viên thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (editingId) {
        const payload: any = { ...formData }
        if (!payload.password) delete payload.password
        const updated = await adminUsersApi.update(editingId, {
          ...payload,
          role: 'TEACHER',
        })
        setUsers((arr) => arr.map((u) => (u.id === editingId ? updated : u)))
      } else {
        const created = await adminUsersApi.create({
          ...formData,
          role: 'TEACHER',
          active: formData.active ?? true,
        } as any)
        setUsers((arr) => [...arr, created])
      }
      setIsModalOpen(false)
    } catch (e: any) {
      setError(e?.message ?? 'Lưu giảng viên thất bại')
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

  const columns: Column<StudentUser>[] = [
    { dataIndex: 'fullName', title: 'Họ và tên',width: '140px', sortable: true },
    { dataIndex: 'username', title: 'Username', width: '140px', sortable: true },
    { dataIndex: 'email', title: 'Email', width: '200px' },
    {
      key: 'faculty',
      title: 'Khoa',
      width: '160px',
      render: (_: any, r) => r.faculty?.name ?? '-',
    },
    {
      key: 'active',
      title: 'Trạng thái',
      width: '120px',
      align: 'center',
      render: (_: any, r) => (
        <span className={`${styles.statusBadge} ${r.active ? styles['statusBadge--attended'] : styles['statusBadge--absent']}`}>
          {r.active ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: '140px',
      align: 'center',
      render: (_: unknown, record) => (
        <div className={styles.actionButtons}>
          <button
            className={styles.editButton}
            onClick={() => handleEditStudent(record.id)}
            title="Sửa"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => handleDeleteStudent(record.id)}
            title="Xóa"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.students}>
      <div className={styles.studentsHeader}>
        <div className={styles.studentsTitle}>
          <h1 className={styles.title}>Quản lý giảng viên</h1>
          <p className={styles.subtitle}>Danh sách tài khoản role STUDENT</p>
        </div>
        <button className={styles.addButton} onClick={handleAddStudent}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Thêm giảng viên
        </button>
      </div>

      <div className={styles.studentsContent}>
        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, username, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button className={styles.clearButton} onClick={() => setSearchQuery('')} title="Xóa tìm kiếm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <DataTable
          data={filteredStudents}
          columns={columns}
          loading={loading}
          emptyText={error || 'Không tìm thấy giảng viên'}
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Sửa thông tin giảng viên' : 'Thêm giảng viên mới'}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.studentForm}>
          <div className={styles.formGroup}>
            <label htmlFor="fullName" className={styles.formLabel}>Họ và tên *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.formLabel}>Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="Nhập username"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="name@domain.com"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.formLabel}>Số điện thoại</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="Nhập số điện thoại"
            />
          </div>

          {!editingId && (
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>Mật khẩu *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password || ''}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder="Nhập mật khẩu"
                required
                minLength={6}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="facultyId" className={styles.formLabel}>Khoa</label>
            <select
              id="facultyId"
              name="facultyId"
              value={formData.facultyId || ''}
              onChange={handleInputChange}
              className={styles.formSelect}
            >
              <option value="">-- Chọn khoa --</option>
              {faculties?.map((f) => (
                <option key={f.id} value={f.id}>{f.name || f.code}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Trạng thái</label>
            <label>
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

export default Students

