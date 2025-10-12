import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  authApi,
  type LoginRequest,
  type RegisterRequest,
  type User,
  type Role,
} from "../services/auth";

type AuthState = {
  token: string | null;
  isAuthed: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  setRole: (role: Role) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthed: false,
      user: null,

      async login(username, password) {
        const res = await authApi.login({ username, password } as LoginRequest);
        set({ token: res.token, user: res.user, isAuthed: true });
      },

      setRole: (role) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, role } as User });
        }
      },

      async register(payload) {
        const res = await authApi.register(payload);
        set({ token: res.token, user: res.user, isAuthed: true });
      },

      logout() {
        set({ token: null, isAuthed: false, user: null });
        // Storage is managed by persist; removing key is optional
        try { localStorage.removeItem("auth-store"); } catch {}
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthed: state.isAuthed,
      }),
    }
  )
);
