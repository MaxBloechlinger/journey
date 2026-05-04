import { useState } from 'react'
import { Plane, Train, Bus, Ship, ArrowRight, Plus, X } from 'lucide-react'
import type { CitySegment } from '../../types/trip'
import { useTripStore } from '../../store/tripStore'
import AddFlightForm from '../forms/AddFlightForm'

const TRANSIT_ICONS = {
  Flight: Plane,
  Train: Train,
  Bus: Bus,
  Ferry: Ship,
  Other: ArrowRight,
}

interface Props {
  tripId: string
  segment: CitySegment
  nextCity: string
  currency: string
}

export default function TransitCard({ tripId, segment, nextCity, currency }: Props) {
  const removeTransitToNext = useTripStore((s) => s.removeTransitToNext)
  const [adding, setAdding] = useState(false)
  const transit = segment.transitToNext

  const Icon = transit ? TRANSIT_ICONS[transit.type] : null
  const durationStr = transit?.durationMinutes
    ? `${Math.floor(transit.durationMinutes / 60)}h ${transit.durationMinutes % 60 > 0 ? `${transit.durationMinutes % 60}m` : ''}`.trim()
    : null

  return (
    <>
      <div
        className="mx-6 flex items-center justify-between px-4 py-3"
        style={{ border: '1px dashed var(--border)', background: 'var(--bg-base)' }}
      >
        {transit ? (
          <>
            <div className="flex items-center gap-3">
              {Icon && <Icon size={13} style={{ color: 'var(--text-secondary)' }} />}
              <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
                {segment.city.toUpperCase()} → {nextCity.toUpperCase()}
              </span>
              {transit.airline && (
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  {transit.airline}
                  {transit.flightNumber ? ` ${transit.flightNumber}` : ''}
                </span>
              )}
              {durationStr && (
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                  {durationStr}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {currency} {transit.cost.toLocaleString()}
              </span>
              <button
                onClick={() => removeTransitToNext(tripId, segment.id)}
                className="p-1 hover:opacity-60"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Remove transit"
              >
                <X size={13} />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
          >
            <Plus size={12} />
            Add transit {segment.city} → {nextCity}
          </button>
        )}
      </div>

      {adding && (
        <AddFlightForm
          tripId={tripId}
          segmentId={segment.id}
          fromCity={segment.city}
          toCity={nextCity}
          onClose={() => setAdding(false)}
        />
      )}
    </>
  )
}
