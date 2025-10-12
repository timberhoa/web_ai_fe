import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { studentsApi, type StudentDTO } from '../services/students';

export type Student = {
  id: string;
  name: string;
  class: string;
  status: 'attended' | 'absent';
};

type StudentsState = {
  students: Student[];
  searchQuery: string;
  selectedClass: string | null;
  isLoading: boolean;
  error: string | null;
};

type StudentsActions = {
  // CRUD
  addStudent: (s: Student) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // CRUD via API
  fetchStudents: () => Promise<void>;
  createStudent: (payload: Omit<Student, 'id'>) => Promise<void>;
  saveStudent: (id: string, patch: Partial<Student>) => Promise<void>;
  removeStudent: (id: string) => Promise<void>;

  // Filter
  setSearchQuery: (query: string) => void;
  setSelectedClass: (selectedClass: string | null) => void;
  getFilteredStudents: () => Student[];

  // Statistics
  getStudentsCount: () => number;
  getClassesCount: () => number;
  getAttendedTodayCount: () => number;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

type StudentsStore = StudentsState & StudentsActions;

const mockStudents: Student[] = [
  { id: '1', name: 'Nguyễn Văn A', class: '12A1', status: 'attended' },
  { id: '2', name: 'Trần Thị B', class: '12A1', status: 'absent' },
  { id: '3', name: 'Lê Văn C', class: '11C2', status: 'attended' },
];

export const useStudentsStore = create<StudentsStore>()(
  persist(
    (set, get) => ({
      // state
      students: mockStudents,
      searchQuery: '',
      selectedClass: null,
      isLoading: false,
      error: null,

      // actions (local)
      addStudent: (s) =>
        set((st) => ({ students: [...st.students, s] })),

      updateStudent: (id, patch) =>
        set((st) => ({
          students: st.students.map((it) =>
            it.id === id ? { ...it, ...patch } : it
          ),
        })),

      deleteStudent: (id) =>
        set((st) => ({
          students: st.students.filter((it) => it.id !== id),
        })),

      // actions (API)
      fetchStudents: async () => {
        set({ isLoading: true, error: null })
        try {
          const data = await studentsApi.list()
          set({ students: data as Student[], isLoading: false })
        } catch (e: any) {
          // keep current mock on failure
          set({ isLoading: false, error: e?.message ?? 'Failed to load students' })
        }
      },

      createStudent: async (payload) => {
        set({ isLoading: true, error: null })
        try {
          const created = await studentsApi.create(payload as Omit<StudentDTO, 'id'>)
          set((st) => ({ students: [...st.students, created as Student], isLoading: false }))
        } catch (e: any) {
          set({ isLoading: false, error: e?.message ?? 'Failed to create student' })
        }
      },

      saveStudent: async (id, patch) => {
        set({ isLoading: true, error: null })
        try {
          const updated = await studentsApi.update(id, patch)
          set((st) => ({
            students: st.students.map((it) => (it.id === id ? { ...it, ...(updated as any) } : it)),
            isLoading: false,
          }))
        } catch (e: any) {
          set({ isLoading: false, error: e?.message ?? 'Failed to update student' })
        }
      },

      removeStudent: async (id) => {
        set({ isLoading: true, error: null })
        try {
          await studentsApi.remove(id)
          set((st) => ({ students: st.students.filter((it) => it.id !== id), isLoading: false }))
        } catch (e: any) {
          set({ isLoading: false, error: e?.message ?? 'Failed to delete student' })
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedClass: (selectedClass) => set({ selectedClass }),

      getFilteredStudents: () => {
        const st = get();
        let filtered = st.students;

        if (st.searchQuery) {
          const q = st.searchQuery.toLowerCase();
          filtered = filtered.filter((s) =>
            s.name.toLowerCase().includes(q)
          );
        }
        if (st.selectedClass) {
          filtered = filtered.filter(
            (s) => s.class === st.selectedClass
          );
        }
        return filtered;
      },

      // statistics
      getStudentsCount: () => get().students.length,

      getClassesCount: () => {
        const classes = new Set(get().students.map((s) => s.class));
        return classes.size;
      },

      getAttendedTodayCount: () =>
        get().students.filter((s) => s.status === 'attended').length,

      // utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      reset: () =>
        set({
          students: mockStudents,
          searchQuery: '',
          selectedClass: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'students-store',
    }
  )
);
