import { create } from 'zustand'

interface UIStore {
  aiSidebarOpen: boolean
  authModalOpen: boolean
  accountModalOpen: boolean
  mobileMapOpen: boolean
  activeSegmentId: string | null
  editingItemId: string | null

  toggleAISidebar: () => void
  openAuthModal: () => void
  closeAuthModal: () => void
  openAccountModal: () => void
  closeAccountModal: () => void
  toggleMobileMap: () => void
  setActiveSegment: (id: string | null) => void
  setEditingItem: (id: string | null) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  aiSidebarOpen: false,
  authModalOpen: false,
  accountModalOpen: false,
  mobileMapOpen: false,
  activeSegmentId: null,
  editingItemId: null,

  toggleAISidebar: () => set((s) => ({ aiSidebarOpen: !s.aiSidebarOpen })),
  openAuthModal: () => set({ authModalOpen: true }),
  closeAuthModal: () => set({ authModalOpen: false }),
  openAccountModal: () => set({ accountModalOpen: true }),
  closeAccountModal: () => set({ accountModalOpen: false }),
  toggleMobileMap: () => set((s) => ({ mobileMapOpen: !s.mobileMapOpen })),
  setActiveSegment: (id) => set({ activeSegmentId: id }),
  setEditingItem: (id) => set({ editingItemId: id }),
}))
