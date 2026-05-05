import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string
  onChange: (iso: string) => void
  min?: string
  placeholder?: string
}

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa']

// Shared cursor: last month/year any picker navigated to or selected a date in.
// Persists across opens so you don't re-navigate from today on every picker.
const cursor = { year: new Date().getFullYear(), month: new Date().getMonth() }

export default function DatePicker({ value, onChange, min, placeholder = 'Select date' }: Props) {
  const parsed = value ? new Date(value + 'T00:00:00') : null
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState((parsed ?? { getFullYear: () => cursor.year }).getFullYear())
  const [viewMonth, setViewMonth] = useState((parsed ?? { getMonth: () => cursor.month }).getMonth())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00')
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [value])

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const prevMonth = () => {
    const m = viewMonth === 0 ? 11 : viewMonth - 1
    const y = viewMonth === 0 ? viewYear - 1 : viewYear
    setViewMonth(m); setViewYear(y)
    cursor.month = m; cursor.year = y
  }
  const nextMonth = () => {
    const m = viewMonth === 11 ? 0 : viewMonth + 1
    const y = viewMonth === 11 ? viewYear + 1 : viewYear
    setViewMonth(m); setViewYear(y)
    cursor.month = m; cursor.year = y
  }

  const toIso = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const isDisabled = (day: number) => !!min && toIso(day) < min
  const isSelected = (day: number) => toIso(day) === value

  const selectDay = (day: number) => {
    cursor.month = viewMonth; cursor.year = viewYear
    onChange(toIso(day))
    setOpen(false)
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const displayValue = parsed
    ? parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : placeholder

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 text-left text-sm"
        style={{
          background: 'var(--bg-surface)',
          border: `1px solid ${open ? 'var(--border-strong)' : 'var(--border)'}`,
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
          fontSize: 12,
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {displayValue}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 20,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderTop: 'none',
            padding: '10px 12px 12px',
          }}
        >
          {/* Month / year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px 8px', fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: 1 }}
            >
              ‹
            </button>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.12em', color: 'var(--accent)' }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px 8px', fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: 1 }}
            >
              ›
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {DAY_HEADERS.map((d) => (
              <div
                key={d}
                style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.08em', color: 'var(--text-muted)', paddingBottom: 4 }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((day, i) =>
              day === null ? (
                <div key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  disabled={isDisabled(day)}
                  onClick={() => selectDay(day)}
                  style={{
                    textAlign: 'center',
                    padding: '5px 0',
                    fontFamily: 'var(--font-display)',
                    fontSize: 11,
                    background: isSelected(day) ? 'var(--accent)' : 'transparent',
                    color: isSelected(day) ? '#0a0a0a' : 'var(--text-primary)',
                    border: 'none',
                    cursor: isDisabled(day) ? 'default' : 'pointer',
                    opacity: isDisabled(day) ? 0.25 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected(day) && !isDisabled(day))
                      e.currentTarget.style.background = 'var(--bg-surface)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected(day))
                      e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {day}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
