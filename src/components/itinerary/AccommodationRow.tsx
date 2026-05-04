import { useState } from 'react'
import { X, ExternalLink } from 'lucide-react'
import type { Accommodation } from '../../types/trip'
import { useTripStore } from '../../store/tripStore'
import AddAccommodationForm from '../forms/AddAccommodationForm'

interface Props {
  tripId: string
  segmentId: string
  accommodation: Accommodation
  nights: number
  currency: string
}

export default function AccommodationRow({ tripId, segmentId, accommodation, nights, currency }: Props) {
  const removeAccommodation = useTripStore((s) => s.removeAccommodation)
  const [editing, setEditing] = useState(false)
  const total = accommodation.costPerNight * nights

  return (
    <>
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
              {accommodation.name}
            </span>
            <span
              className="shrink-0 text-xs px-1.5 py-0.5"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                fontSize: 10,
              }}
            >
              {accommodation.type.toUpperCase()}
            </span>
            {accommodation.bookingLink && (
              <a href={accommodation.bookingLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={11} style={{ color: 'var(--text-muted)' }} />
              </a>
            )}
          </div>
          <span className="text-xs" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
            {currency} {accommodation.costPerNight}/night × {nights} = {currency} {total.toLocaleString()}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="px-2 py-1 text-xs uppercase tracking-widest hover:opacity-70"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            Edit
          </button>
          <button
            onClick={() => removeAccommodation(tripId, segmentId)}
            className="p-1.5 hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Remove accommodation"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {editing && (
        <AddAccommodationForm
          tripId={tripId}
          segmentId={segmentId}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}
