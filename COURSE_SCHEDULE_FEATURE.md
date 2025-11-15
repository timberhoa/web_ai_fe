# Course Schedule Feature - Lịch học môn học

## Tổng quan
Tính năng hiển thị lịch học (schedule/timetable) trong trang chi tiết môn học, cho phép xem tất cả các buổi học của môn học được sắp xếp theo tuần.

## Cập nhật ngày: 15/11/2025

## Các tính năng chính

### 1. Hiển thị lịch học theo tuần
- Nhóm các buổi học theo tuần (Monday - Sunday)
- Hiển thị tiêu đề tuần với ngày bắt đầu và kết thúc
- Đếm số buổi học trong mỗi tuần
- Sắp xếp theo thứ tự thời gian tăng dần

### 2. Thông tin buổi học
Mỗi buổi học (session card) hiển thị:
- **Ngày học**: Thứ và ngày (VD: Thứ 2, 15/11)
- **Giờ học**: Giờ bắt đầu - giờ kết thúc (VD: 08:00 - 10:00)
- **Phòng học**: Tên phòng học (VD: Phòng D5-201)
- **Trạng thái**: 
  - "Mở" (màu xanh) - Có thể điểm danh
  - "Đã khóa" (màu đỏ) - Đã chốt điểm danh

### 3. Tương tác
- Click vào session card để navigate đến trang chi tiết buổi học (`/session/{sessionId}`)
- Hover effect với animation smooth
- Arrow icon để chỉ ra có thể click

## Cấu trúc dữ liệu

### ClassSession Type
```typescript
type ClassSession = {
  sessionId: string
  courseId: string
  courseName: string
  courseCode: string
  teacherId?: string
  teacherName?: string
  roomName: string
  startTime: string  // ISO 8601 datetime
  endTime: string    // ISO 8601 datetime
  latitude?: number
  longitude?: number
  radiusMeters?: number
  locked?: boolean
}
```

## API Integration

### Endpoint
```
GET /api/schedule?courseId={courseId}&size=100&sort=startTime,asc
```

### Query Parameters
- `courseId` (required): UUID của môn học
- `size`: Số lượng records (default: 100)
- `sort`: Sắp xếp theo field (default: startTime,asc)

### Response
```json
{
  "content": [
    {
      "sessionId": "uuid",
      "courseId": "uuid",
      "courseName": "Lập trình Java",
      "courseCode": "JAVA101",
      "roomName": "D5-201",
      "startTime": "2025-11-18T08:00:00",
      "endTime": "2025-11-18T10:00:00",
      "locked": false
    }
  ],
  "totalElements": 50,
  "totalPages": 1
}
```

## UI Components

### 1. Schedule Section
```tsx
<div className={styles.scheduleSection}>
  <h2 className={styles.sectionTitle}>
    Lịch học ({sessions.length} buổi)
  </h2>
  {/* Content */}
</div>
```

### 2. Week Block
```tsx
<div className={styles.weekBlock}>
  <div className={styles.weekHeader}>
    <h3>Tuần 15/11 - 21/11/2025</h3>
    <span className={styles.sessionCount}>5 buổi</span>
  </div>
  <div className={styles.sessionList}>
    {/* Session cards */}
  </div>
</div>
```

### 3. Session Card
```tsx
<div className={styles.sessionCard} onClick={() => navigate(`/session/${sessionId}`)}>
  <div className={styles.sessionDay}>
    <div className={styles.dayLabel}>Thứ 2</div>
    <div className={styles.dateLabel}>15/11</div>
  </div>
  
  <div className={styles.sessionDetails}>
    <div className={styles.sessionTime}>
      <svg>...</svg>
      <span>08:00 - 10:00</span>
    </div>
    <div className={styles.sessionRoom}>
      <svg>...</svg>
      <span>Phòng D5-201</span>
    </div>
  </div>
  
  <div className={styles.sessionStatus}>
    <span className={styles.statusOpen}>Mở</span>
    <svg className={styles.arrowIcon}>→</svg>
  </div>
</div>
```

## Helper Functions

### 1. Format Time
```typescript
const formatTime = (dateTimeStr: string) => {
  const date = new Date(dateTimeStr)
  return date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
```

### 2. Get Day of Week
```typescript
const getDayOfWeek = (dateTimeStr: string) => {
  const date = new Date(dateTimeStr)
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  return days[date.getDay()]
}
```

### 3. Group Sessions by Week
```typescript
const groupSessionsByWeek = (sessions: ClassSession[]) => {
  const grouped: { [key: string]: ClassSession[] } = {}
  
  sessions.forEach(session => {
    const date = new Date(session.startTime)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay() + 1) // Monday
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!grouped[weekKey]) {
      grouped[weekKey] = []
    }
    grouped[weekKey].push(session)
  })
  
  return grouped
}
```

## Styling Highlights

### Color Scheme
- **Primary color**: Sử dụng cho icons, borders, và accents
- **Success (green)**: Status "Mở"
- **Danger (red)**: Status "Đã khóa"
- **Gradient backgrounds**: Subtle gradients cho depth

### Responsive Design
- Desktop: Grid layout với 3 columns (day, details, status)
- Mobile: Stack layout với 2 columns, status xuống dưới

### Animations
- Fade in on load
- Hover effects với translateY và translateX
- Smooth transitions (0.2s - 0.3s ease)

## Loading & Error States

### Loading State
```tsx
{sessionsLoading && (
  <div className={styles.loading}>Đang tải lịch học...</div>
)}
```

### Empty State
```tsx
{!sessionsLoading && sessions.length === 0 && (
  <div className={styles.emptyState}>
    <svg>...</svg>
    <p>Chưa có lịch học nào được tạo cho môn học này</p>
  </div>
)}
```

## Files Modified

### 1. src/pages/CourseDetail/CourseDetail.tsx
- Added `sessions` state
- Added `sessionsLoading` state
- Added `useEffect` to load sessions
- Added helper functions for formatting
- Added Schedule Section UI

### 2. src/pages/CourseDetail/CourseDetail.module.scss
- Added `.scheduleSection` styles
- Added `.weekBlock` and `.weekHeader` styles
- Added `.sessionCard` and related styles
- Added `.statusLocked` and `.statusOpen` styles
- Added responsive media queries

## Future Enhancements

### 1. Calendar View
- Thêm view dạng lịch tháng (calendar grid)
- Toggle giữa list view và calendar view
- Highlight ngày hiện tại

### 2. Filtering & Sorting
- Filter theo trạng thái (Mở/Đã khóa)
- Filter theo tháng/tuần
- Sort theo phòng học, thời gian

### 3. Quick Actions
- Quick view attendance stats trên session card
- Inline lock/unlock button cho admin/teacher
- Export schedule to PDF/iCal

### 4. Integration với thư viện Calendar
Có thể tích hợp các thư viện như:
- **FullCalendar**: Full-featured calendar với drag & drop
- **React Big Calendar**: Lightweight calendar component
- **React Calendar**: Simple calendar picker

### 5. Attendance Preview
- Hiển thị số lượng sinh viên đã điểm danh
- Progress bar cho tỷ lệ điểm danh
- Quick stats trên mỗi session card

## Testing Checklist

- [ ] Load sessions khi vào trang CourseDetail
- [ ] Hiển thị đúng số lượng buổi học
- [ ] Group sessions theo tuần chính xác
- [ ] Format time và date đúng định dạng tiếng Việt
- [ ] Click vào session card navigate đến trang chi tiết
- [ ] Hiển thị đúng trạng thái Mở/Đã khóa
- [ ] Hover effects hoạt động smooth
- [ ] Empty state hiển thị khi không có lịch học
- [ ] Loading state hiển thị khi đang tải
- [ ] Responsive trên mobile/tablet
- [ ] Handle error khi API fail

## Notes

- Sessions được load với size=100 để lấy tất cả buổi học (có thể cần pagination nếu có quá nhiều)
- Sử dụng `toLocaleTimeString` và `toLocaleDateString` với locale 'vi-VN' để format theo tiếng Việt
- Week start được tính từ thứ 2 (Monday) theo chuẩn ISO
- Session cards có cursor pointer và hover effect để indicate clickable
- Status badge sử dụng semantic colors (green/red) để dễ phân biệt
