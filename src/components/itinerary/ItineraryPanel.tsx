import { useState } from 'react'
import { Plus, X, Plane } from 'lucide-react'
import type { Trip } from '../../types/trip'
import { useTripStore } from '../../store/tripStore'
import CitySegmentCard from './CitySegmentCard'
import TransitCard from './TransitCard'
import AddCityForm from '../forms/AddCityForm'
import AddOriginFlightForm from '../forms/AddOriginFlightForm'

interface Props {
  trip: Trip
}

export default function ItineraryPanel({ trip }: Props) {
  const removeTransitToFirst = useTripStore((s) => s.removeTransitToFirst)
  const [addingCity, setAddingCity] = useState(false)
  const [addingOriginFlight, setAddingOriginFlight] = useState(false)

  const firstCity = trip.segments[0]?.city

  return (
    <div className="flex flex-col overflow-y-auto" style={{ width: '60%' }}>
      <div className="flex flex-col gap-0 p-6">

        {/* Origin transit — only shown when at least one city exists */}
        {firstCity && (
          <div className="mb-3">
            {trip.transitToFirst ? (
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ border: '1px dashed var(--border)', background: 'var(--bg-base)' }}
              >
                <div className="flex items-center gap-3">
                  <Plane size={13} style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
                    {(trip.originCity ?? 'HOME').toUpperCase()} → {firstCity.toUpperCase()}
                  </span>
                  {trip.transitToFirst.airline && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                      {trip.transitToFirst.airline}
                      {trip.transitToFirst.flightNumber ? ` ${trip.transitToFirst.flightNumber}` : ''}
                    </span>
                  )}
                  {trip.transitToFirst.durationMinutes && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
                      {Math.floor(trip.transitToFirst.durationMinutes / 60)}h
                      {trip.transitToFirst.durationMinutes % 60 > 0 ? ` ${trip.transitToFirst.durationMinutes % 60}m` : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    {trip.currency} {trip.transitToFirst.cost.toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeTransitToFirst(trip.id)}
                    className="p-1 hover:opacity-60"
                    style={{ color: 'var(--text-muted)' }}
                    aria-label="Remove outbound flight"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingOriginFlight(true)}
                className="flex items-center gap-2 text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
              >
                <Plus size={12} />
                Add outbound flight → {firstCity}
              </button>
            )}
          </div>
        )}

        {trip.segments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
              No cities yet
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
              Add your first destination to start building the itinerary.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {trip.segments.map((segment, i) => (
              <div key={segment.id}>
                <CitySegmentCard trip={trip} segment={segment} index={i} />
                {i < trip.segments.length - 1 && (
                  <div className="py-2">
                    <TransitCard
                      tripId={trip.id}
                      segment={segment}
                      nextCity={trip.segments[i + 1].city}
                      currency={trip.currency}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setAddingCity(true)}
          className="mt-4 flex items-center gap-2 self-start px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
        >
          <Plus size={13} strokeWidth={2.5} />
          Add City
        </button>
      </div>

      {addingCity && (
        <AddCityForm tripId={trip.id} onClose={() => setAddingCity(false)} />
      )}
      {addingOriginFlight && firstCity && (
        <AddOriginFlightForm
          tripId={trip.id}
          toCity={firstCity}
          onClose={() => setAddingOriginFlight(false)}
        />
      )}
    </div>
  )
}
