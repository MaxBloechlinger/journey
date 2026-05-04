import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Trip } from '../../types/trip'
import CitySegmentCard from './CitySegmentCard'
import TransitCard from './TransitCard'
import AddCityForm from '../forms/AddCityForm'

interface Props {
  trip: Trip
}

export default function ItineraryPanel({ trip }: Props) {
  const [addingCity, setAddingCity] = useState(false)

  return (
    <div className="flex flex-col overflow-y-auto" style={{ width: '60%' }}>
      <div className="flex flex-col gap-0 p-6">
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
    </div>
  )
}
