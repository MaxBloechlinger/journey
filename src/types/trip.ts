export type Currency = 'EUR' | 'CHF' | 'USD' | 'GBP' | 'JPY' | 'THB' | 'KRW'

export type AccommodationType = 'Hotel' | 'Airbnb' | 'Hostel' | 'Guesthouse' | 'Other'

export type TransitType = 'Flight' | 'Train' | 'Bus' | 'Ferry' | 'Other'

export interface Activity {
  id: string
  name: string
  cost: number
  date?: string
  notes?: string
  bookingLink?: string
}

export interface Accommodation {
  id: string
  name: string
  type: AccommodationType
  costPerNight: number
  bookingLink?: string
  notes?: string
  // total cost = costPerNight × parent CitySegment nights — never stored, always computed
}

export interface Transit {
  id: string
  type: TransitType
  fromCity: string
  toCity: string
  departureDate: string
  arrivalDate: string
  cost: number
  durationMinutes?: number
  airline?: string
  flightNumber?: string
  bookingLink?: string
  notes?: string
}

export interface CitySegment {
  id: string
  city: string
  country: string
  arrivalDate: string
  departureDate: string
  // nights = diff(departureDate, arrivalDate) — never stored, always computed
  accommodation?: Accommodation
  activities: Activity[]
  transitToNext?: Transit
  notes?: string
}

export interface BudgetSummary {
  totalFlightCost: number
  totalAccommodationCost: number
  totalActivityCost: number
  totalCost: number
  budgetRemaining: number
  isOverBudget: boolean
  costByCity: { cityId: string; cityName: string; cost: number }[]
}

export interface Trip {
  id: string
  name: string
  totalBudget: number
  currency: Currency
  segments: CitySegment[]
  createdAt: string
  updatedAt: string
}

export interface AppState {
  trips: Trip[]
  activeTripId: string | null
}
