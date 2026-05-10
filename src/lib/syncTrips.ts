import { supabase } from './supabase'
import type { Trip } from '../types/trip'

export async function loadTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => row.data as Trip)
}

export async function upsertTrip(trip: Trip, userId: string): Promise<void> {
  const { error } = await supabase.from('trips').upsert({
    id: trip.id,
    user_id: userId,
    data: trip,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', tripId)
  if (error) throw error
}
