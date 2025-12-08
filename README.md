# Hệ Thống Quản Lý Điểm Danh Sinh Viên (Student Admin)

## 📖 Mục Lục
- [Giới thiệu](#giới-thiệu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Cài đặt và sử dụng](#cài-đặt-và-sử-dụng)
- [Tính năng chính](#tính-năng-chính)
- [Chi tiết các module](#chi-tiết-các-module)
- [API Services](#api-services)
- [State Management](#state-management)
- [Routing và Bảo mật](#routing-và-bảo-mật)
- [Styling và UI](#styling-và-ui)
- [Testing](#testing)

---

## 🎯 Giới thiệu

**Student Admin** là một hệ thống quản lý điểm danh sinh viên thông minh, được xây dựng bằng React và TypeScript. Hệ thống hỗ trợ 3 vai trò người dùng chính:

- **👨‍💼 Admin**: Quản lý toàn bộ hệ thống (sinh viên, giảng viên, lớp học, khóa học, khoa)
- **👨‍🏫 Teacher**: Quản lý lớp học, điểm danh, xem báo cáo của lớp mình dạy
- **👨‍🎓 Student**: Xem lịch học, điểm danh của mình, sử dụng AI Assistant

### Tính năng nổi bật
- ✅ Điểm danh thông minh với AI face recognition
- 📊 Dashboard với biểu đồ thống kê trực quan (Chart.js)
- 🔐 Xác thực và phân quyền đầy đủ (JWT)
- 📱 Responsive design cho mọi thiết bị
- 🎨 UI/UX hiện đại với SCSS modules
- 🤖 Tích hợp Gemini AI cho trợ lý ảo
- 📈 Xuất báo cáo Excel chi tiết
- 🔄 Real-time error handling

---

## 🛠️ Công nghệ sử dụng

### Core Technologies
- **React 18.3.1**: Framework UI chính
- **TypeScript 4.9.5**: Static typing
- **React Router DOM 7.9.1**: Client-side routing
- **React Scripts 5.0.1**: Build tooling (Create React App)

### State Management
- **Zustand 5.0.8**: Lightweight state management với persist middleware

### UI & Styling
- **SCSS/Sass 1.93.0**: CSS preprocessor
- **CSS Modules**: Scoped styling
- **Chart.js 4.5.1** + **react-chartjs-2 5.3.1**: Data visualization

### HTTP & API
- **Axios 1.7.7**: HTTP client với interceptors
- **REST API**: Backend communication

### Utilities
- **XLSX 0.18.5**: Excel export/import
- **Web Vitals 2.1.4**: Performance monitoring

### Testing
- **Jest**: Test runner
- **@testing-library/react 16.3.0**: Component testing
- **@testing-library/user-event 13.5.0**: User interaction testing
- **@testing-library/dom 10.4.1**: DOM testing utilities

---

## 📁 Cấu trúc thư mục

```
web_ai_fe/
├── public/                      # Static assets
│   ├── index.html              # HTML template
│   ├── favicon.ico             # App icon
│   ├── logo192.png             # PWA logo (192x192)
│   ├── logo512.png             # PWA logo (512x512)
│   ├── manifest.json           # PWA manifest
│   └── robots.txt              # SEO robots file
│
├── src/                         # Source code
│   ├── app/                     # Application config
│   │   └── router.tsx          # Route definitions & guards
│   │
│   ├── components/              # Reusable components
│   │   ├── CameraBox/          # Camera for face recognition
│   │   ├── DataTable/          # Table component với sort/filter
│   │   ├── ErrorBoundary/      # Error handling components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── GlobalErrorListeners.tsx
│   │   │   └── GlobalErrorModal.tsx
│   │   ├── FacultySelector/    # Faculty dropdown selector
│   │   ├── Modal/              # Modal dialog component
│   │   ├── Sidebar/            # Navigation sidebar
│   │   ├── StatsCard/          # Statistics card component
│   │   ├── Topbar/             # Top navigation bar
│   │   └── RouteGuards.tsx     # Auth & role guards
│   │
│   ├── layouts/                 # Layout components
│   │   ├── MainLayout.tsx      # Main app layout (Sidebar + Topbar + Content)
│   │   └── MainLayout.module.scss
│   │
│   ├── pages/                   # Page components (routes)
│   │   ├── Admin/              # Admin-only pages
│   │   │   ├── Students/       # Student management
│   │   │   ├── Users/          # User management
│   │   │   ├── Lecturers/      # Lecturer management
│   │   │   ├── Classes/        # Class management
│   │   │   ├── Courses/        # Course management
│   │   │   ├── Faculties/      # Faculty management
│   │   │   ├── Schedule/       # Schedule management
│   │   │   ├── AttendanceMonitor/ # Real-time monitoring
│   │   │   ├── AttendanceReview/  # Review & approve attendance
│   │   │   ├── FacesSettings/  # Face data management
│   │   │   ├── AuditLogs/      # Activity logs
│   │   │   └── Reports/        # Admin reports
│   │   │
│   │   ├── Teacher/            # Teacher-only pages
│   │   │   ├── MyClasses/      # Teacher's classes
│   │   │   ├── MyClassDetail/  # Class detail view
│   │   │   ├── Sessions/       # Teaching sessions
│   │   │   └── AttendanceToday/# Today's attendance
│   │   │
│   │   ├── Student/            # Student-only pages
│   │   │   ├── MySchedule/     # Student's schedule
│   │   │   ├── MyAttendance/   # Student's attendance
│   │   │   ├── MyProfile/      # Student profile
│   │   │   └── AIAssistant/    # Gemini AI chatbot
│   │   │
│   │   ├── Attendance/         # Shared attendance page
│   │   ├── Dashboard/          # Dashboard (all roles)
│   │   ├── Login/              # Login page
│   │   ├── Register/           # Register page
│   │   ├── Settings/           # Settings page
│   │   ├── FaceEnrollment/     # Face registration
│   │   ├── FacultyBrowser/     # Browse faculties
│   │   ├── FacultyDetail/      # Faculty details
│   │   ├── CoursesByFaculty/   # Courses by faculty
│   │   ├── CourseDetail/       # Course details
│   │   ├── SessionDetail/      # Session details
│   │   └── NotFound/           # 404 page
│   │
│   ├── services/                # API services
│   │   ├── http.ts             # Axios instance + interceptors
│   │   ├── auth.ts             # Authentication APIs
│   │   ├── student.ts          # Student APIs
│   │   ├── students.ts         # Students management APIs
│   │   ├── adminUsers.ts       # Admin users APIs
│   │   ├── attendance.ts       # Attendance APIs
│   │   ├── courses.ts          # Course APIs
│   │   ├── enrollments.ts      # Enrollment APIs
│   │   ├── faculty.ts          # Faculty APIs
│   │   ├── schedule.ts         # Schedule APIs
│   │   ├── dashboard.ts        # Dashboard stats APIs
│   │   ├── reports.ts          # Reports APIs
│   │   ├── activityLogs.ts     # Activity logs APIs
│   │   ├── gemini.ts           # Gemini AI integration
│   │   └── user.ts             # User profile APIs
│   │
│   ├── store/                   # Zustand stores
│   │   ├── useAuthStore.ts     # Authentication state
│   │   ├── useStudentsStore.ts # Students state
│   │   ├── useAttendanceStore.ts # Attendance state
│   │   ├── useFacultyStore.ts  # Faculty state
│   │   └── useErrorStore.ts    # Global error state
│   │
│   ├── styles/                  # Global styles
│   │   ├── _variables.scss     # SCSS variables (colors, spacing, etc.)
│   │   ├── _mixins.scss        # SCSS mixins (responsive, flex, etc.)
│   │   └── global.scss         # Global styles & resets
│   │
│   ├── utils/                   # Utility functions
│   │   ├── errorHandler.ts     # Error handling utilities
│   │   ├── excelExport.ts      # Basic Excel export
│   │   └── reportExcelExport.ts # Advanced report export
│   │
│   ├── App.tsx                  # Root component
│   ├── App.css                  # App-level styles
│   ├── App.test.tsx             # App tests
│   ├── index.tsx                # Entry point
│   ├── index.css                # Base CSS
│   ├── setupTests.ts            # Test configuration
│   ├── reportWebVitals.ts       # Performance metrics
│   └── react-app-env.d.ts       # TypeScript declarations
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

---

## 🏗️ Kiến trúc hệ thống

### Component Architecture

```
App (ErrorBoundary)
├── GlobalErrorListeners
├── AppRouter (BrowserRouter)
│   ├── PublicOnly Routes (Login, Register)
│   └── RequireAuth Routes
│       └── MainLayout
│           ├── Sidebar (Navigation)
│           ├── Topbar (User info, notifications)
│           └── Outlet (Page content)
│               ├── Dashboard
│               ├── Admin Pages (RequireRole: ADMIN)
│               ├── Teacher Pages (RequireRole: TEACHER)
│               └── Student Pages (RequireRole: STUDENT)
└── GlobalErrorModal
```

### Data Flow

```
Component → Zustand Store ⟷ API Service ⟷ Backend
                ↓
         LocalStorage (persist)
```

### Authentication Flow

```
1. User inputs credentials → Login component
2. Login component → authApi.login() → Backend
3. Backend returns JWT token + user info
4. Store in Zustand → Persisted to localStorage
5. http interceptor adds token to all requests
6. On 401 error → Auto logout → Redirect to login
```

---

## 🚀 Cài đặt và sử dụng

### Prerequisites
- Node.js >= 16.x
- npm >= 8.x

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd web_ai_fe
```

### Bước 2: Install dependencies
```bash
npm install
```

### Bước 3: Cấu hình môi trường
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Chỉnh sửa `.env`:
```env
# Backend API URL
REACT_APP_API_BASE_URL=http://localhost:8080/api

# Gemini AI API Key (cho student AI assistant)
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### Bước 4: Chạy development server
```bash
npm start
```
App sẽ chạy tại: [http://localhost:3000](http://localhost:3000)

### Bước 5: Build cho production
```bash
npm run build
```
Output trong thư mục `build/`

### Bước 6: Chạy tests
```bash
npm test
```

---

## ✨ Tính năng chính

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes with guards
- Auto-logout on token expiration
- Persistent login state

### 👨‍💼 Admin Features
- **Quản lý sinh viên**: CRUD operations, import Excel
- **Quản lý giảng viên**: Thêm/sửa/xóa giảng viên
- **Quản lý lớp học**: Tạo lớp, phân công giảng viên
- **Quản lý khóa học**: Cấu hình môn học
- **Quản lý khoa**: Quản lý các khoa/ngành
- **Lịch học**: Xếp lịch cho các lớp
- **Xem và duyệt điểm danh**: Review attendance records
- **Quản lý dữ liệu khuôn mặt**: Face data management
- **Audit logs**: Xem lịch sử hoạt động hệ thống
- **Báo cáo**: Xuất báo cáo điểm danh Excel

### 👨‍🏫 Teacher Features
- **Lớp học của tôi**: Xem danh sách lớp đang dạy
- **Điểm danh**: Thực hiện điểm danh cho buổi học
- **Quản lý phiên học**: Xem lịch sử các buổi học
- **Điểm danh hôm nay**: Quick access to today's sessions
- **Báo cáo**: Xem và xuất báo cáo lớp học
- **Duyệt khoa**: Browse faculties and courses

### 👨‍🎓 Student Features
- **Lịch học của tôi**: Xem thời khóa biểu
- **Điểm danh của tôi**: Xem lịch sử điểm danh
- **Hồ sơ**: Cập nhật thông tin cá nhân
- **AI Assistant**: Chatbot hỗ trợ học tập (Gemini AI)
- **Face Enrollment**: Đăng ký khuôn mặt để điểm danh

### 📊 Dashboard
- Thống kê theo vai trò:
  - **Admin**: Tổng quan toàn hệ thống
  - **Teacher**: Thống kê lớp học, điểm danh
  - **Student**: Tỷ lệ điểm danh, lịch học sắp tới
- Biểu đồ trực quan với Chart.js
- Real-time updates

---

## 🧩 Chi tiết các module

### 1. `/src/app` - Application Configuration

#### `router.tsx`
Định nghĩa toàn bộ routing của ứng dụng:
- **Public routes**: Login, Register
- **Protected routes**: Yêu cầu authentication
- **Role-based routes**: Sử dụng `RequireRole` guard
  - Admin routes: `/students`, `/users`, `/lecturers`, etc.
  - Teacher routes: `/my-classes`, `/sessions`, etc.
  - Student routes: `/my-schedule`, `/my-attendance`, etc.
- **Shared routes**: Accessible by multiple roles

### 2. `/src/components` - Reusable Components

#### `CameraBox/`
Component điều khiển camera cho face recognition:
- Access camera stream
- Capture face images
- Send to backend for verification

#### `DataTable/`
Table component mạnh mẽ:
- Sorting (asc/desc)
- Filtering
- Pagination
- Custom cell rendering

#### `ErrorBoundary/`
Error handling system:
- **ErrorBoundary.tsx**: React error boundary
- **GlobalErrorListeners.tsx**: Listen to window errors
- **GlobalErrorModal.tsx**: Display error modals

#### `FacultySelector/`
Dropdown selector cho khoa/ngành:
- Fetch faculties from API
- Searchable dropdown
- Integration with forms

#### `Modal/`
Generic modal component:
- Customizable header/body/footer
- Accessible (ARIA labels)
- Keyboard navigation (ESC to close)

#### `Sidebar/`
Navigation sidebar:
- Dynamic menu items based on role
- Active route highlighting
- Mobile-responsive (drawer)
- Logo and branding

#### `StatsCard/`
Statistics display card:
- Icon + Title + Value + Trend
- Color-coded
- Used in dashboards

#### `Topbar/`
Top navigation bar:
- User info & avatar
- Notifications
- Logout button
- Mobile menu toggle

#### `RouteGuards.tsx`
Route protection guards:
- **PublicOnly**: Redirect authenticated users to dashboard
- **RequireAuth**: Require authentication
- **RequireRole**: Require specific role(s)

### 3. `/src/layouts` - Layout Components

#### `MainLayout.tsx`
Main application layout:
- Combines Sidebar + Topbar + Content area
- Responsive behavior
- Sidebar toggle for mobile
- Outlet for nested routes

### 4. `/src/pages` - Page Components

Mỗi page tương ứng với một route, được tổ chức theo role:

#### Admin Pages (`/src/pages/Admin`)
| Page | Route | Description |
|------|-------|-------------|
| Students | `/students` | Quản lý sinh viên |
| Users | `/users` | Quản lý users hệ thống |
| Lecturers | `/lecturers` | Quản lý giảng viên |
| Classes | `/classes` | Quản lý lớp học |
| Courses | `/courses` | Quản lý khóa học |
| Faculties | `/faculties` | Quản lý khoa |
| Schedule | `/schedule` | Quản lý lịch học |
| AttendanceReview | `/attendance/review` | Duyệt điểm danh |
| FacesSettings | `/faces` | Quản lý face data |
| AuditLogs | `/audit-logs` | Xem logs |
| Reports | `/reports` | Báo cáo |

#### Teacher Pages (`/src/pages/Teacher`)
| Page | Route | Description |
|------|-------|-------------|
| MyClasses | `/my-classes` | Lớp đang dạy |
| MyClassDetail | `/my-classes/:id` | Chi tiết lớp |
| Sessions | `/sessions` | Phiên học |
| AttendanceToday | `/attendance-today` | Điểm danh hôm nay |

#### Student Pages (`/src/pages/Student`)
| Page | Route | Description |
|------|-------|-------------|
| MySchedule | `/my-schedule` | Lịch học |
| MyAttendance | `/my-attendance` | Điểm danh |
| MyProfile | `/my-profile` | Hồ sơ |
| AIAssistant | `/ai-assistant` | AI chatbot |

#### Shared Pages
| Page | Route | Roles | Description |
|------|-------|-------|-------------|
| Dashboard | `/` | All | Dashboard |
| Attendance | `/attendance` | Admin, Teacher | Điểm danh |
| Settings | `/settings` | All | Cài đặt |
| FaceEnrollment | `/face-enrollment` | Teacher, Student | Đăng ký khuôn mặt |
| CourseDetail | `/courses/:courseId` | Admin, Teacher | Chi tiết khóa học |
| SessionDetail | `/session/:sessionId` | All | Chi tiết phiên học |

---

## 🌐 API Services

### `http.ts` - Axios Configuration
Central HTTP client với:
- **Base URL**: Từ env variable `REACT_APP_API_BASE_URL`
- **Timeout**: 20 seconds
- **Request Interceptor**:
  - Auto-inject JWT token vào header `Authorization`
  - Retrieve token từ Zustand store hoặc localStorage
- **Response Interceptor**:
  - Handle 401 → Auto logout
  - Display error modal cho mọi HTTP errors
  - Parse error messages từ backend

### Service Files

| File | Endpoints | Description |
|------|-----------|-------------|
| `auth.ts` | `/auth/login`, `/auth/register` | Authentication |
| `student.ts` | `/students/me`, `/students/{id}` | Single student |
| `students.ts` | `/students`, `/students/import` | Students management |
| `adminUsers.ts` | `/admin/users` | Admin users |
| `attendance.ts` | `/attendance/*` | Attendance operations |
| `courses.ts` | `/courses/*` | Course management |
| `enrollments.ts` | `/enrollments/*` | Student enrollments |
| `faculty.ts` | `/faculties/*` | Faculty management |
| `schedule.ts` | `/schedules/*` | Schedule management |
| `dashboard.ts` | `/dashboard/stats` | Dashboard statistics |
| `reports.ts` | `/reports/*` | Generate reports |
| `activityLogs.ts` | `/logs/activity` | Activity logs |
| `gemini.ts` | Gemini API | AI chatbot |
| `user.ts` | `/users/me` | Current user profile |

### Ví dụ sử dụng service:

```typescript
import { studentsApi } from '@/services/students';

// Fetch students
const students = await studentsApi.getAll();

// Create student
await studentsApi.create({
  studentCode: 'SV001',
  fullName: 'Nguyễn Văn A',
  email: 'a@student.edu.vn'
});
```

---

## 🗄️ State Management

Sử dụng **Zustand** với persist middleware để lưu state vào localStorage.

### Stores Overview

| Store | File | Purpose | Persisted |
|-------|------|---------|-----------|
| Auth | `useAuthStore.ts` | Authentication state | ✅ Yes |
| Students | `useStudentsStore.ts` | Student list & filters | ✅ Yes |
| Attendance | `useAttendanceStore.ts` | Attendance data | ✅ Yes |
| Faculty | `useFacultyStore.ts` | Selected faculty | ❌ No |
| Error | `useErrorStore.ts` | Global errors | ❌ No |

### 1. `useAuthStore` - Authentication State

```typescript
type AuthState = {
  token: string | null;
  isAuthed: boolean;
  user: User | null;
  
  // Actions
  getAccessToken: () => Promise<string | null>;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  setRole: (role: Role) => void;
  setUser: (user: User | null) => void;
};
```

**Features**:
- Persist token & user to localStorage
- Auto-inject token vào HTTP requests
- Auto-logout on token expiry

**Usage**:
```typescript
const { isAuthed, user, login, logout } = useAuthStore();

// Login
await login(username, password);

// Logout
logout();
```

### 2. `useStudentsStore` - Students Management

```typescript
type StudentsState = {
  students: Student[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchStudents: () => Promise<void>;
  createStudent: (data: CreateStudentRequest) => Promise<void>;
  updateStudent: (id: number, data: UpdateStudentRequest) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
};
```

### 3. `useAttendanceStore` - Attendance State

```typescript
type AttendanceState = {
  sessions: AttendanceSession[];
  currentSession: AttendanceSession | null;
  
  // Actions
  fetchSessions: () => Promise<void>;
  markAttendance: (sessionId: number, studentId: number) => Promise<void>;
  submitSession: (sessionId: number) => Promise<void>;
};
```

### 4. `useFacultyStore` - Faculty Selection

```typescript
type FacultyState = {
  selectedFaculty: Faculty | null;
  faculties: Faculty[];
  
  // Actions
  setFaculty: (faculty: Faculty) => void;
  fetchFaculties: () => Promise<void>;
};
```

### 5. `useErrorStore` - Global Error Handling

```typescript
type ErrorState = {
  error: ErrorInfo | null;
  
  // Actions
  show: (error: ErrorInfo) => void;
  clear: () => void;
};
```

---

## 🛡️ Routing và Bảo mật

### Route Guards

#### 1. `PublicOnly` - Public Routes Only
Redirect authenticated users to dashboard:
```typescript
<Route element={<PublicOnly />}>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
</Route>
```

#### 2. `RequireAuth` - Protected Routes
Require authentication, redirect to login if not:
```typescript
<Route element={<RequireAuth />}>
  <Route path="/" element={<MainLayout />}>
    {/* Protected pages */}
  </Route>
</Route>
```

#### 3. `RequireRole` - Role-Based Access
Require specific role(s):
```typescript
<Route element={<RequireRole allow={["ADMIN"]} />}>
  <Route path="/students" element={<Students />} />
</Route>

<Route element={<RequireRole allow={["ADMIN", "TEACHER"]} />}>
  <Route path="/attendance" element={<Attendance />} />
</Route>
```

### Security Features
- ✅ JWT token validation
- ✅ Auto-logout on 401
- ✅ Role-based page access
- ✅ Protected API calls
- ✅ XSS protection (React default)
- ✅ CSRF protection (token-based)

---

## 🎨 Styling và UI

### SCSS Architecture

#### `_variables.scss` - Design Tokens
```scss
// Colors
$primary: #4F46E5;
$secondary: #7C3AED;
$success: #10B981;
$warning: #F59E0B;
$danger: #EF4444;

// Spacing
$spacing-unit: 8px;
$spacing-xs: $spacing-unit * 0.5;  // 4px
$spacing-sm: $spacing-unit;         // 8px
$spacing-md: $spacing-unit * 2;     // 16px
$spacing-lg: $spacing-unit * 3;     // 24px
$spacing-xl: $spacing-unit * 4;     // 32px

// Typography
$font-family: 'Inter', -apple-system, sans-serif;
$font-size-base: 16px;

// Breakpoints
$breakpoint-mobile: 768px;
$breakpoint-tablet: 1024px;
$breakpoint-desktop: 1440px;
```

#### `_mixins.scss` - Reusable Patterns
```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin responsive($breakpoint) {
  @media (max-width: $breakpoint) {
    @content;
  }
}

@mixin card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: $spacing-lg;
}
```

#### `global.scss` - Global Styles
- CSS Reset
- Typography defaults
- Global utility classes
- Animations

### CSS Modules
Mỗi component có file `.module.scss` riêng:
```
Component.tsx
Component.module.scss
```

**Usage**:
```typescript
import styles from './Component.module.scss';

<div className={styles.container}>
  <h1 className={styles.title}>Hello</h1>
</div>
```

**Benefits**:
- Scoped styles (no conflicts)
- Type-safe (with TypeScript)
- Easy maintenance

---

## 🧪 Testing

### Test Setup
- **Test runner**: Jest
- **Testing library**: React Testing Library
- **Configuration**: `setupTests.ts`

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test Component.test.tsx
```

### Test Structure
```
src/
├── App.test.tsx         # App component test
├── setupTests.ts        # Test configuration
└── components/
    └── Component/
        ├── Component.tsx
        └── Component.test.tsx
```

### Example Test
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders app correctly', () => {
  render(<App />);
  const linkElement = screen.getByText(/student admin/i);
  expect(linkElement).toBeInTheDocument();
});
```

---

## 📦 Build & Deployment

### Development Build
```bash
npm start
```
- Starts dev server at `http://localhost:3000`
- Hot module replacement (HMR)
- Source maps enabled

### Production Build
```bash
npm run build
```
- Output: `build/` directory
- Minified & optimized
- Ready for deployment

### Deployment Options

#### 1. Static Hosting (Netlify, Vercel, GitHub Pages)
```bash
npm run build
# Upload build/ directory
```

#### 2. Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
```

#### 3. Nginx
```nginx
server {
  listen 80;
  root /var/www/html;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## 🔧 Cấu hình

### `tsconfig.json` - TypeScript Config
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### `package.json` - Scripts
```json
{
  "scripts": {
    "start": "react-scripts start",      // Dev server
    "build": "react-scripts build",      // Production build
    "test": "react-scripts test",        // Run tests
    "eject": "react-scripts eject"       // Eject from CRA
  }
}
```

---

## 📝 Best Practices

### Code Organization
- ✅ One component per file
- ✅ Co-locate styles with components
- ✅ Use TypeScript for type safety
- ✅ Keep components small and focused
- ✅ Extract reusable logic to hooks/utils

### State Management
- ✅ Use Zustand for global state
- ✅ Use local state for component-specific state
- ✅ Persist auth state to localStorage
- ✅ Clear state on logout

### API Calls
- ✅ Centralize API calls in service files
- ✅ Use interceptors for auth & errors
- ✅ Handle loading & error states
- ✅ Show user-friendly error messages

### Styling
- ✅ Use SCSS variables for consistency
- ✅ Use CSS modules for scoping
- ✅ Follow BEM naming convention
- ✅ Make responsive (mobile-first)

### Security
- ✅ Validate user input
- ✅ Sanitize data before rendering
- ✅ Use HTTPS in production
- ✅ Don't expose sensitive data in client
- ✅ Implement rate limiting (backend)

---

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes
3. Write/update tests
4. Run tests: `npm test`
5. Build: `npm run build`
6. Commit: `git commit -m "feat: add feature"`
7. Push: `git push origin feature/my-feature`
8. Create Pull Request

### Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

---

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng:
1. Check documentation
2. Search existing issues
3. Create new issue với detailed description

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- React team for amazing framework
- Zustand for simple state management
- Chart.js for beautiful charts
- Community contributors

---

**Built with ❤️ using React + TypeScript**
