import { useState, useRef, useEffect, useMemo } from 'react'
import { useTripStore } from '../../store/tripStore'
import { POPULAR_DESTINATIONS } from '../../utils/destinations'

export interface DestOption {
  city: string
  country: string
  lat?: number
  lng?: number
}

interface Props {
  value: string
  onChange: (city: string) => void
  onSelect: (dest: DestOption) => void
  placeholder?: string
  autoFocus?: boolean
}

export default function DestinationInput({ value, onChange, onSelect, placeholder = 'Search city…', autoFocus }: Props) {
  const trips = useTripStore((s) => s.trips)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const history = useMemo<DestOption[]>(() => {
    const seen = new Set<string>()
    const result: DestOption[] = []
    for (const trip of trips) {
      for (const seg of trip.segments) {
        const key = `${seg.city.toLowerCase()}|${seg.country.toLowerCase()}`
        if (!seen.has(key)) {
          seen.add(key)
          result.push({ city: seg.city, country: seg.country, lat: seg.lat, lng: seg.lng })
        }
      }
    }
    return result
  }, [trips])

  const suggestions = useMemo(() => {
    const q = value.toLowerCase().trim()
    const matches = (d: DestOption) =>
      d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
    const histMatches = history.filter(matches)
    const histKeys = new Set(histMatches.map((d) => `${d.city.toLowerCase()}|${d.country.toLowerCase()}`))
    const popMatches = POPULAR_DESTINATIONS.filter(
      (d) => matches(d) && !histKeys.has(`${d.city.toLowerCase()}|${d.country.toLowerCase()}`)
    )
    return { history: histMatches.slice(0, 5), popular: popMatches.slice(0, 4) }
  }, [value, history])

  const hasSuggestions = suggestions.history.length > 0 || suggestions.popular.length > 0

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        autoFocus={autoFocus}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        className="w-full px-4 py-3 text-sm outline-none"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
        }}
      />
      {showSuggestions && hasSuggestions && (
        <div
          className="absolute left-0 right-0 z-10 max-h-60 overflow-y-auto"
          style={{
            top: '100%',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderTop: 'none',
          }}
        >
          {suggestions.history.length > 0 && (
            <>
              <div style={{ padding: '6px 16px 3px', fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Recent
              </div>
              {suggestions.history.map((d) => (
                <button
                  key={`h-${d.city}|${d.country}`}
                  type="button"
                  onMouseDown={() => onSelect(d)}
                  className="w-full px-4 py-2 text-left text-sm"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {d.city} <span style={{ color: 'var(--text-muted)' }}>· {d.country}</span>
                </button>
              ))}
            </>
          )}
          {suggestions.popular.length > 0 && (
            <>
              <div style={{
                padding: '6px 16px 3px',
                fontFamily: 'var(--font-display)',
                fontSize: 9,
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                borderTop: suggestions.history.length > 0 ? '1px solid var(--border)' : 'none',
              }}>
                Popular
              </div>
              {suggestions.popular.map((d) => (
                <button
                  key={`p-${d.city}|${d.country}`}
                  type="button"
                  onMouseDown={() => onSelect(d)}
                  className="w-full px-4 py-2 text-left text-sm"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {d.city} <span style={{ color: 'var(--text-muted)' }}>· {d.country}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
