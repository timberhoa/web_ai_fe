import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './CoursesByFaculty.module.scss'
import { coursesApi, type CourseSummary } from '../../services/courses'
import { useFacultyStore } from '../../store/useFacultyStore'

const CoursesByFaculty: React.FC = () => {
  const { facultyCode } = useParams<{ facultyCode: string }>()
  const navigate = useNavigate()
  const { facultyList, fetchFacultyList } = useFacultyStore()
  
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)

  const faculty = facultyList.find((f) => f.code === facultyCode)

  const loadCourses = useCallback(async (currentPage: number) => {
    if (!facultyCode) return
    
    setLoading(true)
    setError(null)
    try {
      const result = await coursesApi.listByFaculty(facultyCode, {
        page: currentPage,
        size: pageSize,
        sort: 'name',
      })
      setCourses(result.content || [])
      setTotalPages(result.totalPages || 0)
      setTotalElements(result.totalElements || 0)
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải danh sách môn học')
    } finally {
      setLoading(false)
    }
  }, [facultyCode, pageSize])

  useEffect(() => {
    if (facultyList.length === 0) {
      fetchFacultyList()
    }
  }, [facultyList.length, fetchFacultyList])

  useEffect(() => {
    loadCourses(page)
  }, [page, loadCourses])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage)
    }
  }

  const handleCourseClick = (courseId: string) => {
    // Navigate to course detail or enrollment page
    navigate(`/courses/${courseId}`)
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <div>
          <h1 className={styles.title}>
            Môn học - {faculty?.name || facultyCode}
          </h1>
          <p className={styles.subtitle}>
            {faculty?.code && `Mã khoa: ${faculty.code}`}
          </p>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Tổng số môn học</span>
            <span className={styles.statValue}>{totalElements}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Trang hiện tại</span>
            <span className={styles.statValue}>{page + 1} / {totalPages || 1}</span>
          </div>
        </div>

        {loading && <div className={styles.loading}>Đang tải...</div>}

        {!loading && courses.length === 0 && (
          <div className={styles.emptyState}>
            <p>Không có môn học nào trong khoa này</p>
          </div>
        )}

        {!loading && courses.length > 0 && (
          <div className={styles.courseGrid}>
            {courses.map((course) => (
              <div
                key={course.id}
                className={styles.courseCard}
                onClick={() => handleCourseClick(course.id)}
              >
                <div className={styles.courseHeader}>
                  <h3 className={styles.courseName}>{course.name}</h3>
                  <span className={styles.courseCode}>{course.code}</span>
                </div>
                <div className={styles.courseDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Giảng viên:</span>
                    <span className={styles.detailValue}>
                      {course.teacher_name || 'Chưa gán'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Tín chỉ:</span>
                    <span className={styles.detailValue}>
                      {course.credits ?? '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
            >
              ← Trước
            </button>
            <span className={styles.pageInfo}>
              Trang {page + 1} / {totalPages}
            </span>
            <button
              className={styles.pageBtn}
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoursesByFaculty
