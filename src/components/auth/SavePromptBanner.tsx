import { useState } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

export default function SavePromptBanner() {
  const openAuthModal = useUIStore((s) => s.openAuthModal)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 px-5 py-3"
      style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-strong)' }}
    >
      <p className="text-xs" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
        Your trip is saved locally. <span style={{ color: 'var(--text-primary)' }}>Sign in to keep it safe across devices.</span>
      </p>
      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={openAuthModal}
          className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
          style={{ background: 'var(--accent)', color: '#0a0a0a', fontFamily: 'var(--font-display)' }}
        >
          Sign In
        </button>
        <button onClick={() => setDismissed(true)} className="p-1 hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
