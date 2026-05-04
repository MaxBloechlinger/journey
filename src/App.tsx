import { useTripStore } from './store/tripStore'
import TripList from './components/home/TripList'

function App() {
  const activeTripId = useTripStore((s) => s.activeTripId)
  const trips = useTripStore((s) => s.trips)
  const setActiveTrip = useTripStore((s) => s.setActiveTrip)

  const activeTrip = trips.find((t) => t.id === activeTripId)

  if (activeTrip) {
    return (
      <div className="min-h-screen p-8" style={{ background: 'var(--bg-base)' }}>
        <button
          onClick={() => setActiveTrip(null)}
          className="mb-8 text-xs uppercase tracking-widest hover:opacity-70"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
        >
          ← All Trips
        </button>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {activeTrip.name}
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
        >
          WORKSPACE — MILESTONE 5 COMING NEXT
        </p>
      </div>
    )
  }

  return <TripList />
}

export default App
