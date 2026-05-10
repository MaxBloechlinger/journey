import { create } from 'zustand'

interface UIStore {
  aiSidebarOpen: boolean
  authModalOpen: boolean
  mobileMapOpen: boolean
  activeSegmentId: string | null
  editingItemId: string | null

  toggleAISidebar: () => void
  openAuthModal: () => void
  closeAuthModal: () => void
  toggleMobileMap: () => void
  setActiveSegment: (id: string | null) => void
  setEditingItem: (id: string | null) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  aiSidebarOpen: false,
  authModalOpen: false,
  mobileMapOpen: false,
  activeSegmentId: null,
  editingItemId: null,

  toggleAISidebar: () => set((s) => ({ aiSidebarOpen: !s.aiSidebarOpen })),
  openAuthModal: () => set({ authModalOpen: true }),
  closeAuthModal: () => set({ authModalOpen: false }),
  toggleMobileMap: () => set((s) => ({ mobileMapOpen: !s.mobileMapOpen })),
  setActiveSegment: (id) => set({ activeSegmentId: id }),
  setEditingItem: (id) => set({ editingItemId: id }),
}))
