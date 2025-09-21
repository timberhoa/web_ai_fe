import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  timestamp: string;
  method: 'face_recognition' | 'manual';
  status: 'success' | 'failed';
}

interface AttendanceState {
  records: AttendanceRecord[];
  todayRecords: AttendanceRecord[];
  isScanning: boolean;
  isLoading: boolean;
  error: string | null;
  lastScanTime: string | null;
}

interface AttendanceActions {
  // Attendance Operations
  markAttendance: (studentId: string, studentName: string, studentClass: string, method: 'face_recognition' | 'manual') => void;
  startScanning: () => void;
  stopScanning: () => void;
  
  // Data Management
  getTodayRecords: () => AttendanceRecord[];
  getRecordsByDate: (date: string) => AttendanceRecord[];
  getRecordsByStudent: (studentId: string) => AttendanceRecord[];
  
  // Statistics
  getTodayAttendanceCount: () => number;
  getAttendanceRate: () => number;
  getSuccessRate: () => number;
  
  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

type AttendanceStore = AttendanceState & AttendanceActions;

// Mock data for today's attendance
const mockTodayRecords: AttendanceRecord[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Nguyễn Văn An',
    studentClass: 'CNTT-01',
    timestamp: '2024-01-21T08:30:00Z',
    method: 'face_recognition',
    status: 'success',
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Trần Thị Bình',
    studentClass: 'CNTT-01',
    timestamp: '2024-01-21T08:32:00Z',
    method: 'face_recognition',
    status: 'success',
  },
  {
    id: '3',
    studentId: '4',
    studentName: 'Phạm Thị Dung',
    studentClass: 'CNTT-02',
    timestamp: '2024-01-21T08:35:00Z',
    method: 'manual',
    status: 'success',
  },
  {
    id: '4',
    studentId: '5',
    studentName: 'Hoàng Văn Em',
    studentClass: 'CNTT-03',
    timestamp: '2024-01-21T08:40:00Z',
    method: 'face_recognition',
    status: 'success',
  },
  {
    id: '5',
    studentId: '7',
    studentName: 'Đặng Văn Giang',
    studentClass: 'CNTT-01',
    timestamp: '2024-01-21T08:45:00Z',
    method: 'face_recognition',
    status: 'success',
  },
  {
    id: '6',
    studentId: '8',
    studentName: 'Bùi Thị Hoa',
    studentClass: 'CNTT-02',
    timestamp: '2024-01-21T08:50:00Z',
    method: 'manual',
    status: 'success',
  },
];

export const useAttendanceStore = create<AttendanceStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      records: mockTodayRecords,
      todayRecords: mockTodayRecords,
      isScanning: false,
      isLoading: false,
      error: null,
      lastScanTime: null,

      // Attendance Operations
      markAttendance: (studentId, studentName, studentClass, method) => {
        const newRecord: AttendanceRecord = {
          id: Date.now().toString(),
          studentId,
          studentName,
          studentClass,
          timestamp: new Date().toISOString(),
          method,
          status: 'success',
        };

        set((state) => ({
          records: [...state.records, newRecord],
          todayRecords: [...state.todayRecords, newRecord],
          lastScanTime: newRecord.timestamp,
        }));
      },

      startScanning: () => {
        set({ isScanning: true, error: null });
      },

      stopScanning: () => {
        set({ isScanning: false });
      },

      // Data Management
      getTodayRecords: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        return state.records.filter((record) =>
          record.timestamp.startsWith(today)
        );
      },

      getRecordsByDate: (date) => {
        const state = get();
        return state.records.filter((record) =>
          record.timestamp.startsWith(date)
        );
      },

      getRecordsByStudent: (studentId) => {
        const state = get();
        return state.records.filter((record) => record.studentId === studentId);
      },

      // Statistics
      getTodayAttendanceCount: () => {
        const state = get();
        return state.todayRecords.length;
      },

      getAttendanceRate: () => {
        const state = get();
        // This would typically compare with total students, but for demo purposes
        // we'll use a mock total of 8 students
        const totalStudents = 8;
        const attendedToday = state.todayRecords.length;
        return totalStudents > 0 ? (attendedToday / totalStudents) * 100 : 0;
      },

      getSuccessRate: () => {
        const state = get();
        const totalRecords = state.records.length;
        const successfulRecords = state.records.filter(
          (record) => record.status === 'success'
        ).length;
        return totalRecords > 0 ? (successfulRecords / totalRecords) * 100 : 0;
      },

      // Utility
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          records: mockTodayRecords,
          todayRecords: mockTodayRecords,
          isScanning: false,
          isLoading: false,
          error: null,
          lastScanTime: null,
        });
      },
    }),
    {
      name: 'attendance-store',
    }
  )
);
