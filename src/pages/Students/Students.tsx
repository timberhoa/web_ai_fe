import React, { useState } from 'react';
import { useStudentsStore, type Student } from '../../store/useStudentsStore';
import DataTable, { Column } from '../../components/DataTable/DataTable';
import Modal from '../../components/Modal/Modal';
import styles from './Students.module.scss';

interface StudentFormData {
  name: string;
  class: string;
  status: 'attended' | 'absent';
}

const Students: React.FC = () => {
  const {
    addStudent,
    updateStudent,
    deleteStudent,
    getFilteredStudents,
    setSearchQuery,
    setSelectedClass,
    searchQuery,
  } = useStudentsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    class: '',
    status: 'absent',
  });

  const filteredStudents = getFilteredStudents();

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      class: '',
      status: 'absent',
    });
    setIsModalOpen(true);
  };

  const handleEditStudent = (studentId: string) => {
    const filteredStudents = getFilteredStudents();
    const student = filteredStudents.find(s => s.id === studentId);
    if (student) {
      setEditingStudent(studentId);
      setFormData({
        name: student.name,
        class: student.class,
        status: student.status,
      });
      setIsModalOpen(true);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      deleteStudent(studentId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentData = {
      id: editingStudent || Date.now().toString(),
      ...formData,
    };
    
    if (editingStudent) {
      updateStudent(editingStudent, formData);
    } else {
      addStudent(studentData);
    }
    
    setIsModalOpen(false);
    setFormData({
      name: '',
      class: '',
      status: 'absent',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStatusBadge = (status: 'attended' | 'absent') => {
    return (
      <span className={`${styles.statusBadge} ${styles[`statusBadge--${status}`]}`}>
        {status === 'attended' ? 'Đã điểm danh' : 'Chưa điểm danh'}
      </span>
    );
  };

  const columns: Column<Student>[] = [
    {
      key: 'rowIndex',
      title: '#',
      width: '60px',
      align: 'center',
      render: (_: unknown, __: any, index: number) => <span>{index + 1}</span>,
    },
    {
      dataIndex: 'name',
      title: 'Họ tên',
      sortable: true,
    },
    {
      dataIndex: 'class',
      title: 'Lớp',
      width: '120px',
      align: 'center',
      sortable: true,
    },
    {
      dataIndex: 'status',
      title: 'Trạng thái',
      width: '140px',
      align: 'center',
      render: (value: 'attended' | 'absent') => getStatusBadge(value),
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: '140px',
      align: 'center',
      render: (_: unknown, record: typeof filteredStudents[0]) => (
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
  ];

  return (
    <div className={styles.students}>
      <div className={styles.studentsHeader}>
        <div className={styles.studentsTitle}>
          <h1 className={styles.title}>Quản lý sinh viên</h1>
          <p className={styles.subtitle}>
            Quản lý thông tin sinh viên và trạng thái điểm danh
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={handleAddStudent}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Thêm sinh viên
        </button>
      </div>

      <div className={styles.studentsContent}>
        <div className={styles.searchSection}>
          <div className={styles.searchInputWrapper}>
            <svg 
              className={styles.searchIcon} 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sinh viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchQuery('')}
                title="Xóa tìm kiếm"
              >
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
          emptyText="Không tìm thấy sinh viên nào"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </div>

      {/* Add/Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Sửa thông tin sinh viên' : 'Thêm sinh viên mới'}
        size="md"
      >
        <form onSubmit={handleSubmit} className={styles.studentForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>
              Họ và tên *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="Nhập họ và tên sinh viên"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="class" className={styles.formLabel}>
              Lớp *
            </label>
            <input
              type="text"
              id="class"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="Nhập tên lớp (VD: CNTT-01)"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.formLabel}>
              Trạng thái điểm danh
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={styles.formSelect}
            >
              <option value="absent">Chưa điểm danh</option>
              <option value="attended">Đã điểm danh</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              {editingStudent ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
