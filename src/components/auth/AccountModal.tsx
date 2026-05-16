import { X, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'

export default function AccountModal() {
  const closeAccountModal = useUIStore((s) => s.closeAccountModal)
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  const handleSignOut = async () => {
    closeAccountModal()
    await signOut()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={closeAccountModal}
    >
      <div
        className="w-full max-w-sm p-8"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            ACCOUNT
          </h2>
          <button onClick={closeAccountModal} className="p-1 hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
              Signed in as
            </span>
            <span className="text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
              {user?.email}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
