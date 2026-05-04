import { useTripStore } from './store/tripStore'
import TripList from './components/home/TripList'
import Header from './components/layout/Header'
import TripMap from './components/map/TripMap'
import ItineraryPanel from './components/itinerary/ItineraryPanel'

function App() {
  const activeTripId = useTripStore((s) => s.activeTripId)
  const trips = useTripStore((s) => s.trips)
  const activeTrip = trips.find((t) => t.id === activeTripId)

  if (activeTrip) {
    return (
      <div className="flex flex-col" style={{ height: '100vh', background: 'var(--bg-base)' }}>
        <Header trip={activeTrip} />
        <div className="flex flex-1 overflow-hidden">
          <TripMap trip={activeTrip} />
          <ItineraryPanel trip={activeTrip} />
        </div>
      </div>
    )
  }

  return <TripList />
}

export default App
