import { useState } from 'react'
import type { CitySegment } from '../../types/trip'
import { useTripStore } from '../../store/tripStore'
import { nights } from '../../utils/dates'
import DatePicker from './DatePicker'
import DestinationInput from './DestinationInput'

interface Props {
  tripId: string
  segment?: CitySegment
  onClose: () => void
}

const inputStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  colorScheme: 'dark' as const,
}

const labelStyle = {
  fontFamily: 'var(--font-display)',
  color: 'var(--text-secondary)',
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
}

export default function AddCityForm({ tripId, segment, onClose }: Props) {
  const addSegment = useTripStore((s) => s.addSegment)
  const updateSegment = useTripStore((s) => s.updateSegment)
  const editing = !!segment

  const [city, setCity] = useState(segment?.city ?? '')
  const [country, setCountry] = useState(segment?.country ?? '')
  const [lat, setLat] = useState<number | undefined>(segment?.lat)
  const [lng, setLng] = useState<number | undefined>(segment?.lng)
  const [arrivalDate, setArrivalDate] = useState(segment?.arrivalDate ?? '')
  const [departureDate, setDepartureDate] = useState(segment?.departureDate ?? '')

  const nightCount = arrivalDate && departureDate ? nights(arrivalDate, departureDate) : null
  const valid = city.trim() && country.trim() && arrivalDate && departureDate && (nightCount ?? 0) > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    const fields = {
      city: city.trim(),
      country: country.trim(),
      arrivalDate,
      departureDate,
      ...(lat !== undefined && lng !== undefined ? { lat, lng } : {}),
    }
    if (editing) {
      updateSegment(tripId, segment.id, fields)
    } else {
      addSegment(tripId, fields)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-8"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {editing ? 'EDIT CITY' : 'ADD CITY'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>Destination</label>
            <DestinationInput
              autoFocus
              value={city}
              onChange={(v) => { setCity(v); setLat(undefined); setLng(undefined) }}
              onSelect={(d) => { setCity(d.city); setCountry(d.country); setLat(d.lat); setLng(d.lng) }}
              placeholder="Search city or country…"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label style={labelStyle}>Country</label>
            <input
              type="text"
              placeholder="Thailand"
              value={country}
              onChange={(e) => { setCountry(e.target.value); setLat(undefined); setLng(undefined) }}
              className="w-full px-4 py-3 text-sm outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <label style={labelStyle}>Arrival</label>
              <DatePicker value={arrivalDate} onChange={setArrivalDate} placeholder="Arrival date" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <label style={labelStyle}>Departure</label>
              <DatePicker value={departureDate} onChange={setDepartureDate} min={arrivalDate || undefined} placeholder="Departure date" />
            </div>
          </div>

          {nightCount !== null && nightCount > 0 && (
            <p className="text-xs" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>
              {nightCount} {nightCount === 1 ? 'night' : 'nights'}
            </p>
          )}
          {nightCount !== null && nightCount <= 0 && (
            <p className="text-xs" style={{ fontFamily: 'var(--font-display)', color: 'var(--danger)' }}>
              Departure must be after arrival
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!valid}
              className="flex-1 py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-30"
              style={{ background: 'var(--accent)', color: '#0a0a0a', fontFamily: 'var(--font-display)' }}
            >
              {editing ? 'Save Changes' : 'Add City'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm uppercase tracking-widest"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
