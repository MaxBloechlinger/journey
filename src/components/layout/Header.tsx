import { useState } from 'react'
import { Pencil, UserCircle } from 'lucide-react'
import { useTripStore } from '../../store/tripStore'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { budgetSummary } from '../../utils/budget'
import type { Currency, Trip } from '../../types/trip'
import { useIsMobile } from '../../hooks/useIsMobile'

const CURRENCIES: Currency[] = ['EUR', 'CHF', 'USD', 'GBP', 'JPY', 'THB', 'KRW']

interface Props {
  trip: Trip
}

export default function Header({ trip }: Props) {
  const setActiveTrip = useTripStore((s) => s.setActiveTrip)
  const updateTrip = useTripStore((s) => s.updateTrip)
  const toggleAISidebar = useUIStore((s) => s.toggleAISidebar)
  const openAuthModal = useUIStore((s) => s.openAuthModal)
  const signOut = useAuthStore((s) => s.signOut)
  const user = useAuthStore((s) => s.user)
  const isMobile = useIsMobile()
  const summary = budgetSummary(trip)

  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')

  const pct = trip.totalBudget > 0
    ? Math.min(100, (summary.totalCost / trip.totalBudget) * 100)
    : 0
  const color = summary.isOverBudget ? 'var(--danger)' : 'var(--accent)'

  const startEditing = () => {
    setBudgetInput(String(trip.totalBudget))
    setEditingBudget(true)
  }

  const commitBudget = () => {
    const val = parseFloat(budgetInput)
    if (!isNaN(val) && val > 0) updateTrip(trip.id, { totalBudget: val })
    setEditingBudget(false)
  }

  const handleBudgetKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitBudget()
    if (e.key === 'Escape') setEditingBudget(false)
  }

  if (isMobile) {
    return (
      <header
        className="flex shrink-0 flex-col"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Row 1: back + name + AI */}
        <div className="flex items-center justify-between gap-2 px-4" style={{ height: 48 }}>
          <button
            onClick={() => setActiveTrip(null)}
            className="shrink-0 text-xs uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
          >
            ←
          </button>
          <span
            className="flex-1 truncate text-sm font-bold text-center"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {trip.name.toUpperCase()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAISidebar}
              className="shrink-0 px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ border: '1px solid var(--accent)', color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
            >
              ✦ AI
            </button>
            <button
              onClick={user ? signOut : openAuthModal}
              className="p-1 hover:opacity-60 transition-opacity"
              style={{ color: user ? 'var(--accent)' : 'var(--text-muted)' }}
              title={user ? 'Sign out' : 'Sign in'}
            >
              <UserCircle size={16} />
            </button>
          </div>
        </div>
        {/* Row 2: budget bar */}
        <div
          className="flex items-center gap-2 px-4 pb-2"
          style={{ fontFamily: 'var(--font-display)', fontSize: 11 }}
        >
          <span style={{ color }}>{trip.currency} {summary.totalCost.toLocaleString()}</span>
          <div className="flex-1 overflow-hidden" style={{ height: 2, background: 'var(--border)' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.4s ease' }} />
          </div>
          <button
            onClick={startEditing}
            className="flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {editingBudget ? (
              <input
                autoFocus
                type="number"
                min="1"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onBlur={commitBudget}
                onKeyDown={handleBudgetKeyDown}
                className="w-16 bg-transparent outline-none text-right"
                style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-strong)' }}
              />
            ) : (
              <>{trip.totalBudget.toLocaleString()} <Pencil size={8} /></>
            )}
          </button>
        </div>
      </header>
    )
  }

  return (
    <header
      className="flex shrink-0 items-center justify-between gap-8 px-6"
      style={{ height: 56, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-6 min-w-0">
        <button
          onClick={() => setActiveTrip(null)}
          className="shrink-0 text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
        >
          ← All Trips
        </button>
        <span
          className="truncate text-sm font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {trip.name.toUpperCase()}
        </span>
      </div>

      {/* Center — budget */}
      <div className="flex shrink-0 flex-col items-center gap-1">
        <div className="flex items-baseline gap-1.5" style={{ fontFamily: 'var(--font-display)', fontSize: 12 }}>
          <span style={{ color }}>
            <select
              value={trip.currency}
              onChange={(e) => updateTrip(trip.id, { currency: e.target.value as Currency })}
              style={{
                background: 'transparent',
                border: 'none',
                color,
                fontFamily: 'var(--font-display)',
                fontSize: 12,
                cursor: 'pointer',
                outline: 'none',
                padding: 0,
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
              title="Change currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c} style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                  {c}
                </option>
              ))}
            </select>
            {' '}{summary.totalCost.toLocaleString()}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          {editingBudget ? (
            <input
              autoFocus
              type="number"
              min="1"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              onBlur={commitBudget}
              onKeyDown={handleBudgetKeyDown}
              className="w-24 bg-transparent outline-none text-center"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 12,
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-strong)',
              }}
            />
          ) : (
            <button
              onClick={startEditing}
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
              title="Edit budget"
            >
              {trip.totalBudget.toLocaleString()}
              <Pencil size={9} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
        <div className="w-32 overflow-hidden" style={{ height: 2, background: 'var(--border)' }}>
          <div
            style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.4s ease' }}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={toggleAISidebar}
          className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
          style={{ border: '1px solid var(--accent)', color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
        >
          ✦ Ask AI
        </button>
        <button
          onClick={user ? signOut : openAuthModal}
          className="p-1 hover:opacity-60 transition-opacity"
          style={{ color: user ? 'var(--accent)' : 'var(--text-muted)' }}
          title={user ? 'Sign out' : 'Sign in'}
        >
          <UserCircle size={16} />
        </button>
      </div>
    </header>
  )
}
