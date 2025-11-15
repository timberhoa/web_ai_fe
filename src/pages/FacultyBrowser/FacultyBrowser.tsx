import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './FacultyBrowser.module.scss'
import { useFacultyStore } from '../../store/useFacultyStore'
import type { Faculty } from '../../services/faculty'

const FacultyBrowser: React.FC = () => {
  const navigate = useNavigate()
  const { facultyList, fetchFacultyList, loading } = useFacultyStore()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (facultyList.length === 0) {
      fetchFacultyList()
    }
  }, [facultyList.length, fetchFacultyList])

  const filteredFaculties = facultyList.filter((faculty) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      faculty.code.toLowerCase().includes(query) ||
      faculty.name.toLowerCase().includes(query) ||
      (faculty.description && faculty.description.toLowerCase().includes(query))
    )
  })

  const handleFacultyClick = (faculty: Faculty) => {
    navigate(`/faculties/${faculty.code}/courses`)
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Danh sách các khoa</h1>
        <p className={styles.subtitle}>Chọn khoa để xem các môn học</p>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Tìm kiếm khoa theo tên hoặc mã..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {loading && <div className={styles.loading}>Đang tải...</div>}

      {!loading && filteredFaculties.length === 0 && (
        <div className={styles.emptyState}>
          <p>Không tìm thấy khoa nào</p>
        </div>
      )}

      {!loading && filteredFaculties.length > 0 && (
        <div className={styles.facultyGrid}>
          {filteredFaculties.map((faculty) => (
            <div
              key={faculty.id}
              className={styles.facultyCard}
              onClick={() => handleFacultyClick(faculty)}
            >
              <div className={styles.facultyIcon}>
                {faculty.code.substring(0, 2).toUpperCase()}
              </div>
              <div className={styles.facultyInfo}>
                <h3 className={styles.facultyName}>{faculty.name}</h3>
                <p className={styles.facultyCode}>Mã: {faculty.code}</p>
                {faculty.description && (
                  <p className={styles.facultyDescription}>{faculty.description}</p>
                )}
              </div>
              <div className={styles.facultyAction}>
                <span>Xem môn học →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.stats}>
        <p>Tổng số khoa: <strong>{filteredFaculties.length}</strong></p>
      </div>
    </div>
  )
}

export default FacultyBrowser
