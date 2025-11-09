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
  getAccessToken: () => Promise<string | null>;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  setRole: (role: Role) => void;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthed: false,
      user: null,

      async getAccessToken() {
        const inMemory = get().token;
        if (inMemory) return inMemory;
        try {
          const raw = localStorage.getItem("auth-store");
          if (raw) {
            const parsed = JSON.parse(raw);
            const token = parsed?.state?.token as string | null | undefined;
            return token ?? null;
          }
        } catch {}
        return null;
      },

      async login(username, password) {
        const res = await authApi.login({ username, password } as LoginRequest);
        set({ token: res.accessToken, isAuthed: true });
      },

      setRole: (role) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, role } as User });
        }
      },

      setUser(user) {
        set({ user });
      },

      async register(payload) {
         await authApi.register(payload);
      },

      logout() {
        set({ token: null, isAuthed: false, user: null });
        try { localStorage.removeItem("auth-store"); } catch {
          throw new Error("Can not log out successfully.");
        }
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
