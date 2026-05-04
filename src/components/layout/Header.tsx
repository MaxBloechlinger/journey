import { useTripStore } from '../../store/tripStore'
import { useUIStore } from '../../store/uiStore'
import { budgetSummary } from '../../utils/budget'
import type { Trip } from '../../types/trip'

interface Props {
  trip: Trip
}

export default function Header({ trip }: Props) {
  const setActiveTrip = useTripStore((s) => s.setActiveTrip)
  const toggleAISidebar = useUIStore((s) => s.toggleAISidebar)
  const summary = budgetSummary(trip)

  const pct = trip.totalBudget > 0
    ? Math.min(100, (summary.totalCost / trip.totalBudget) * 100)
    : 0
  const color = summary.isOverBudget ? 'var(--danger)' : 'var(--accent)'

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
          <span style={{ color }}>{trip.currency} {summary.totalCost.toLocaleString()}</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>{trip.totalBudget.toLocaleString()}</span>
        </div>
        <div className="w-32 overflow-hidden" style={{ height: 2, background: 'var(--border)' }}>
          <div
            style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.4s ease' }}
          />
        </div>
      </div>

      {/* Right */}
      <button
        onClick={toggleAISidebar}
        className="shrink-0 px-4 py-1.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
        style={{ border: '1px solid var(--accent)', color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
      >
        ✦ Ask AI
      </button>
    </header>
  )
}
