import { useEffect, useRef } from 'react'
import { useTripStore } from '../store/tripStore'
import { useAuthStore } from '../store/authStore'
import { loadTrips, upsertTrip, deleteTrip } from '../lib/syncTrips'
import type { Trip } from '../types/trip'

export function useTripSync() {
  const user = useAuthStore((s) => s.user)
  const setTrips = useTripStore((s) => s.setTrips)
  const prevTripsRef = useRef<Trip[]>([])
  const loadingRef = useRef(false)

  // On login: load from Supabase, or push local trips up if cloud is empty
  useEffect(() => {
    if (!user) {
      prevTripsRef.current = []
      return
    }

    loadingRef.current = true
    loadTrips(user.id).then((cloudTrips) => {
      if (cloudTrips.length > 0) {
        setTrips(cloudTrips)
        prevTripsRef.current = cloudTrips
      } else {
        const localTrips = useTripStore.getState().trips
        if (localTrips.length > 0) {
          Promise.all(localTrips.map((t) => upsertTrip(t, user.id)))
        }
        prevTripsRef.current = localTrips
      }
    }).finally(() => {
      loadingRef.current = false
    })
  }, [user?.id, setTrips])

  // Watch for changes and sync to Supabase
  useEffect(() => {
    if (!user) return

    const unsub = useTripStore.subscribe((state) => {
      if (loadingRef.current) return
      const trips = state.trips
      const prev = prevTripsRef.current

      trips.forEach((trip) => {
        const prevTrip = prev.find((t) => t.id === trip.id)
        if (!prevTrip || prevTrip.updatedAt !== trip.updatedAt) {
          upsertTrip(trip, user.id)
        }
      })

      prev.forEach((trip) => {
        if (!trips.find((t) => t.id === trip.id)) {
          deleteTrip(trip.id)
        }
      })

      prevTripsRef.current = trips
    })

    return unsub
  }, [user?.id])
}
