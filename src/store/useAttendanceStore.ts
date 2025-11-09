import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  attendanceApi,
  type AttendanceRecordDTO,
  type AttendanceMethod,
  type AttendanceStatus,
} from '../services/attendance';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentClass?: string;
  timestamp: string;
  method?: AttendanceMethod | 'face_recognition' | 'manual';
  status: AttendanceStatus;
  note?: string;
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
  markAttendance: (
    studentId: string,
    studentName: string,
    studentClass: string,
    method: AttendanceMethod | 'face_recognition' | 'manual'
  ) => void;
  startScanning: () => void;
  stopScanning: () => void;
  fetchToday: () => Promise<void>;
  
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
    studentName: 'Nguy??.n V??n An',
    studentClass: 'CNTT-01',
    timestamp: '2024-01-21T08:30:00Z',
    method: 'FACE_RECOGNITION',
    status: 'PRESENT',
  },
  {
    id: '2',
    studentId: '2',
    studentName: 'Tr??n Th??< BA?nh',
    studentClass: 'CNTT-01',
    timestamp: '2024-01-21T08:32:00Z',
    method: 'FACE_RECOGNITION',
    status: 'PRESENT',
  },
  {
    id: '3',
    studentId: '4',
    studentName: 'Ph???m Th??< Dung',
    studentClass: 'CNTT-02',
    timestamp: '2024-01-21T08:35:00Z',
    method: 'MANUAL',
    status: 'LATE',
  },
  {
    id: '4',
    studentId: '5',
    studentName: 'HoA?ng V??n Em',
    studentClass: 'CNTT-03',
    timestamp: '2024-01-21T08:40:00Z',
    method: 'FACE_RECOGNITION',
    status: 'PRESENT',
  },
  {
    id: '5',
    studentId: '7',
    studentName: '?????ng V??n Giang',
    studentClass: 'CNTT-01',
    timestamp: '2024-01-21T08:45:00Z',
    method: 'FACE_RECOGNITION',
    status: 'EXCUSED',
  },
  {
    id: '6',
    studentId: '8',
    studentName: 'BA1i Th??< Hoa',
    studentClass: 'CNTT-02',
    timestamp: '2024-01-21T08:50:00Z',
    method: 'MANUAL',
    status: 'ABSENT',
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
        const normalizedMethod =
          method === 'face_recognition'
            ? 'FACE_RECOGNITION'
            : method === 'manual'
            ? 'MANUAL'
            : method;

        const newRecord: AttendanceRecord = {
          id: Date.now().toString(),
          studentId,
          studentName,
          studentClass,
          timestamp: new Date().toISOString(),
          method: normalizedMethod,
          status: 'PRESENT',
        };

        set((state) => ({
          records: [...state.records, newRecord],
          todayRecords: [...state.todayRecords, newRecord],
          lastScanTime: newRecord.timestamp,
        }));
      },

      fetchToday: async () => {
        set({ isLoading: true, error: null })
        try {
          const data = await attendanceApi.today()
          const mapped = (data as AttendanceRecordDTO[]).map((r) => ({
            id: r.id,
            studentId: r.studentId,
            studentName: r.studentName,
            studentClass: r.studentClass,
            timestamp: r.timestamp ?? r.markedAt ?? new Date().toISOString(),
            method: (r.method ?? 'FACE_RECOGNITION') as AttendanceRecord['method'],
            status: r.status,
            note: r.note,
          })) as AttendanceRecord[]
          set({ todayRecords: mapped, isLoading: false })
        } catch (e: any) {
          set({ isLoading: false, error: e?.message ?? 'Failed to load attendance' })
        }
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
        return state.todayRecords.filter((record) => record.status !== 'ABSENT').length;
      },

      getAttendanceRate: () => {
        const state = get();
        const totalStudents = 8;
        const attendedToday = state.todayRecords.filter((record) => record.status !== 'ABSENT').length;
        return totalStudents > 0 ? (attendedToday / totalStudents) * 100 : 0;
      },

      getSuccessRate: () => {
        const state = get();
        const totalRecords = state.records.length;
        const successfulRecords = state.records.filter((record) => record.status === 'PRESENT').length;
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
