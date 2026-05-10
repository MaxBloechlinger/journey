import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../store/uiStore'

type Mode = 'signin' | 'signup'

export default function AuthModal() {
  const closeAuthModal = useUIStore((s) => s.closeAuthModal)
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        setError(error.message)
        setLoading(false)
      }
      // on success, onAuthStateChange in App.tsx will update auth state and close modal isn't needed —
      // the banner will disappear automatically when user is set
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) {
        setError(error.message)
      } else if (data.user?.identities?.length === 0) {
        setError('An account with this email already exists.')
      } else {
        setMessage('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-base)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    colorScheme: 'dark',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-sm p-8"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </h2>
          <button onClick={closeAuthModal} className="p-1 hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              type="password"
              placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && <p className="text-xs" style={{ color: 'var(--danger)', fontFamily: 'var(--font-body)' }}>{error}</p>}
          {message && <p className="text-xs" style={{ color: 'var(--success)', fontFamily: 'var(--font-body)' }}>{message}</p>}

          <button
            type="submit"
            disabled={!email.trim() || !password || loading}
            className="py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-30 hover:opacity-80 transition-opacity"
            style={{ background: 'var(--accent)', color: '#0a0a0a', fontFamily: 'var(--font-display)' }}
          >
            {loading ? '…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null) }}
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
