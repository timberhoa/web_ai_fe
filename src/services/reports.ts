import http from './http';
import type { Page } from './adminUsers';

export type ReportType = 'ATTENDANCE' | 'SESSION';

export type ReportFilterRequest = {
  reportType?: ReportType;
  courseId?: string;
  sessionId?: string;
  studentId?: string;
  teacherId?: string;
  fromDate?: string; // ISO8601 datetime
  toDate?: string; // ISO8601 datetime
  includeDetails?: boolean;
};

export type AttendanceDetail = {
  sessionId: string;
  sessionStartTime: string;
  sessionEndTime: string;
  roomName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  checkedAt: string;
  note?: string;
};

export type AttendanceReportResponse = {
  reportId: string;
  reportType: 'ATTENDANCE';
  title: string;
  generatedAt: string;
  generatedBy: string;
  courseId?: string;
  courseName?: string;
  courseCode?: string;
  sessionId?: string;
  studentId?: string;
  studentName?: string;
  fromDate: string;
  toDate: string;
  totalSessions: number;
  totalStudents: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number; // %
  details?: AttendanceDetail[];
};

export type SessionReportItem = {
  sessionId: string;
  startTime: string;
  endTime: string;
  roomName: string;
  locked: boolean;
  totalEnrolled: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number;
};

export type SessionReportResponse = {
  reportId: string;
  reportType: 'SESSION';
  title: string;
  generatedAt: string;
  generatedBy: string;
  courseId?: string;
  courseName?: string;
  courseCode?: string;
  teacherId?: string;
  teacherName?: string;
  fromDate: string;
  toDate: string;
  totalSessions: number;
  totalStudents: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalExcused: number;
  averageAttendanceRate: number;
  sessions?: SessionReportItem[];
};

export type ReportListResponse = {
  reportId: string;
  reportType: ReportType;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  sessionId?: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  generatedBy: string;
  totalRecords: number;
};

export const reportsApi = {
  // Attendance Reports
  async getAttendanceReport(params: {
    courseId?: string;
    sessionId?: string;
    studentId?: string;
    fromDate?: string;
    toDate?: string;
    includeDetails?: boolean;
  }): Promise<AttendanceReportResponse> {
    const { includeDetails = true, ...queryParams } = params;
    const { data } = await http.get<AttendanceReportResponse>('/reports/attendance', {
      params: { ...queryParams, includeDetails },
    });
    return data;
  },

  async generateAttendanceReport(request: ReportFilterRequest): Promise<AttendanceReportResponse> {
    const { data } = await http.post<AttendanceReportResponse>('/reports/attendance/generate', request);
    return data;
  },

  async downloadAttendanceReport(
    reportId: string,
    params: {
      courseId?: string;
      sessionId?: string;
      studentId?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<Blob> {
    const { data } = await http.get(`/reports/attendance/${reportId}/download`, {
      params,
      responseType: 'blob',
    });
    return data;
  },

  // Session Reports
  async getSessionReport(params: {
    courseId?: string;
    teacherId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<SessionReportResponse> {
    const { data } = await http.get<SessionReportResponse>('/reports/sessions', {
      params,
    });
    return data;
  },

  async generateSessionReport(request: ReportFilterRequest): Promise<SessionReportResponse> {
    const { data } = await http.post<SessionReportResponse>('/reports/sessions/generate', request);
    return data;
  },

  async downloadSessionReport(
    reportId: string,
    params: {
      courseId?: string;
      teacherId?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<Blob> {
    const { data } = await http.get(`/reports/sessions/${reportId}/download`, {
      params,
      responseType: 'blob',
    });
    return data;
  },

  // Report Catalog
  async listReports(params: {
    reportType?: ReportType;
    courseId?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<Page<ReportListResponse>> {
    const { page = 0, size = 20, sort = 'generatedAt,desc', ...filters } = params;
    const { data } = await http.get<Page<ReportListResponse>>('/reports', {
      params: { ...filters, page, size, sort },
    });
    return data;
  },
};

export default reportsApi;

