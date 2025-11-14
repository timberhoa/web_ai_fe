import * as XLSX from 'xlsx';
import type { AttendanceReportResponse, SessionReportResponse, AttendanceDetail } from '../services/reports';

/**
 * Enhanced Excel export for Attendance Reports with beautiful formatting
 */
export const exportAttendanceReportToExcel = async (
  report: AttendanceReportResponse,
  downloadFromServer?: (reportId: string, params: any) => Promise<Blob>
): Promise<void> => {
  // If server export is available, use it
  if (downloadFromServer) {
    try {
      const params: any = {};
      if (report.courseId) params.courseId = report.courseId;
      if (report.sessionId) params.sessionId = report.sessionId;
      if (report.studentId) params.studentId = report.studentId;
      if (report.fromDate) params.fromDate = report.fromDate;
      if (report.toDate) params.toDate = report.toDate;

      const blob = await downloadFromServer(report.reportId, params);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BaoCaoDiemDanh_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    } catch (error) {
      console.warn('Server export failed, falling back to client-side export', error);
    }
  }

  // Client-side export with formatting
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const generatedDate = new Date(report.generatedAt).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatDateForExcel = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const summaryData = [
    ['BÁO CÁO ĐIỂM DANH'],
    [],
    ['Thông tin báo cáo'],
    ['Tiêu đề:', report.title],
    ['Loại báo cáo:', 'Báo cáo điểm danh (ATTENDANCE)'],
    ['Thời gian tạo:', generatedDate],
    ['Người tạo:', report.generatedBy],
    [],
    ['Thông tin lọc'],
    ['Môn học:', report.courseName || report.courseCode || '-'],
    ['Mã môn học:', report.courseCode || '-'],
    ['Buổi học:', report.sessionId ? `${report.sessionId.substring(0, 8)}...` : 'Tất cả'],
    ['Sinh viên:', report.studentName || 'Tất cả'],
    ['Từ ngày:', formatDateForExcel(report.fromDate)],
    ['Đến ngày:', formatDateForExcel(report.toDate)],
    [],
    ['Thống kê tổng quan'],
    ['Tổng số buổi học:', report.totalSessions],
    ['Tổng số sinh viên:', report.totalStudents],
    ['Có mặt:', report.presentCount],
    ['Đi muộn:', report.lateCount],
    ['Vắng mặt:', report.absentCount],
    ['Có phép:', report.excusedCount],
    ['Tỷ lệ điểm danh:', `${report.attendanceRate.toFixed(2)}%`],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths for summary - better formatting
  summarySheet['!cols'] = [
    { wch: 25 }, // Label column
    { wch: 45 }, // Value column
  ];

  // Set row heights (Excel.js doesn't directly support this, but we can try with cell styles)
  // Note: XLSX.js has limited styling support, but we can improve data structure

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

  // Details Sheet
  if (report.details && report.details.length > 0) {
    const detailsHeaders = [
      'STT',
      'Buổi học',
      'Thời gian bắt đầu',
      'Thời gian kết thúc',
      'Phòng học',
      'Mã SV',
      'Họ tên',
      'Email',
      'Trạng thái',
      'Thời gian check-in',
      'Ghi chú',
    ];

    const formatDateTimeForExcel = (dateStr: string) => {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const detailsData = report.details.map((detail, index) => [
      index + 1,
      detail.sessionId.substring(0, 8) + '...',
      formatDateTimeForExcel(detail.sessionStartTime),
      formatDateTimeForExcel(detail.sessionEndTime),
      detail.roomName || '-',
      detail.studentId.substring(0, 8) + '...',
      detail.studentName,
      detail.studentEmail,
      getStatusLabel(detail.status),
      detail.checkedAt ? formatDateTimeForExcel(detail.checkedAt) : '-',
      detail.note || '-',
    ]);

    const detailsSheet = XLSX.utils.aoa_to_sheet([detailsHeaders, ...detailsData]);
    
    // Set column widths - optimized for readability
    detailsSheet['!cols'] = [
      { wch: 6 },   // STT
      { wch: 18 },  // Buổi học (ID)
      { wch: 22 },  // Thời gian bắt đầu
      { wch: 22 },  // Thời gian kết thúc
      { wch: 12 },  // Phòng học
      { wch: 18 },  // Mã SV
      { wch: 28 },  // Họ tên
      { wch: 32 },  // Email
      { wch: 14 },  // Trạng thái
      { wch: 22 },  // Thời gian check-in
      { wch: 35 },  // Ghi chú
    ];

    // Freeze first row for better scrolling
    detailsSheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

    // Auto-filter can be enabled (though limited in XLSX.js)
    // Note: Excel will need to apply filters manually, but the structure supports it

    XLSX.utils.book_append_sheet(workbook, detailsSheet, 'Chi tiết điểm danh');
  }

  // Generate and download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `BaoCaoDiemDanh_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Enhanced Excel export for Session Reports with beautiful formatting
 */
export const exportSessionReportToExcel = async (
  report: SessionReportResponse,
  downloadFromServer?: (reportId: string, params: any) => Promise<Blob>
): Promise<void> => {
  // If server export is available, use it
  if (downloadFromServer) {
    try {
      const params: any = {};
      if (report.courseId) params.courseId = report.courseId;
      if (report.teacherId) params.teacherId = report.teacherId;
      if (report.fromDate) params.fromDate = report.fromDate;
      if (report.toDate) params.toDate = report.toDate;

      const blob = await downloadFromServer(report.reportId, params);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BaoCaoBuoiHoc_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return;
    } catch (error) {
      console.warn('Server export failed, falling back to client-side export', error);
    }
  }

  // Client-side export with formatting
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const generatedDate = new Date(report.generatedAt).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatDateForExcel = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const summaryData = [
    ['BÁO CÁO BUỔI HỌC'],
    [],
    ['Thông tin báo cáo'],
    ['Tiêu đề:', report.title],
    ['Loại báo cáo:', 'Báo cáo buổi học (SESSION)'],
    ['Thời gian tạo:', generatedDate],
    ['Người tạo:', report.generatedBy],
    [],
    ['Thông tin lọc'],
    ['Môn học:', report.courseName || report.courseCode || '-'],
    ['Mã môn học:', report.courseCode || '-'],
    ['Giảng viên:', report.teacherName || 'Tất cả'],
    ['Từ ngày:', formatDateForExcel(report.fromDate)],
    ['Đến ngày:', formatDateForExcel(report.toDate)],
    [],
    ['Thống kê tổng quan'],
    ['Tổng số buổi học:', report.totalSessions],
    ['Tổng số sinh viên:', report.totalStudents],
    ['Tổng có mặt:', report.totalPresent],
    ['Tổng đi muộn:', report.totalLate],
    ['Tổng vắng mặt:', report.totalAbsent],
    ['Tổng có phép:', report.totalExcused],
    ['Tỷ lệ điểm danh trung bình:', `${report.averageAttendanceRate.toFixed(2)}%`],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths - better formatting
  summarySheet['!cols'] = [
    { wch: 30 }, // Label column
    { wch: 45 }, // Value column
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

  // Sessions Sheet
  if (report.sessions && report.sessions.length > 0) {
    const sessionsHeaders = [
      'STT',
      'Mã buổi học',
      'Thời gian bắt đầu',
      'Thời gian kết thúc',
      'Phòng học',
      'Trạng thái',
      'Tổng số SV',
      'Có mặt',
      'Đi muộn',
      'Vắng mặt',
      'Có phép',
      'Tỷ lệ điểm danh (%)',
    ];

    const formatDateTimeForExcel = (dateStr: string) => {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const sessionsData = report.sessions.map((session, index) => [
      index + 1,
      session.sessionId.substring(0, 8) + '...',
      formatDateTimeForExcel(session.startTime),
      formatDateTimeForExcel(session.endTime),
      session.roomName || '-',
      session.locked ? 'Đã khóa' : 'Mở',
      session.totalEnrolled,
      session.presentCount,
      session.lateCount,
      session.absentCount,
      session.excusedCount,
      session.attendanceRate.toFixed(2),
    ]);

    const sessionsSheet = XLSX.utils.aoa_to_sheet([sessionsHeaders, ...sessionsData]);
    
    // Set column widths - optimized for readability
    sessionsSheet['!cols'] = [
      { wch: 6 },   // STT
      { wch: 18 },  // Mã buổi học
      { wch: 22 },  // Thời gian bắt đầu
      { wch: 22 },  // Thời gian kết thúc
      { wch: 12 },  // Phòng học
      { wch: 12 },  // Trạng thái
      { wch: 12 },  // Tổng số SV
      { wch: 10 },  // Có mặt
      { wch: 10 },  // Đi muộn
      { wch: 10 },  // Vắng mặt
      { wch: 10 },  // Có phép
      { wch: 18 },  // Tỷ lệ điểm danh
    ];

    // Freeze first row for better scrolling
    sessionsSheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

    XLSX.utils.book_append_sheet(workbook, sessionsSheet, 'Chi tiết buổi học');
  }

  // Generate and download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `BaoCaoBuoiHoc_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Helper function to get Vietnamese label for attendance status
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PRESENT: 'Có mặt',
    LATE: 'Đi muộn',
    ABSENT: 'Vắng mặt',
    EXCUSED: 'Có phép',
  };
  return labels[status] || status;
}

