import React, { useEffect } from 'react'
import { useFacultyStore } from '../../store/useFacultyStore'
import styles from './FacultySelector.module.scss'

interface FacultySelectorProps {
  value: string
  onChange: (facultyId: string) => void
  required?: boolean
  disabled?: boolean
}

const FacultySelector: React.FC<FacultySelectorProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
}) => {
  const { facultyList, fetchFacultyList, loading } = useFacultyStore()

  useEffect(() => {
    if (facultyList.length === 0 && !loading) {
      fetchFacultyList()
    }
  }, [facultyList.length, loading, fetchFacultyList])

  return (
    <div className={styles.root}>
      <label htmlFor="faculty-select" className={styles.label}>
        Khoa {required && <span className={styles.required}>*</span>}
      </label>
      <select
        id="faculty-select"
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled || loading}
      >
        <option value="">-- {loading ? 'Đang tải...' : 'Chọn khoa'} --</option>
        {facultyList.map((faculty) => (
          <option key={faculty.id} value={faculty.id}>
            {faculty.name} ({faculty.code})
          </option>
        ))}
      </select>
    </div>
  )
}

export default FacultySelector
