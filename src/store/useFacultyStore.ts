import { create } from "zustand";
import { persist } from "zustand/middleware";
import { facultyApi } from "../services/faculty";

type Factulty = {
  id: string,
    code?: string,
    name?: string
}

type FacultyState = {
  facultyList: Factulty[];
  fetchFacultyList: () => Promise<Factulty[]>;
  getFacultyList: () => Factulty[];
  setFacultyList: (faculties:Factulty[]) => void;
};

export const useFacultyStore = create<FacultyState>()(
  persist(
    (set, get) => ({
      facultyList: [] as Factulty[],
      async fetchFacultyList() {
        const faculties = await facultyApi.getFacultyList();
        set({ facultyList: faculties.data as Factulty[] });
        return faculties.data;
      },

      getFacultyList(): Factulty[] {
        return get().facultyList;
      },

      setFacultyList(faculties: Factulty[]) {
        set({ facultyList: faculties });
      }
    }),
    {
      name: "faculty-store",
    }
  )
);