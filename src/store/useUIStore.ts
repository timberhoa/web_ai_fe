import { create } from 'zustand'

interface UIState {
    isTopbarVisible: boolean
    setTopbarVisible: (visible: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
    isTopbarVisible: true,
    setTopbarVisible: (visible) => set({ isTopbarVisible: visible }),
}))
