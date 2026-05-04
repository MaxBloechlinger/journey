import { useState } from 'react'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { useTripStore } from '../../store/tripStore'
import { formatDate } from '../../utils/dates'
import CreateTripModal from './CreateTripModal'

export default function TripList() {
  const trips = useTripStore((s) => s.trips)
  const deleteTrip = useTripStore((s) => s.deleteTrip)
  const setActiveTrip = useTripStore((s) => s.setActiveTrip)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between border-b px-8 py-5"
        style={{ borderColor: 'var(--border)' }}
      >
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          JOURNEY
        </span>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{
            background: 'var(--accent)',
            color: '#0a0a0a',
            fontFamily: 'var(--font-display)',
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          New Trip
        </button>
      </header>

      {/* Trip list */}
      <main className="mx-auto max-w-3xl px-8 py-12">
        {trips.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <p
              className="text-sm uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}
            >
              No trips yet
            </p>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
              Start planning your next adventure.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {trips.map((trip) => (
              <li
                key={trip.id}
                className="flex items-center justify-between px-6 py-5"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="flex flex-col gap-1">
                  <span
                    className="text-lg font-bold"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                  >
                    {trip.name}
                  </span>
                  <span
                    className="text-xs"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
                  >
                    {trip.currency} {trip.totalBudget.toLocaleString()} · {trip.segments.length} {trip.segments.length === 1 ? 'city' : 'cities'} · {formatDate(trip.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    className="p-2 transition-colors hover:opacity-60"
                    style={{ color: 'var(--text-muted)' }}
                    aria-label="Delete trip"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => setActiveTrip(trip.id)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                    style={{
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    Open
                    <ArrowRight size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {showModal && <CreateTripModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
