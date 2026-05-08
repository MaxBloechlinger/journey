import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Transit, Trip } from '../../types/trip'
import { useTripStore } from '../../store/tripStore'
import CitySegmentCard from './CitySegmentCard'
import TransitCard from './TransitCard'
import AddCityForm from '../forms/AddCityForm'
import AddOriginFlightForm from '../forms/AddOriginFlightForm'
import AddReturnFlightForm from '../forms/AddReturnFlightForm'

interface Props {
  trip: Trip
}

const TRANSIT_TYPE_ICONS: Record<string, string> = {
  Flight: '✈',
  Train: '🚄',
  Bus: '🚌',
  Ferry: '⛴',
  Other: '→',
}

function BoundaryTransitRow({
  transit,
  label,
  currency,
  onRemove,
}: {
  transit: Transit
  label: string
  currency: string
  onRemove: () => void
}) {
  const icon = TRANSIT_TYPE_ICONS[transit.type] ?? '→'
  const durationStr = transit.durationMinutes
    ? `${Math.floor(transit.durationMinutes / 60)}h${transit.durationMinutes % 60 > 0 ? ` ${transit.durationMinutes % 60}m` : ''}`
    : null

  return (
    <div
      className="mx-6 flex items-center justify-between px-4 py-3"
      style={{ border: '1px dashed var(--border)', background: 'var(--bg-base)' }}
    >
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 12 }}>{icon}</span>
        <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          {label}
        </span>
        {transit.airline && (
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            {transit.airline}{transit.flightNumber ? ` ${transit.flightNumber}` : ''}
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
        <button onClick={onRemove} className="p-1 hover:opacity-60" style={{ color: 'var(--text-muted)' }}>
          <X size={13} />
        </button>
      </div>
    </div>
  )
}

export default function ItineraryPanel({ trip }: Props) {
  const removeTransitToFirst = useTripStore((s) => s.removeTransitToFirst)
  const removeTransitFromLast = useTripStore((s) => s.removeTransitFromLast)
  const reorderSegments = useTripStore((s) => s.reorderSegments)
  const [addingCity, setAddingCity] = useState(false)
  const [addingOriginFlight, setAddingOriginFlight] = useState(false)
  const [addingReturnFlight, setAddingReturnFlight] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = trip.segments.findIndex((s) => s.id === active.id)
    const newIndex = trip.segments.findIndex((s) => s.id === over.id)
    reorderSegments(trip.id, arrayMove(trip.segments, oldIndex, newIndex).map((s) => s.id))
  }

  const firstCity = trip.segments[0]?.city
  const lastSegment = trip.segments[trip.segments.length - 1]

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex flex-col gap-0 p-6">

        {/* Outbound flight — above first city */}
        {firstCity && (
          <div className="mb-3">
            {trip.transitToFirst ? (
              <BoundaryTransitRow
                transit={trip.transitToFirst}
                label={`${(trip.originCity ?? 'HOME').toUpperCase()} → ${firstCity.toUpperCase()}`}
                currency={trip.currency}
                onRemove={() => removeTransitToFirst(trip.id)}
              />
            ) : (
              <div className="mx-6">
                <button
                  onClick={() => setAddingOriginFlight(true)}
                  className="flex items-center gap-2 text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
                >
                  <Plus size={12} />
                  Add outbound flight → {firstCity}
                </button>
              </div>
            )}
          </div>
        )}

        {/* City cards + inter-city transits */}
        {trip.segments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 py-32 text-center">
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
                No cities yet
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                Start building your route.
              </p>
            </div>
            <button
              onClick={() => setAddingCity(true)}
              className="flex items-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
              style={{ background: 'var(--accent)', color: '#0a0a0a', fontFamily: 'var(--font-display)' }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add First City
            </button>
          </div>
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={trip.segments.map((s) => s.id)} strategy={verticalListSortingStrategy}>
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
              </SortableContext>
            </DndContext>

            {/* Return flight — below last city */}
            {lastSegment && (
              <div className="mt-3">
                {trip.transitFromLast ? (
                  <BoundaryTransitRow
                    transit={trip.transitFromLast}
                    label={`${lastSegment.city.toUpperCase()} → ${trip.transitFromLast.toCity.toUpperCase()}`}
                    currency={trip.currency}
                    onRemove={() => removeTransitFromLast(trip.id)}
                  />
                ) : (
                  <div className="mx-6">
                    <button
                      onClick={() => setAddingReturnFlight(true)}
                      className="flex items-center gap-2 text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
                    >
                      <Plus size={12} />
                      Add return flight ← {lastSegment.city}
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setAddingCity(true)}
              className="mt-6 flex items-center gap-2 self-start px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
            >
              <Plus size={13} strokeWidth={2.5} />
              Add City
            </button>
          </>
        )}
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
      {addingReturnFlight && lastSegment && (
        <AddReturnFlightForm
          tripId={trip.id}
          fromCity={lastSegment.city}
          defaultToCity={trip.originCity}
          onClose={() => setAddingReturnFlight(false)}
        />
      )}
    </div>
  )
}
