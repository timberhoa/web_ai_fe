import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './FacultyDetail.module.scss'
import { facultyApi, type Faculty } from '../../services/faculty'
import { coursesApi, type CourseSummary } from '../../services/courses'

const FacultyDetail: React.FC = () => {
  const { facultyCode } = useParams<{ facultyCode: string }>()
  const navigate = useNavigate()
  
  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 10

  useEffect(() => {
    const loadFacultyData = async () => {
      if (!facultyCode) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Load faculty list and find by code
        const facultyList = await facultyApi.getFacultyList()
        const foundFaculty = facultyList.find(f => f.code === facultyCode)
        
        if (!foundFaculty) {
          setError('Không tìm thấy khoa')
          return
        }
        
        setFaculty(foundFaculty)
      } catch (err: any) {
        setError(err?.message ?? 'Không thể tải thông tin khoa')
      } finally {
        setLoading(false)
      }
    }

    loadFacultyData()
  }, [facultyCode])

  useEffect(() => {
    const loadCourses = async () => {
      if (!facultyCode) return
      
      setCoursesLoading(true)
      
      try {
        const response = await coursesApi.listByFaculty(facultyCode, {
          page: currentPage,
          size: pageSize,
          sort: 'name'
        })
        
        setCourses(response.content || [])
        setTotalPages(response.totalPages || 0)
      } catch (err: any) {
        console.error('Failed to load courses:', err)
      } finally {
        setCoursesLoading(false)
      }
    }

    if (faculty) {
      loadCourses()
    }
  }, [facultyCode, faculty, currentPage])

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`)
  }

  if (loading) {
    return (
      <div className={styles.root}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error || !faculty) {
    return (
      <div className={styles.root}>
        <div className={styles.error}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h2>{error || 'Không tìm thấy khoa'}</h2>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            ← Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Quay lại
        </button>
        <div className={styles.headerContent}>
          <div className={styles.facultyIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L1 9L12 15L23 9L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 13L12 19L23 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>{faculty.name}</h1>
            <p className={styles.facultyCode}>Mã khoa: {faculty.code}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{courses.length}</div>
            <div className={styles.statLabel}>Môn học</div>
          </div>
        </div>
      </div>

      {/* Faculty Info */}
      <div className={styles.infoSection}>
        <h2 className={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Thông tin khoa
        </h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Mã khoa:</span>
            <span className={styles.infoValue}>{faculty.code}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Tên khoa:</span>
            <span className={styles.infoValue}>{faculty.name}</span>
          </div>
          {faculty.description && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Mô tả:</span>
              <span className={styles.infoValue}>{faculty.description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Courses List */}
      <div className={styles.coursesSection}>
        <h2 className={styles.sectionTitle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Danh sách môn học ({courses.length})
        </h2>
        
        {coursesLoading && <div className={styles.loading}>Đang tải...</div>}
        
        {!coursesLoading && courses.length === 0 && (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 9H9.01M15 9H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>Chưa có môn học nào thuộc khoa này</p>
          </div>
        )}

        {!coursesLoading && courses.length > 0 && (
          <>
            <div className={styles.courseGrid}>
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className={styles.courseCard}
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className={styles.courseHeader}>
                    <div className={styles.courseIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className={styles.courseCode}>{course.code}</span>
                  </div>
                  <h3 className={styles.courseName}>{course.name}</h3>
                  <div className={styles.courseInfo}>
                    {course.teacher_name && (
                      <div className={styles.courseInfoItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        <span>{course.teacher_name}</span>
                      </div>
                    )}
                    {course.credits && (
                      <div className={styles.courseInfoItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>{course.credits} tín chỉ</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.courseAction}>
                    <span>Xem chi tiết</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className={styles.paginationBtn}
                >
                  ← Trước
                </button>
                <span className={styles.paginationInfo}>
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className={styles.paginationBtn}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default FacultyDetail
