/**
 * Convert backend error messages to user-friendly Vietnamese messages
 */
export const getErrorMessage = (error: any): string => {
  // If error is a string, return it
  if (typeof error === 'string') {
    return translateError(error)
  }

  // If error has a message property
  if (error?.message) {
    return translateError(error.message)
  }

  // If error has response data
  if (error?.response?.data?.message) {
    return translateError(error.response.data.message)
  }

  // Default error message
  return 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
}

/**
 * Translate common error messages to Vietnamese
 */
const translateError = (message: string): string => {
  const errorMap: Record<string, string> = {
    // Network errors
    'Network Error': 'Không thể kết nối đến máy chủ',
    'timeout': 'Yêu cầu quá thời gian chờ',
    'Failed to fetch': 'Không thể tải dữ liệu',
    
    // Authentication errors
    'Unauthorized': 'Phiên đăng nhập đã hết hạn',
    'Invalid credentials': 'Tên đăng nhập hoặc mật khẩu không đúng',
    'Token expired': 'Phiên đăng nhập đã hết hạn',
    'Access denied': 'Bạn không có quyền truy cập',
    
    // Validation errors
    'Required field': 'Vui lòng điền đầy đủ thông tin',
    'Invalid email': 'Email không hợp lệ',
    'Invalid phone': 'Số điện thoại không hợp lệ',
    'Password too short': 'Mật khẩu quá ngắn',
    
    // Resource errors
    'Not found': 'Không tìm thấy dữ liệu',
    'Already exists': 'Dữ liệu đã tồn tại',
    'Cannot delete': 'Không thể xóa',
    'Cannot update': 'Không thể cập nhật',
    
    // Course/Session errors
    'COURSE_NOT_FOUND': 'Không tìm thấy môn học',
    'SESSION_NOT_FOUND': 'Không tìm thấy buổi học',
    'SESSION_LOCKED': 'Buổi học đã bị khóa',
    'COURSE_SESSION_CONFLICT': 'Trùng lịch học',
    'ROOM_SESSION_CONFLICT': 'Phòng học đã được sử dụng',
    'INVALID_TIME_RANGE': 'Khoảng thời gian không hợp lệ',
    'END_TIME_MUST_BE_AFTER_START_TIME': 'Thời gian kết thúc phải sau thời gian bắt đầu',
    'START_DATE_AFTER_END_DATE': 'Ngày bắt đầu phải trước ngày kết thúc',
    'NO_SESSIONS_GENERATED': 'Không tạo được buổi học nào',
    
    // Attendance errors
    'ATTENDANCE_NOT_FOUND': 'Không tìm thấy bản ghi điểm danh',
    'ALREADY_CHECKED_IN': 'Đã điểm danh rồi',
    'TOO_EARLY': 'Chưa đến giờ điểm danh',
    'TOO_LATE': 'Đã quá giờ điểm danh',
    'OUT_OF_RANGE': 'Bạn không ở trong phạm vi điểm danh',
    
    // User errors
    'USER_NOT_FOUND': 'Không tìm thấy người dùng',
    'USERNAME_EXISTS': 'Tên đăng nhập đã tồn tại',
    'EMAIL_EXISTS': 'Email đã được sử dụng',
    
    // Faculty errors
    'FACULTY_NOT_FOUND': 'Không tìm thấy khoa',
    'FACULTY_CODE_EXISTS': 'Mã khoa đã tồn tại',
    
    // Enrollment errors
    'ENROLLMENT_NOT_FOUND': 'Không tìm thấy đăng ký',
    'ALREADY_ENROLLED': 'Đã đăng ký môn học này',
    'ENROLLMENT_FULL': 'Lớp học đã đầy',
  }

  // Check for exact match
  if (errorMap[message]) {
    return errorMap[message]
  }

  // Check for partial match
  for (const [key, value] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  // If no match found, return a generic message
  // Don't expose raw backend errors to users
  if (message.length > 100) {
    return 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
  }

  return message
}

/**
 * Get context-specific error message
 */
export const getContextualError = (context: string, error: any): string => {
  const baseMessage = getErrorMessage(error)
  
  const contextMessages: Record<string, string> = {
    'load': `Không thể tải ${context}`,
    'create': `Không thể tạo ${context}`,
    'update': `Không thể cập nhật ${context}`,
    'delete': `Không thể xóa ${context}`,
    'save': `Không thể lưu ${context}`,
  }

  // If we have a specific translated message, use it
  if (baseMessage !== 'Đã xảy ra lỗi. Vui lòng thử lại sau.') {
    return baseMessage
  }

  // Otherwise, use contextual message
  const action = context.split(' ')[0]
  return contextMessages[action] || baseMessage
}
