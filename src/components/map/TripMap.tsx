import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Trip } from '../../types/trip'
import { useTripStore } from '../../store/tripStore'
import { useUIStore } from '../../store/uiStore'
import { geocodeCity, sleep } from '../../utils/geocode'

// Custom marker — pure HTML, no broken image issue in Vite
const cityIcon = (label: string, active: boolean) =>
  L.divIcon({
    html: `<div style="
      background:${active ? '#e8ff47' : '#111111'};
      color:${active ? '#0a0a0a' : '#e8ff47'};
      border:1px solid #e8ff47;
      font-family:Space Mono,monospace;
      font-size:9px;
      font-weight:700;
      padding:3px 7px;
      white-space:nowrap;
      cursor:pointer;
      line-height:1.4;
    ">${label.toUpperCase()}</div>`,
    className: '',
    iconAnchor: [0, 12],
  })

// Fits map bounds whenever geocoded positions change
function AutoFit({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  const prevKey = useRef('')
  const key = positions.map((p) => p.join(',')).join('|')

  useEffect(() => {
    if (key === prevKey.current || positions.length === 0) return
    prevKey.current = key
    if (positions.length === 1) {
      map.setView(positions[0], 8)
    } else {
      map.fitBounds(L.latLngBounds(positions), { padding: [48, 48], maxZoom: 8 })
    }
  }, [key, map, positions])

  return null
}

interface Props {
  trip: Trip
}

export default function TripMap({ trip }: Props) {
  const updateSegment = useTripStore((s) => s.updateSegment)
  const setOriginCity = useTripStore((s) => s.setOriginCity)
  const activeSegmentId = useUIStore((s) => s.activeSegmentId)
  const setActiveSegment = useUIStore((s) => s.setActiveSegment)
  const geocodingRef = useRef<Set<string>>(new Set())

  // Auto-geocode segments that have no coordinates yet
  useEffect(() => {
    const pending = trip.segments.filter(
      (s) => s.lat === undefined && !geocodingRef.current.has(s.id)
    )
    if (pending.length === 0) return

    pending.forEach((s) => geocodingRef.current.add(s.id))

    let cancelled = false
    const run = async () => {
      for (const segment of pending) {
        if (cancelled) break
        const coords = await geocodeCity(segment.city, segment.country)
        if (coords && !cancelled) {
          updateSegment(trip.id, segment.id, coords)
        }
        await sleep(1100)
      }
    }
    run()
    return () => {
      cancelled = true
      pending.forEach((s) => geocodingRef.current.delete(s.id))
    }
  }, [trip.segments, trip.id, updateSegment])

  // Auto-geocode origin city if it has no coordinates
  useEffect(() => {
    if (!trip.originCity || trip.originLat !== undefined) return
    const key = `origin:${trip.id}`
    if (geocodingRef.current.has(key)) return
    geocodingRef.current.add(key)
    let cancelled = false
    geocodeCity(trip.originCity, trip.originCountry ?? '').then((coords) => {
      if (coords && !cancelled) {
        setOriginCity(trip.id, trip.originCity!, trip.originCountry, coords.lat, coords.lng)
      }
    })
    return () => {
      cancelled = true
      geocodingRef.current.delete(key)
    }
  }, [trip.originCity, trip.originCountry, trip.originLat, trip.id, setOriginCity])

  const geocoded = trip.segments.filter(
    (s): s is typeof s & { lat: number; lng: number } =>
      s.lat !== undefined && s.lng !== undefined
  )

  const hasOrigin = trip.originLat !== undefined && trip.originLng !== undefined
  const originPos = hasOrigin ? [trip.originLat!, trip.originLng!] as [number, number] : null

  const segmentPositions = geocoded.map((s) => [s.lat, s.lng] as [number, number])
  const positions = originPos ? [originPos, ...segmentPositions] : segmentPositions

  return (
    <div style={{ width: '40%', borderRight: '1px solid var(--border)', isolation: 'isolate' }}>
      <MapContainer
        center={[20, 100]}
        zoom={3}
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        {positions.length > 0 && (
          <Polyline
            positions={positions}
            pathOptions={{ color: '#e8ff47', weight: 1.5, opacity: 0.6, dashArray: '6 4' }}
          />
        )}

        {originPos && trip.originCity && (
          <Marker
            position={originPos}
            icon={cityIcon(trip.originCity, false)}
          />
        )}

        {geocoded.map((segment) => (
          <Marker
            key={segment.id}
            position={[segment.lat, segment.lng]}
            icon={cityIcon(segment.city, segment.id === activeSegmentId)}
            eventHandlers={{
              click: () => setActiveSegment(
                segment.id === activeSegmentId ? null : segment.id
              ),
            }}
          />
        ))}

        <AutoFit positions={positions} />
      </MapContainer>
    </div>
  )
}
