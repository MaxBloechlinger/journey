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
  const [googleLoading, setGoogleLoading] = useState(false)
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
      } else {
        closeAuthModal()
      }
      setLoading(false)
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

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
    // on success the page redirects to Google — no further action needed
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

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="mb-5 flex w-full items-center justify-center gap-3 py-3 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {googleLoading ? '…' : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex-1" style={{ height: 1, background: 'var(--border)' }} />
          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>or</span>
          <div className="flex-1" style={{ height: 1, background: 'var(--border)' }} />
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
