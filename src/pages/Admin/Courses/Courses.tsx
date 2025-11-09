import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from '../Admin.module.scss'
import pageStyles from './Courses.module.scss'
import Modal from '../../../components/Modal/Modal'
import { coursesApi, type CourseSummary, type CreateCourseRequest } from '../../../services/courses'
import { adminUsersApi, type AdminUser } from '../../../services/adminUsers'
import { useFacultyStore } from '../../../store/useFacultyStore'
import { enrollmentsApi, type EnrollmentRow } from '../../../services/enrollments'

type CourseFormState = Omit<CreateCourseRequest, 'credits'> & {
  credits?: string
}

const defaultFormState: CourseFormState = {
  code: '',
  name: '',
  teacher_id: '',
  faculty_id: '',
  credits: '',
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

  const [teachers, setTeachers] = useState<AdminUser[]>([])
  const [students, setStudents] = useState<AdminUser[]>([])
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([])
  const [enrollmentLoading, setEnrollmentLoading] = useState(false)
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null)

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [manualStudentIds, setManualStudentIds] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [formValues, setFormValues] = useState<CourseFormState>(defaultFormState)
  const [editingCourse, setEditingCourse] = useState<CourseSummary | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const { fetchFacultyList, getFacultyList } = useFacultyStore()
  const faculties = getFacultyList()
  const selectedCourseRef = useRef<string | null>(null)

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId]
  )

  const loadLookups = useCallback(async () => {
    try {
      await fetchFacultyList()
    } catch {
      // ignore faculty errors (optional dependency)
    }
    try {
      const [teacherRes, studentRes] = await Promise.all([
        adminUsersApi.listByRole('TEACHER', { page: 0, size: 200, sort: 'fullName,asc' }),
        adminUsersApi.listByRole('STUDENT', { page: 0, size: 500, sort: 'fullName,asc' }),
      ])
      setTeachers(teacherRes.content || [])
      setStudents(studentRes.content || [])
    } catch (err: any) {
      console.warn('Failed to load lookup data', err)
    }
  }, [fetchFacultyList])

  const loadCourses = useCallback(async (keyword?: string) => {
    setLoading(true)
    setError(null)
    try {
      const page = keyword
        ? await coursesApi.search(keyword, { page: 0, size: 200, sort: 'name,asc' })
        : await coursesApi.adminList({ page: 0, size: 200, sort: 'name,asc' })
      const content = page.content || []
      setCourses(content)
      const currentSelected = selectedCourseRef.current
      if (!currentSelected && content.length) {
        setSelectedCourseId(content[0].id)
        selectedCourseRef.current = content[0].id
      } else if (currentSelected && !content.find((course) => course.id === currentSelected)) {
        const next = content[0]?.id ?? null
        setSelectedCourseId(next)
        selectedCourseRef.current = next
      }
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải danh sách môn học')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadEnrollments = useCallback(
    async (courseId: string) => {
      setEnrollmentLoading(true)
      setEnrollmentError(null)
      try {
        const data = await enrollmentsApi.listByCourse(courseId)
        setEnrollments(data ?? [])
      } catch (err: any) {
        setEnrollmentError(err?.message ?? 'Không thể tải danh sách sinh viên')
      } finally {
        setEnrollmentLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    loadLookups()
    loadCourses()
  }, [loadLookups, loadCourses])

  useEffect(() => {
    if (selectedCourseId) {
      selectedCourseRef.current = selectedCourseId
      loadEnrollments(selectedCourseId)
      setSelectedStudentIds([])
      setManualStudentIds('')
    } else {
      setEnrollments([])
    }
  }, [selectedCourseId, loadEnrollments])

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault()
    await loadCourses(searchQuery.trim() || undefined)
  }

  const openCreateModal = () => {
    setEditingCourse(null)
    setFormValues(defaultFormState)
    setModalOpen(true)
  }

  const openEditModal = (course: CourseSummary) => {
    setEditingCourse(course)
    setFormValues({
      code: course.code ?? '',
      name: course.name ?? '',
      teacher_id: course.teacherId ?? '',
      faculty_id: course.facultyId ?? '',
      credits: course.credits != null ? String(course.credits) : '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setFormValues(defaultFormState)
    setEditingCourse(null)
  }

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleCourseSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formValues.code || !formValues.name || !formValues.teacher_id) return
    const credits = formValues.credits ? Number(formValues.credits) : undefined
    const payload: CreateCourseRequest = {
      code: formValues.code,
      name: formValues.name,
      teacher_id: formValues.teacher_id,
      faculty_id: formValues.faculty_id || undefined,
      credits: Number.isNaN(credits) ? undefined : credits,
    }
    setFormLoading(true)
    setError(null)
    try {
      if (editingCourse) {
        const updated = await coursesApi.update(editingCourse.id, payload)
        setCourses((prev) => prev.map((course) => (course.id === editingCourse.id ? updated : course)))
      } else {
        const created = await coursesApi.create(payload)
        setCourses((prev) => [created, ...prev])
        setSelectedCourseId(created.id)
        selectedCourseRef.current = created.id
      }
      closeModal()
    } catch (err: any) {
      setError(err?.message ?? 'Không thể lưu môn học')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteCourse = async (course: CourseSummary) => {
    if (!window.confirm(`Xóa môn ${course.name}?`)) return
    try {
      await coursesApi.remove(course.id)
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
      if (selectedCourseId === course.id) {
        setSelectedCourseId(null)
        selectedCourseRef.current = null
        setEnrollments([])
      }
    } catch (err: any) {
      setError(err?.message ?? 'Không thể xóa môn học')
    }
  }

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId)
    selectedCourseRef.current = courseId
  }

  const parseManualIds = (raw: string) =>
    raw
      .split(/[\s,;\n]+/)
      .map((id) => id.trim())
      .filter(Boolean)

  const handleBulkEnroll = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedCourseId) return
    const manualIds = parseManualIds(manualStudentIds)
    const uniqueIds = Array.from(new Set([...selectedStudentIds, ...manualIds]))
    if (uniqueIds.length === 0) {
      setEnrollmentError('Chọn ít nhất một sinh viên hoặc nhập danh sách ID')
      return
    }
    setEnrollmentLoading(true)
    setEnrollmentError(null)
    try {
      await enrollmentsApi.bulkEnroll({
        courseId: selectedCourseId,
        studentIds: uniqueIds,
      })
      await loadEnrollments(selectedCourseId)
      setSelectedStudentIds([])
      setManualStudentIds('')
    } catch (err: any) {
      setEnrollmentError(err?.message ?? 'Không thể ghi danh sinh viên')
    } finally {
      setEnrollmentLoading(false)
    }
  }

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!selectedCourseId) return
    if (!window.confirm('Xóa sinh viên khỏi môn học này?')) return
    setEnrollmentLoading(true)
    try {
      await enrollmentsApi.remove(enrollmentId)
      await loadEnrollments(selectedCourseId)
    } catch (err: any) {
      setEnrollmentError(err?.message ?? 'Không thể xóa sinh viên khỏi môn học')
    } finally {
      setEnrollmentLoading(false)
    }
  }

  return (
    <div className={`${styles.page} ${pageStyles.root}`}>
      <div className={pageStyles.headerRow}>
        <h1 className={styles.title}>Quản lý môn học & ghi danh</h1>
        <button className={pageStyles.primaryBtn} onClick={openCreateModal}>
          + Thêm môn học
        </button>
      </div>

      <form className={styles.toolbar} onSubmit={handleSearch}>
        <input placeholder="Tìm theo tên hoặc mã" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
        <button type="submit" disabled={loading}>
          Tìm kiếm
        </button>
        <button type="button" onClick={() => loadCourses()} disabled={loading}>
          Làm mới
        </button>
      </form>

      {error && <div className={pageStyles.error}>{error}</div>}

      <div className={pageStyles.layout}>
        <section className={pageStyles.panel}>
          <div className={pageStyles.panelHeader}>
            <div>
              <h2>Danh sách môn học</h2>
              <p>{courses.length} môn</p>
            </div>
          </div>
          <div className={pageStyles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên môn</th>
                  <th>Giảng viên</th>
                  <th>Tín chỉ</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {!loading && courses.length === 0 && (
                  <tr>
                    <td colSpan={5}>Không có môn học</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5}>Đang tải...</td>
                  </tr>
                )}
                {!loading &&
                  courses.map((course) => {
                    console.log("🚀 ~ Courses ~ course:", course)
                    return <tr
                      key={course.id}
                      className={selectedCourseId === course.id ? pageStyles.selectedRow : undefined}
                      onClick={() => handleSelectCourse(course.id)}
                    >
                      <td>{course.code || '-'}</td>
                      <td>{course.name}</td>
                      <td>{course.teacher_name || '-'}</td>
                      <td>{course.credits ?? '-'}</td>
                      <td className={pageStyles.inlineActions}>
                        <button type="button" onClick={(event) => { event.stopPropagation(); openEditModal(course) }}>
                          Sửa
                        </button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); handleDeleteCourse(course) }}>
                          Xóa
                        </button>
                      </td>
                    </tr>;
                  })}
              </tbody>
            </table>
          </div>
        </section>

        <section className={pageStyles.panel}>
          {!selectedCourse && <div className={pageStyles.emptyState}>Chọn một môn học để xem chi tiết & ghi danh</div>}
          {selectedCourse && (
            <>
              <div className={pageStyles.panelHeader}>
                <div>
                  <h2>{selectedCourse.name}</h2>
                  <p>{selectedCourse.code}</p>
                </div>
                <button type="button" onClick={() => openEditModal(selectedCourse)}>
                  Chỉnh sửa
                </button>
              </div>
              <div className={pageStyles.detailGrid}>
                <div>
                  <p className={pageStyles.mutedLabel}>Giảng viên</p>
                  <strong>{selectedCourse.teacher_name || 'Chưa gán'}</strong>
                </div>
                <div>
                  <p className={pageStyles.mutedLabel}>Khoa</p>
                  <strong>{selectedCourse.faculty_name || '-'}</strong>
                </div>
                <div>
                  <p className={pageStyles.mutedLabel}>Tín chỉ</p>
                  <strong>{selectedCourse.credits ?? '-'}</strong>
                </div>
                <div>
                  <p className={pageStyles.mutedLabel}>Số sinh viên</p>
                  <strong>{enrollments.length}</strong>
                </div>
              </div>

              <hr className={pageStyles.divider} />

              <h3>Ghi danh sinh viên</h3>
              <p className={pageStyles.mutedLabel}>Chọn nhanh sinh viên trong hệ thống hoặc nhập danh sách ID/username, mỗi dòng một mã.</p>

              <form className={pageStyles.enrollForm} onSubmit={handleBulkEnroll}>
                <label>
                  Chọn sinh viên
                  <select
                    multiple
                    value={selectedStudentIds}
                    onChange={(event) =>
                      setSelectedStudentIds(Array.from(event.target.selectedOptions).map((option) => option.value))
                    }
                  >
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.fullName || student.username} ({student.username})
                      </option>
                    ))}
                  </select>
                </label>
                {/* <label>
                  Nhập danh sách ID / username
                  <textarea
                    rows={4}
                    placeholder="mssv-001&#10;mssv-002"
                    value={manualStudentIds}
                    onChange={(event) => setManualStudentIds(event.target.value)}
                  />
                </label> */}
                <button type="submit" disabled={enrollmentLoading}>
                  {enrollmentLoading ? 'Đang xử lý...' : 'Ghi danh'}
                </button>
              </form>

              {enrollmentError && <div className={pageStyles.error}>{enrollmentError}</div>}

              <div className={pageStyles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>MSSV</th>
                      <th>Họ tên</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {enrollmentLoading && (
                      <tr>
                        <td colSpan={4}>Đang tải danh sách ghi danh...</td>
                      </tr>
                    )}
                    {!enrollmentLoading && enrollments.length === 0 && (
                      <tr>
                        <td colSpan={4}>Chưa có sinh viên nào</td>
                      </tr>
                    )}
                    {!enrollmentLoading &&
                      enrollments.map((row, index) => {
                        console.log("🚀 ~ Courses ~ row:", row)
                        return (
                        <tr key={row.enrollmentId}>
                          <td>{index + 1}</td>
                          <td>{row.studentName || '-'}</td>
                          <td>{row.studentEmail}</td>
                          <td className={pageStyles.inlineActions}>
                            <button type="button" onClick={() => handleRemoveEnrollment(row.enrollmentId)}>
                              Xóa
                            </button>
                          </td>
                        </tr>
                      )})}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingCourse ? 'Cập nhật môn học' : 'Thêm môn học'} size="md">
        <form className={pageStyles.modalForm} onSubmit={handleCourseSubmit}>
          <label>
            Mã môn *
            <input name="code" value={formValues.code} onChange={handleFormChange} required />
          </label>
          <label>
            Tên môn *
            <input name="name" value={formValues.name} onChange={handleFormChange} required />
          </label>
          <label>
            Giảng viên *
            <select name="teacher_id" value={formValues.teacher_id} onChange={handleFormChange} required>
              <option value="">-- Chọn giảng viên --</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName || teacher.username}
                </option>
              ))}
            </select>
          </label>
          <label>
            Khoa
            <select name="faculty_id" value={formValues.faculty_id} onChange={handleFormChange}>
              <option value="">-- Chưa gán --</option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name || faculty.code}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tín chỉ
            <input type="number" min={0} name="credits" value={formValues.credits} onChange={handleFormChange} />
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

export default Courses
