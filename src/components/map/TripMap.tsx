import type { Trip } from '../../types/trip'

interface Props {
  trip: Trip
}

export default function TripMap({ trip: _trip }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        width: '40%',
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <span
        className="text-xs uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
      >
        Map — Milestone 11
      </span>
    </div>
  )
}
