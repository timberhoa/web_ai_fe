# Faculty Management Features

## Tổng quan

Đã implement đầy đủ các tính năng quản lý khoa (Faculty Management) cho hệ thống, bao gồm:

### 1. Faculty Management API (Admin)

**Base URL:** `/api/faculties`

#### Các API đã implement:

- ✅ **POST /api/faculties** - Tạo khoa mới
- ✅ **PUT /api/faculties/{id}** - Cập nhật thông tin khoa
- ✅ **DELETE /api/faculties/{id}** - Xóa khoa
- ✅ **GET /api/faculties/{id}** - Lấy thông tin chi tiết khoa
- ✅ **GET /api/faculties** - Lấy danh sách tất cả các khoa

#### Courses by Faculty API:

- ✅ **GET /api/course/by-faculty/{faculty_code}** - Lấy danh sách môn học theo mã khoa (có phân trang)
  - Query params: `page`, `size`, `sort`

### 2. Services Layer

#### Faculty Service (`src/services/faculty.ts`)
```typescript
- getFacultyList() - Lấy danh sách khoa
- getFacultyById(id) - Lấy thông tin khoa theo ID
- create(payload) - Tạo khoa mới
- update(id, payload) - Cập nhật khoa
- remove(id) - Xóa khoa
```

#### Courses Service (`src/services/courses.ts`)
```typescript
- listByFaculty(facultyCode, params) - Lấy môn học theo mã khoa (có phân trang)
```

### 3. State Management

#### Faculty Store (`src/store/useFacultyStore.ts`)
- Quản lý state của danh sách khoa
- Caching với Zustand persist
- CRUD operations: add, update, remove
- Loading và error states

### 4. Pages & Components

#### Admin Pages:

**Faculty Management Page** (`/faculties`)
- Quản lý CRUD đầy đủ cho khoa
- Giao diện 2 panel: danh sách + chi tiết
- Tìm kiếm theo tên hoặc mã khoa
- Modal form để thêm/sửa khoa

#### Teacher & Shared Pages:

**Faculty Browser** (`/browse-faculties`)
- Hiển thị danh sách các khoa dạng card
- Tìm kiếm khoa
- Click vào khoa để xem môn học

**Courses by Faculty** (`/faculties/:facultyCode/courses`)
- Hiển thị danh sách môn học theo khoa
- Phân trang (pagination)
- Hiển thị thông tin: tên môn, mã môn, giảng viên, tín chỉ
- Card layout responsive

#### Components:

**FacultySelector** (`src/components/FacultySelector`)
- Dropdown component để chọn khoa
- Tự động load danh sách khoa
- Có thể dùng trong forms (create/edit course)

### 5. Routing

#### Admin Routes:
- `/faculties` - Quản lý khoa (Admin only)

#### Teacher Routes:
- `/browse-faculties` - Duyệt danh sách khoa
- `/faculties/:facultyCode/courses` - Xem môn học theo khoa

### 6. Navigation

#### Admin Sidebar:
- ➕ "Quản lý khoa" menu item

#### Teacher Sidebar:
- ➕ "Duyệt khoa" menu item

### 7. Features Highlights

#### Cho Admin:
1. **Quản lý khoa đầy đủ**
   - Thêm khoa mới với mã và tên
   - Sửa thông tin khoa
   - Xóa khoa (có confirm)
   - Xem chi tiết khoa

2. **Tích hợp với Courses**
   - Khi tạo/sửa môn học, có thể chọn khoa
   - Hiển thị tên khoa trong danh sách môn học

#### Cho Teacher:
1. **Duyệt khoa**
   - Xem tất cả các khoa trong hệ thống
   - Tìm kiếm khoa
   - Card layout đẹp mắt với icon

2. **Xem môn học theo khoa**
   - Click vào khoa để xem các môn học
   - Phân trang để xử lý nhiều môn học
   - Thông tin đầy đủ về môn học

### 8. UI/UX Features

- ✨ **Gradient backgrounds** - Giao diện hiện đại
- 🎨 **Hover effects** - Tương tác mượt mà
- 📱 **Responsive design** - Hoạt động tốt trên mobile
- 🔍 **Search functionality** - Tìm kiếm nhanh
- 📄 **Pagination** - Xử lý dữ liệu lớn
- ⚡ **Loading states** - Feedback rõ ràng
- ❌ **Error handling** - Xử lý lỗi tốt

### 9. Technical Stack

- **React** + TypeScript
- **Zustand** - State management với persist
- **Axios** - HTTP client
- **React Router** - Routing
- **SCSS Modules** - Styling
- **JWT Authentication** - Bảo mật

### 10. File Structure

```
src/
├── services/
│   ├── faculty.ts          # Faculty API service
│   └── courses.ts          # Updated with listByFaculty
├── store/
│   └── useFacultyStore.ts  # Faculty state management
├── pages/
│   ├── Admin/
│   │   └── Faculties/      # Admin faculty management
│   ├── FacultyBrowser/     # Browse faculties (Teacher)
│   └── CoursesByFaculty/   # Courses by faculty
├── components/
│   └── FacultySelector/    # Faculty dropdown component
└── app/
    └── router.tsx          # Updated routes
```

## Cách sử dụng

### Admin:
1. Đăng nhập với tài khoản Admin
2. Vào menu "Quản lý khoa"
3. Thêm/sửa/xóa khoa
4. Khi tạo môn học, chọn khoa từ dropdown

### Teacher:
1. Đăng nhập với tài khoản Teacher
2. Vào menu "Duyệt khoa"
3. Tìm kiếm hoặc chọn khoa
4. Click vào khoa để xem các môn học
5. Sử dụng pagination để duyệt qua các trang

## API Response Examples

### Get All Faculties
```json
[
  {
    "id": "uuid-1",
    "code": "CNTT",
    "name": "Công nghệ thông tin",
    "description": "Khoa Công nghệ thông tin"
  },
  {
    "id": "uuid-2",
    "code": "KTPM",
    "name": "Kỹ thuật phần mềm",
    "description": "Khoa Kỹ thuật phần mềm"
  }
]
```

### Get Courses by Faculty (Paginated)
```json
{
  "content": [
    {
      "id": "course-uuid-1",
      "code": "CS101",
      "name": "Lập trình cơ bản",
      "credits": 3,
      "teacherId": "teacher-uuid",
      "teacher_name": "Nguyễn Văn A",
      "facultyId": "faculty-uuid",
      "faculty_name": "Công nghệ thông tin"
    }
  ],
  "totalPages": 5,
  "totalElements": 45,
  "size": 10,
  "number": 0
}
```

## Notes

- Tất cả các API đều yêu cầu JWT authentication
- Faculty code phải unique
- Khi xóa khoa, cần đảm bảo không có môn học nào đang sử dụng
- Pagination mặc định: page=0, size=10
- Store được persist vào localStorage để cải thiện performance

## Future Enhancements

- [ ] Thêm description field vào form
- [ ] Export danh sách khoa ra Excel
- [ ] Thống kê số lượng môn học theo khoa
- [ ] Filter môn học theo nhiều tiêu chí
- [ ] Bulk operations cho khoa
- [ ] Faculty logo/image upload
