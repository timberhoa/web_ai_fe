import { create } from "zustand";
import { persist } from "zustand/middleware";
import { facultyApi, type Faculty } from "../services/faculty";

type FacultyState = {
  facultyList: Faculty[];
  loading: boolean;
  error: string | null;
  fetchFacultyList: () => Promise<Faculty[]>;
  getFacultyList: () => Faculty[];
  setFacultyList: (faculties: Faculty[]) => void;
  addFaculty: (faculty: Faculty) => void;
  updateFaculty: (id: string, faculty: Faculty) => void;
  removeFaculty: (id: string) => void;
};

export const useFacultyStore = create<FacultyState>()(
  persist(
    (set, get) => ({
      facultyList: [] as Faculty[],
      loading: false,
      error: null,

      async fetchFacultyList() {
        set({ loading: true, error: null });
        try {
          const faculties = await facultyApi.getFacultyList();
          set({ facultyList: faculties, loading: false });
          return faculties;
        } catch (error: any) {
          set({ error: error?.message ?? 'Không thể tải danh sách khoa', loading: false });
          throw error;
        }
      },

      getFacultyList(): Faculty[] {
        return get().facultyList;
      },

      setFacultyList(faculties: Faculty[]) {
        set({ facultyList: faculties });
      },

      addFaculty(faculty: Faculty) {
        set((state) => ({ facultyList: [faculty, ...state.facultyList] }));
      },

      updateFaculty(id: string, faculty: Faculty) {
        set((state) => ({
          facultyList: state.facultyList.map((f) => (f.id === id ? faculty : f))
        }));
      },

      removeFaculty(id: string) {
        set((state) => ({
          facultyList: state.facultyList.filter((f) => f.id !== id)
        }));
      }
    }),
    {
      name: "faculty-store",
    }
  )
);