import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = { id: string; email: string } | null

type AuthState = {
    isAuthed: boolean
    user: User
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthed: false,
            user: null,

            // Demo login: bạn thay validate thật ở đây (gọi API, v.v.)
            async login(email, password) {
                // ví dụ demo: đúng nếu không rỗng, hoặc hardcode:
                // if (email === 'admin@demo.com' && password === '123456') { ... }
                if (email && password) {
                    set({ isAuthed: true, user: { id: '1', email } })
                } else {
                    throw new Error('Email/Mật khẩu không hợp lệ')
                }
            },

            logout() {
                set({ isAuthed: false, user: null })
            },
        }),
        { name: 'auth-store' }
    )
)
