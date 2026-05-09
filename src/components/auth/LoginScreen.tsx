import { useState } from 'react'
import { supabase } from '../../lib/supabase'

type Mode = 'signin' | 'signup'

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signin')
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
    setMessage(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    colorScheme: 'dark',
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-sm">
        <h1
          className="mb-2 text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          JOURNEY
        </h1>
        <p
          className="mb-10 text-sm"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
        >
          Plan your trip. Track your budget.
        </p>

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

          {error && (
            <p className="text-xs" style={{ color: 'var(--danger)', fontFamily: 'var(--font-body)' }}>
              {error}
            </p>
          )}
          {message && (
            <p className="text-xs" style={{ color: 'var(--success)', fontFamily: 'var(--font-body)' }}>
              {message}
            </p>
          )}

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
