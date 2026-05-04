import { useState } from 'react'
import type { TransitType } from '../../types/trip'
import { useTripStore } from '../../store/tripStore'

const TRANSIT_TYPES: TransitType[] = ['Flight', 'Train', 'Bus', 'Ferry', 'Other']

interface Props {
  tripId: string
  toCity: string
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

export default function AddOriginFlightForm({ tripId, toCity, onClose }: Props) {
  const setTransitToFirst = useTripStore((s) => s.setTransitToFirst)
  const setOriginCity = useTripStore((s) => s.setOriginCity)

  const [originCity, setOriginCityState] = useState('')
  const [type, setType] = useState<TransitType>('Flight')
  const [departureDate, setDepartureDate] = useState('')
  const [arrivalDate, setArrivalDate] = useState('')
  const [cost, setCost] = useState('')
  const [durationHours, setDurationHours] = useState('')
  const [airline, setAirline] = useState('')
  const [flightNumber, setFlightNumber] = useState('')

  const valid = originCity.trim() && departureDate && arrivalDate && cost

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    setOriginCity(tripId, originCity.trim())
    setTransitToFirst(tripId, {
      type,
      fromCity: originCity.trim(),
      toCity,
      departureDate,
      arrivalDate,
      cost: parseFloat(cost),
      durationMinutes: durationHours ? Math.round(parseFloat(durationHours) * 60) : undefined,
      airline: airline || undefined,
      flightNumber: flightNumber || undefined,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg p-8"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          ADD OUTBOUND FLIGHT
        </h2>
        <p className="mb-6 text-xs" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          FROM HOME → {toCity.toUpperCase()}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <label style={labelStyle}>Departing From</label>
              <input
                autoFocus
                type="text"
                placeholder="Zurich"
                value={originCity}
                onChange={(e) => setOriginCityState(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label style={labelStyle}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransitType)}
                className="px-4 py-3 text-sm outline-none"
                style={{ ...inputStyle, fontFamily: 'var(--font-display)' }}
              >
                {TRANSIT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <label style={labelStyle}>Cost</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="650"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={{ ...inputStyle, fontFamily: 'var(--font-display)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <label style={labelStyle}>Duration (hrs)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="11.5"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={{ ...inputStyle, fontFamily: 'var(--font-display)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <label style={labelStyle}>Departure Date</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <label style={labelStyle}>Arrival Date</label>
              <input
                type="date"
                value={arrivalDate}
                min={departureDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <label style={labelStyle}>Airline</label>
              <input
                type="text"
                placeholder="Swiss Air"
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <label style={labelStyle}>Flight No.</label>
              <input
                type="text"
                placeholder="LX181"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!valid}
              className="flex-1 py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-30"
              style={{ background: 'var(--accent)', color: '#0a0a0a', fontFamily: 'var(--font-display)' }}
            >
              Add Outbound Flight
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
