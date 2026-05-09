import { useEffect } from 'react'
import { useTripStore } from './store/tripStore'
import { useAuthStore } from './store/authStore'
import { supabase } from './lib/supabase'
import TripList from './components/home/TripList'
import Header from './components/layout/Header'
import TripMap from './components/map/TripMap'
import ItineraryPanel from './components/itinerary/ItineraryPanel'
import AISidebar from './components/ai/AISidebar'
import LoginScreen from './components/auth/LoginScreen'

function App() {
  const activeTripId = useTripStore((s) => s.activeTripId)
  const trips = useTripStore((s) => s.trips)
  const activeTrip = trips.find((t) => t.id === activeTripId)
  const { user, loading, setSession } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session)).catch(() => setSession(null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [setSession])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <span className="text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          Loading…
        </span>
      </div>
    )
  }

  if (!user) return <LoginScreen />

  if (activeTrip) {
    return (
      <div className="flex flex-col" style={{ height: '100vh', background: 'var(--bg-base)' }}>
        <Header trip={activeTrip} />
        <div className="flex flex-1 overflow-hidden">
          <TripMap trip={activeTrip} />
          <ItineraryPanel trip={activeTrip} />
          <AISidebar trip={activeTrip} />
        </div>
      </div>
    )
  }

  return <TripList />
}

export default App
