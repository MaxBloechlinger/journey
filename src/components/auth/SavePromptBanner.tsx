import { useState } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

export default function SavePromptBanner() {
  const openAuthModal = useUIStore((s) => s.openAuthModal)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 px-4 py-3"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-strong)',
        maxWidth: 320,
      }}
    >
      <p className="text-xs leading-snug" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
        Sign in to save your trip across devices.
      </p>
      <button
        onClick={openAuthModal}
        className="shrink-0 px-3 py-1.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
        style={{ background: 'var(--accent)', color: '#0a0a0a', fontFamily: 'var(--font-display)' }}
      >
        Sign In
      </button>
      <button onClick={() => setDismissed(true)} className="shrink-0 hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
        <X size={12} />
      </button>
    </div>
  )
}
