import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Trip,
  CitySegment,
  Accommodation,
  Activity,
  Transit,
  Currency,
} from '../types/trip'
import { newId } from '../utils/ids'

interface TripStore {
  trips: Trip[]
  activeTripId: string | null

  // Trip actions
  createTrip: (name: string, budget: number, currency: Currency) => void
  updateTrip: (tripId: string, updates: Partial<Pick<Trip, 'name' | 'totalBudget' | 'currency'>>) => void
  deleteTrip: (tripId: string) => void
  setActiveTrip: (tripId: string | null) => void

  // Segment actions
  addSegment: (tripId: string, segment: Omit<CitySegment, 'id' | 'activities'>) => void
  updateSegment: (tripId: string, segmentId: string, updates: Partial<CitySegment>) => void
  deleteSegment: (tripId: string, segmentId: string) => void
  reorderSegments: (tripId: string, orderedIds: string[]) => void

  // Accommodation actions
  setAccommodation: (tripId: string, segmentId: string, accommodation: Omit<Accommodation, 'id'>) => void
  updateAccommodation: (tripId: string, segmentId: string, updates: Partial<Accommodation>) => void
  removeAccommodation: (tripId: string, segmentId: string) => void

  // Activity actions
  addActivity: (tripId: string, segmentId: string, activity: Omit<Activity, 'id'>) => void
  updateActivity: (tripId: string, segmentId: string, activityId: string, updates: Partial<Activity>) => void
  deleteActivity: (tripId: string, segmentId: string, activityId: string) => void

  // Transit actions
  setTransitToNext: (tripId: string, segmentId: string, transit: Omit<Transit, 'id'>) => void
  updateTransitToNext: (tripId: string, segmentId: string, updates: Partial<Transit>) => void
  removeTransitToNext: (tripId: string, segmentId: string) => void
}

const updateTrips = (
  trips: Trip[],
  tripId: string,
  updater: (trip: Trip) => Trip
): Trip[] => trips.map((t) => (t.id === tripId ? updater(t) : t))

const updateSegments = (
  trips: Trip[],
  tripId: string,
  segmentId: string,
  updater: (segment: CitySegment) => CitySegment
): Trip[] =>
  updateTrips(trips, tripId, (trip) => ({
    ...trip,
    updatedAt: new Date().toISOString(),
    segments: trip.segments.map((s) => (s.id === segmentId ? updater(s) : s)),
  }))

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      trips: [],
      activeTripId: null,

      createTrip: (name, budget, currency) =>
        set((s) => ({
          trips: [
            ...s.trips,
            {
              id: newId(),
              name,
              totalBudget: budget,
              currency,
              segments: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateTrip: (tripId, updates) =>
        set((s) => ({
          trips: updateTrips(s.trips, tripId, (t) => ({
            ...t,
            ...updates,
            updatedAt: new Date().toISOString(),
          })),
        })),

      deleteTrip: (tripId) =>
        set((s) => ({
          trips: s.trips.filter((t) => t.id !== tripId),
          activeTripId: s.activeTripId === tripId ? null : s.activeTripId,
        })),

      setActiveTrip: (tripId) => set({ activeTripId: tripId }),

      addSegment: (tripId, segment) =>
        set((s) => ({
          trips: updateTrips(s.trips, tripId, (t) => ({
            ...t,
            updatedAt: new Date().toISOString(),
            segments: [
              ...t.segments,
              { ...segment, id: newId(), activities: [] },
            ],
          })),
        })),

      updateSegment: (tripId, segmentId, updates) =>
        set((s) => ({
          trips: updateSegments(s.trips, tripId, segmentId, (seg) => ({
            ...seg,
            ...updates,
          })),
        })),

      deleteSegment: (tripId, segmentId) =>
        set((s) => ({
          trips: updateTrips(s.trips, tripId, (t) => ({
            ...t,
            updatedAt: new Date().toISOString(),
            segments: t.segments.filter((seg) => seg.id !== segmentId),
          })),
        })),

      reorderSegments: (tripId, orderedIds) =>
        set((s) => ({
          trips: updateTrips(s.trips, tripId, (t) => ({
            ...t,
            updatedAt: new Date().toISOString(),
            segments: orderedIds
              .map((id) => t.segments.find((seg) => seg.id === id))
              .filter((seg): seg is CitySegment => seg !== undefined),
          })),
        })),

      setAccommodation: (tripId, segmentId, accommodation) =>
        set((s) => ({
          trips: updateSegments(s.trips, tripId, segmentId, (seg) => ({
            ...seg,
            accommodation: { ...accommodation, id: newId() },
          })),
        })),

      updateAccommodation: (tripId, segmentId, updates) =>
        set((s) => ({
          trips: updateSegments(s.trips, tripId, segmentId, (seg) => ({
            ...seg,
            accommodation: seg.accommodation
              ? { ...seg.accommodation, ...updates }
              : seg.accommodation,
          })),
        })),

      removeAccommodation: (tripId, segmentId) =>
        set((s) => ({
          trips: updateSegments(s.trips, tripId, segmentId, (seg) => ({
            ...seg,
            accommodation: undefined,
          })),
        })),

      addActivity: (tripId, segmentId, activity) =>
        set((s) => ({
          trips: updateSegments(s.trips, tripId, segmentId, (seg) => ({
            ...seg,
            activities: [...seg.activities, { ...activity, id: newId() }],
          })),
        })),

      updateActivity: (tripId, segmentId, activityId, updates) =>
        set((s) => ({
          trips: updateSegments(s.trips, tripId, segmentId, (seg) => ({
            ...seg,
            activities: seg.activities.map((a) =>
              a.id === activityId ? { ...a, ...updates } : a
            ),
          })),
        })),

      deleteActivity: (tripId, segmentId, activityId) =>
        set((s) => ({
          trips: updateSegments(s.trips, tripId, segmentId, (seg) => ({
            ...seg,
            activities: seg.activities.filter((a) => a.id !== activityId),
          })),
        })),

      setTransitToNext: (tripId, segmentId, transit) =>
        set((s) => ({
          trips: updateSegments(s.trips, tripId, segmentId, (seg) => ({
            ...seg,
            transitToNext: { ...transit, id: newId() },
          })),
        })),

      updateTransitToNext: (tripId, segmentId, updates) =>
        set((s) => ({
          trips: updateSegments(s.trips, tripId, segmentId, (seg) => ({
            ...seg,
            transitToNext: seg.transitToNext
              ? { ...seg.transitToNext, ...updates }
              : seg.transitToNext,
          })),
        })),

      removeTransitToNext: (tripId, segmentId) =>
        set((s) => ({
          trips: updateSegments(s.trips, tripId, segmentId, (seg) => ({
            ...seg,
            transitToNext: undefined,
          })),
        })),
    }),
    { name: 'journey_state' }
  )
)
