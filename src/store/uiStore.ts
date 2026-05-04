import { create } from 'zustand'

interface UIStore {
  aiSidebarOpen: boolean
  activeSegmentId: string | null
  editingItemId: string | null

  toggleAISidebar: () => void
  setActiveSegment: (id: string | null) => void
  setEditingItem: (id: string | null) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  aiSidebarOpen: false,
  activeSegmentId: null,
  editingItemId: null,

  toggleAISidebar: () => set((s) => ({ aiSidebarOpen: !s.aiSidebarOpen })),
  setActiveSegment: (id) => set({ activeSegmentId: id }),
  setEditingItem: (id) => set({ editingItemId: id }),
}))
