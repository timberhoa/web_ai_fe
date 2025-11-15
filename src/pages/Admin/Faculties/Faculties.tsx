import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../Admin.module.scss'
import pageStyles from './Faculties.module.scss'
import Modal from '../../../components/Modal/Modal'
import { facultyApi, type Faculty, type CreateFacultyRequest } from '../../../services/faculty'
import { useFacultyStore } from '../../../store/useFacultyStore'

type FacultyFormState = {
  code: string
  name: string
}

const defaultFormState: FacultyFormState = {
  code: '',
  name: '',
}

const Faculties: React.FC = () => {
  const navigate = useNavigate()
  const { facultyList, fetchFacultyList, addFaculty, updateFaculty, removeFaculty } = useFacultyStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [formValues, setFormValues] = useState<FacultyFormState>(defaultFormState)
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const filteredFaculties = facultyList.filter((faculty) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      faculty.code.toLowerCase().includes(query) ||
      faculty.name.toLowerCase().includes(query)
    )
  })

  const selectedFaculty = facultyList.find((f) => f.id === selectedFacultyId) ?? null

  const loadFaculties = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await fetchFacultyList()
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải danh sách khoa')
    } finally {
      setLoading(false)
    }
  }, [fetchFacultyList])

  useEffect(() => {
    loadFaculties()
  }, [loadFaculties])

  const openCreateModal = () => {
    setEditingFaculty(null)
    setFormValues(defaultFormState)
    setModalOpen(true)
  }

  const openEditModal = (faculty: Faculty) => {
    setEditingFaculty(faculty)
    setFormValues({
      code: faculty.code,
      name: faculty.name,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setFormValues(defaultFormState)
    setEditingFaculty(null)
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleFacultySubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formValues.code || !formValues.name) return

    const payload: CreateFacultyRequest = {
      code: formValues.code,
      name: formValues.name,
    }

    setFormLoading(true)
    setError(null)
    try {
      if (editingFaculty) {
        const updated = await facultyApi.update(editingFaculty.id, payload)
        updateFaculty(editingFaculty.id, updated)
      } else {
        const created = await facultyApi.create(payload)
        addFaculty(created)
        setSelectedFacultyId(created.id)
      }
      closeModal()
    } catch (err: any) {
      setError(err?.message ?? 'Không thể lưu khoa')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteFaculty = async (faculty: Faculty) => {
    if (!window.confirm(`Xóa khoa ${faculty.name}?`)) return
    try {
      await facultyApi.remove(faculty.id)
      removeFaculty(faculty.id)
      if (selectedFacultyId === faculty.id) {
        setSelectedFacultyId(null)
      }
    } catch (err: any) {
      setError(err?.message ?? 'Không thể xóa khoa')
    }
  }

  return (
    <div className={`${styles.page} ${pageStyles.root}`}>
      <div className={pageStyles.headerRow}>
        <h1 className={styles.title}>Quản lý khoa</h1>
        <button className={pageStyles.primaryBtn} onClick={openCreateModal}>
          + Thêm khoa
        </button>
      </div>

      <div className={styles.toolbar}>
        <input
          placeholder="Tìm theo tên hoặc mã khoa"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <button type="button" onClick={loadFaculties} disabled={loading}>
          Làm mới
        </button>
      </div>

      {error && <div className={pageStyles.error}>{error}</div>}

      <div className={pageStyles.layout}>
        <section className={pageStyles.panel}>
          <div className={pageStyles.panelHeader}>
            <div>
              <h2>Danh sách khoa</h2>
              <p>{filteredFaculties.length} khoa</p>
            </div>
          </div>
          <div className={pageStyles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã khoa</th>
                  <th>Tên khoa</th>

                  <th />
                </tr>
              </thead>
              <tbody>
                {!loading && filteredFaculties.length === 0 && (
                  <tr>
                    <td colSpan={4}>Không có khoa nào</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={4}>Đang tải...</td>
                  </tr>
                )}
                {!loading &&
                  filteredFaculties.map((faculty) => (
                    <tr
                      key={faculty.id}
                      className={selectedFacultyId === faculty.id ? pageStyles.selectedRow : undefined}
                      onClick={() => setSelectedFacultyId(faculty.id)}
                    >
                      <td>{faculty.code}</td>
                      <td>{faculty.name}</td>
                      {/* <td>{faculty.description || '-'}</td> */}
                      <td className={pageStyles.inlineActions}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            navigate(`/faculties/${faculty.code}`)
                          }}
                          className={pageStyles.iconBtn}
                          title="Xem chi tiết"
                          aria-label="Xem chi tiết khoa"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            openEditModal(faculty)
                          }}
                          className={pageStyles.iconBtn}
                          title="Sửa"
                          aria-label="Sửa khoa"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteFaculty(faculty)
                          }}
                          className={`${pageStyles.iconBtn} ${pageStyles.deleteBtn}`}
                          title="Xóa"
                          aria-label="Xóa khoa"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={pageStyles.panel}>
          {!selectedFaculty && (
            <div className={pageStyles.emptyState}>Chọn một khoa để xem chi tiết</div>
          )}
          {selectedFaculty && (
            <>
              <div className={pageStyles.panelHeader}>
                <div>
                  <h2>{selectedFaculty.name}</h2>
                  <p>{selectedFaculty.code}</p>
                </div>
                <div className={pageStyles.headerActions}>
                  <button 
                    type="button" 
                    onClick={() => navigate(`/faculties/${selectedFaculty.code}`)}
                    className={pageStyles.detailBtn}
                    title="Xem chi tiết khoa"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>Chi tiết</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => openEditModal(selectedFaculty)}
                    className={pageStyles.editBtn}
                    title="Chỉnh sửa khoa"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Chỉnh sửa</span>
                  </button>
                </div>
              </div>
              <div className={pageStyles.detailGrid}>
                <div>
                  <p className={pageStyles.mutedLabel}>Mã khoa</p>
                  <strong>{selectedFaculty.code}</strong>
                </div>
                <div>
                  <p className={pageStyles.mutedLabel}>Tên khoa</p>
                  <strong>{selectedFaculty.name}</strong>
                </div>
                {/* <div>
                  <p className={pageStyles.mutedLabel}>Mô tả</p>
                  <strong>{selectedFaculty.description || 'Chưa có mô tả'}</strong>
                </div> */}
              </div>
            </>
          )}
        </section>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingFaculty ? 'Cập nhật khoa' : 'Thêm khoa'}
        size="md"
      >
        <form className={pageStyles.modalForm} onSubmit={handleFacultySubmit}>
          <label>
            Mã khoa *
            <input
              name="code"
              value={formValues.code}
              onChange={handleFormChange}
              required
              placeholder="VD: CNTT"
            />
          </label>
          <label>
            Tên khoa *
            <input
              name="name"
              value={formValues.name}
              onChange={handleFormChange}
              required
              placeholder="VD: Công nghệ thông tin"
            />
          </label>

          <div className={pageStyles.modalActions}>
            <button type="button" onClick={closeModal}>
              Hủy
            </button>
            <button type="submit" disabled={formLoading}>
              {formLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Faculties
