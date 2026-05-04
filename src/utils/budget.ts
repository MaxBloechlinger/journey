import { differenceInDays, parseISO } from 'date-fns'
import type { Trip, CitySegment, BudgetSummary } from '../types/trip'

export const nights = (segment: CitySegment): number =>
  differenceInDays(parseISO(segment.departureDate), parseISO(segment.arrivalDate))

export const accommodationCost = (segment: CitySegment): number =>
  segment.accommodation ? segment.accommodation.costPerNight * nights(segment) : 0

export const activityCost = (segment: CitySegment): number =>
  segment.activities.reduce((sum, a) => sum + a.cost, 0)

export const cityCost = (segment: CitySegment): number =>
  accommodationCost(segment) + activityCost(segment)

export const budgetSummary = (trip: Trip): BudgetSummary => {
  const totalFlightCost =
    (trip.transitToFirst?.cost ?? 0) +
    trip.segments.reduce((sum, s) => sum + (s.transitToNext?.cost ?? 0), 0) +
    (trip.transitFromLast?.cost ?? 0)
  const totalAccommodationCost = trip.segments.reduce(
    (sum, s) => sum + accommodationCost(s),
    0
  )
  const totalActivityCost = trip.segments.reduce(
    (sum, s) => sum + activityCost(s),
    0
  )
  const totalCost = totalFlightCost + totalAccommodationCost + totalActivityCost
  return {
    totalFlightCost,
    totalAccommodationCost,
    totalActivityCost,
    totalCost,
    budgetRemaining: trip.totalBudget - totalCost,
    isOverBudget: totalCost > trip.totalBudget,
    costByCity: trip.segments.map((s) => ({
      cityId: s.id,
      cityName: s.city,
      cost: cityCost(s),
    })),
  }
}
