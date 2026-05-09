import { create } from 'zustand'

interface UIStore {
  aiSidebarOpen: boolean
  authModalOpen: boolean
  activeSegmentId: string | null
  editingItemId: string | null

  toggleAISidebar: () => void
  openAuthModal: () => void
  closeAuthModal: () => void
  setActiveSegment: (id: string | null) => void
  setEditingItem: (id: string | null) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  aiSidebarOpen: false,
  authModalOpen: false,
  activeSegmentId: null,
  editingItemId: null,

  toggleAISidebar: () => set((s) => ({ aiSidebarOpen: !s.aiSidebarOpen })),
  openAuthModal: () => set({ authModalOpen: true }),
  closeAuthModal: () => set({ authModalOpen: false }),
  setActiveSegment: (id) => set({ activeSegmentId: id }),
  setEditingItem: (id) => set({ editingItemId: id }),
}))
