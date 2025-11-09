import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard/Dashboard';
import Students from '../pages/Admin/Students/Students';
import Users from '../pages/Admin/Users';
import Lecturers from '../pages/Admin/Lecturers';
import Classes from '../pages/Admin/Classes';
import Courses from '../pages/Admin/Courses';
import Schedule from '../pages/Admin/Schedule';
import Attendance from '../pages/Attendance/Attendance';
import AttendanceMonitor from '../pages/Admin/AttendanceMonitor';
import AttendanceReview from '../pages/Admin/AttendanceReview';
import FacesSettings from '../pages/Admin/FacesSettings';
import AuditLogs from '../pages/Admin/AuditLogs';
import Settings from '../pages/Settings/Settings';
import Login from '../pages/Login/Login';
import NotFound from '../pages/NotFound/NotFound';
import Register from '../pages/Register/Register';
import { PublicOnly, RequireAuth, RequireRole } from '../components/RouteGuards';
import MyClasses from '../pages/Teacher/MyClasses';
import MyClassDetail from '../pages/Teacher/MyClassDetail';
import Sessions from '../pages/Teacher/Sessions';
import AttendanceToday from '../pages/Teacher/AttendanceToday';
import AttendanceSession from '../pages/Teacher/AttendanceSession';
import AdminReports from '../pages/Admin/Reports';
import MySchedule from '../pages/Student/MySchedule';
import MyAttendance from '../pages/Student/MyAttendance';
import MyProfile from '../pages/Student/MyProfile';
import FaceEnrollment from '../pages/FaceEnrollment/FaceEnrollment';



export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public-only auth routes */}
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected app routes */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />

            {/* Shared routes */}
            <Route element={<RequireRole allow={["ADMIN", "TEACHER"]} />}>
              <Route path="attendance" element={<Attendance />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>
            <Route element={<RequireRole allow={["TEACHER", "STUDENT"]} />}>
              <Route path="face-enrollment" element={<FaceEnrollment />} />
            </Route>
             <Route element={<RequireRole allow={["TEACHER", "STUDENT", "ADMIN"]} />}>
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Admin only */}
            <Route element={<RequireRole allow={["ADMIN"]} />}>
              <Route path="users" element={<Users />} />
              <Route path="students" element={<Students />} />
              <Route path="lecturers" element={<Lecturers />} />
              <Route path="classes" element={<Classes />} />
              <Route path="courses" element={<Courses />} />
              <Route path="schedule" element={<Schedule />} />
              {/* <Route path="attendance/monitor" element={<AttendanceMonitor />} /> */}
              <Route path="attendance/review" element={<AttendanceReview />} />
              <Route path="faces" element={<FacesSettings />} />
              <Route path="audit-logs" element={<AuditLogs />} />
            </Route>

            {/* Teacher only */}
            <Route element={<RequireRole allow={["TEACHER"]} />}>
              <Route path="my-classes" element={<MyClasses />} />
              <Route path="my-classes/:id" element={<MyClassDetail />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="attendance-today" element={<AttendanceToday />} />
              <Route path="attendance/:sessionId" element={<AttendanceSession />} />
            </Route>

            {/* Student only */}
            <Route element={<RequireRole allow={["STUDENT"]} />}>
              <Route path="my-schedule" element={<MySchedule />} />
              <Route path="my-attendance" element={<MyAttendance />} />
              <Route path="my-profile" element={<MyProfile />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
