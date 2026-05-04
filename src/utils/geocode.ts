export interface Coords {
  lat: number
  lng: number
}

export const geocodeCity = async (city: string, country: string): Promise<Coords | null> => {
  try {
    const q = encodeURIComponent(`${city}, ${country}`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'journey-trip-planner' } }
    )
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
