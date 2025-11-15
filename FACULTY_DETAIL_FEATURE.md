# Faculty Detail Feature

## Tổng quan
Tính năng trang chi tiết khoa (Faculty Detail) cho phép xem thông tin chi tiết về một khoa, bao gồm danh sách môn học thuộc khoa đó.

## Các tính năng chính

### 1. Thông tin khoa
- Hiển thị tên khoa và mã khoa
- Icon đại diện cho khoa
- Thống kê số lượng môn học

### 2. Danh sách môn học
- Hiển thị tất cả môn học thuộc khoa (sử dụng API `/api/course/by-faculty/{faculty_code}`)
- Mỗi môn học hiển thị:
  - Mã môn học
  - Tên môn học
  - Giảng viên phụ trách
  - Số tín chỉ
- Click vào môn học để xem chi tiết
- Phân trang (10 môn học/trang)

### 3. Navigation
- Nút "Quay lại" để quay về trang danh sách khoa
- Từ trang Faculties có thể:
  - Click vào icon "eye" trong bảng để xem chi tiết
  - Click vào nút "Chi tiết" trong panel bên phải

## Cấu trúc file

```
src/pages/FacultyDetail/
├── FacultyDetail.tsx          # Component chính
├── FacultyDetail.module.scss  # Styles
└── index.ts                   # Export
```

## Routes

- **Admin**: `/faculties/:facultyCode` - Xem chi tiết khoa theo mã khoa

## API Endpoints sử dụng

1. **GET /faculties** - Lấy danh sách tất cả khoa (để tìm khoa theo code)
2. **GET /api/course/by-faculty/{faculty_code}** - Lấy danh sách môn học theo khoa
   - Query params: `page`, `size`, `sort`
   - Response: Paginated list of courses

## UI/UX Features

### Design
- Card-based layout với gradient backgrounds
- Hover effects trên các cards
- Responsive grid layout
- Icon SVG cho visual appeal

### Interactions
- Click vào course card để navigate đến trang chi tiết môn học
- Pagination controls cho danh sách môn học
- Loading states và error handling
- Empty states khi không có dữ liệu

## Cập nhật trong các file khác

### 1. src/app/router.tsx
- Thêm import `FacultyDetail`
- Thêm route `/faculties/:facultyCode` trong Admin routes

### 2. src/pages/Admin/Faculties/Faculties.tsx
- Thêm import `useNavigate` từ react-router-dom
- Thêm nút "Xem chi tiết" (eye icon) trong bảng danh sách
- Thêm nút "Chi tiết" trong panel bên phải
- Navigate đến `/faculties/{facultyCode}` khi click

### 3. src/pages/Admin/Faculties/Faculties.module.scss
- Thêm styles cho `.headerActions`
- Thêm styles cho `.detailBtn`

## Tính năng tương lai có thể mở rộng

1. **Danh sách sinh viên theo khoa**
   - Cần API endpoint: `GET /api/students/by-faculty/{faculty_code}`
   - Hiển thị danh sách sinh viên đang học tại khoa
   - Thống kê số lượng sinh viên

2. **Thống kê khoa**
   - Số lượng giảng viên
   - Số lượng sinh viên
   - Số lượng môn học
   - Tỷ lệ điểm danh trung bình

3. **Quản lý giảng viên**
   - Danh sách giảng viên thuộc khoa
   - Gán/bỏ gán giảng viên cho khoa

4. **Export dữ liệu**
   - Export danh sách môn học ra Excel/CSV
   - Export danh sách sinh viên ra Excel/CSV

## Testing

### Manual Testing Checklist
- [ ] Truy cập `/faculties` và click vào icon "eye" của một khoa
- [ ] Verify trang chi tiết hiển thị đúng thông tin khoa
- [ ] Verify danh sách môn học được load và hiển thị
- [ ] Click vào một môn học và verify navigate đến trang chi tiết môn học
- [ ] Test pagination nếu có nhiều hơn 10 môn học
- [ ] Test nút "Quay lại" hoạt động đúng
- [ ] Test với khoa không có môn học (empty state)
- [ ] Test với faculty code không tồn tại (error state)
- [ ] Test responsive trên mobile/tablet

## Notes

- Faculty code được sử dụng trong URL thay vì ID để URL dễ đọc hơn
- API `/api/course/by-faculty/{faculty_code}` hỗ trợ pagination
- Component sử dụng `facultyApi.getFacultyList()` để tìm faculty theo code vì không có API `getFacultyByCode`
- Styling nhất quán với CourseDetail page để maintain design consistency
