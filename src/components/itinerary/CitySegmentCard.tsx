import { useEffect, useRef, useState } from 'react'
import { Trash2, Plus, Pencil } from 'lucide-react'
import type { CitySegment, Trip } from '../../types/trip'
import { useTripStore } from '../../store/tripStore'
import { useUIStore } from '../../store/uiStore'
import { nights, accommodationCost, activityCost, cityCost } from '../../utils/budget'
import { formatShortDate } from '../../utils/dates'
import AccommodationRow from './AccommodationRow'
import ActivityRow from './ActivityRow'
import AddAccommodationForm from '../forms/AddAccommodationForm'
import AddActivityForm from '../forms/AddActivityForm'
import AddCityForm from '../forms/AddCityForm'

const SECTION_LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--text-muted)',
}

interface Props {
  trip: Trip
  segment: CitySegment
  index: number
}

export default function CitySegmentCard({ trip, segment, index }: Props) {
  const deleteSegment = useTripStore((s) => s.deleteSegment)
  const activeSegmentId = useUIStore((s) => s.activeSegmentId)
  const [addingAccommodation, setAddingAccommodation] = useState(false)
  const [addingActivity, setAddingActivity] = useState(false)
  const [editing, setEditing] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const isActive = segment.id === activeSegmentId
  const nightCount = nights(segment)
  const accCost = accommodationCost(segment)
  const actCost = activityCost(segment)
  const total = cityCost(segment)

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isActive])

  return (
    <>
      <div
        ref={cardRef}
        style={{
          border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
          background: 'var(--bg-surface)',
          transition: 'border-color 0.2s',
        }}
      >
        {/* City header */}
        <div
          className="flex items-start justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-start gap-4">
            <span
              className="mt-0.5 shrink-0 text-xs font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', minWidth: 20 }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3
                className="text-xl font-bold leading-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                {segment.city.toUpperCase()}
              </h3>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                {segment.country}
              </p>
              <p className="mt-1 text-xs" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
                {formatShortDate(segment.arrivalDate)} → {formatShortDate(segment.departureDate)}
                <span style={{ color: 'var(--text-muted)' }}> · {nightCount} {nightCount === 1 ? 'night' : 'nights'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 hover:opacity-60 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Edit city"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => deleteSegment(trip.id, segment.id)}
              className="p-1.5 hover:opacity-60 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Delete city"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Accommodation */}
        <div className="px-6 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="mb-2" style={SECTION_LABEL}>Accommodation{accCost > 0 && ` · ${trip.currency} ${accCost.toLocaleString()}`}</p>
          {segment.accommodation ? (
            <AccommodationRow
              tripId={trip.id}
              segmentId={segment.id}
              accommodation={segment.accommodation}
              nights={nightCount}
              currency={trip.currency}
            />
          ) : (
            <button
              onClick={() => setAddingAccommodation(true)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
            >
              <Plus size={11} /> Add accommodation
            </button>
          )}
        </div>

        {/* Activities */}
        <div className="px-6 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="mb-2" style={SECTION_LABEL}>Activities{actCost > 0 && ` · ${trip.currency} ${actCost.toLocaleString()}`}</p>
          {segment.activities.map((activity) => (
            <ActivityRow
              key={activity.id}
              tripId={trip.id}
              segmentId={segment.id}
              activity={activity}
              currency={trip.currency}
            />
          ))}
          <button
            onClick={() => setAddingActivity(true)}
            className="mt-1 flex items-center gap-1.5 text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
          >
            <Plus size={11} /> Add activity
          </button>
        </div>

        {/* Footer total */}
        <div className="flex items-center justify-between px-6 py-3">
          <span style={SECTION_LABEL}>City total</span>
          <span
            className="text-sm font-bold"
            style={{ fontFamily: 'var(--font-display)', color: total > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {trip.currency} {total.toLocaleString()}
          </span>
        </div>
      </div>

      {addingAccommodation && (
        <AddAccommodationForm
          tripId={trip.id}
          segmentId={segment.id}
          onClose={() => setAddingAccommodation(false)}
        />
      )}
      {addingActivity && (
        <AddActivityForm
          tripId={trip.id}
          segmentId={segment.id}
          onClose={() => setAddingActivity(false)}
        />
      )}
      {editing && (
        <AddCityForm
          tripId={trip.id}
          segment={segment}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}
