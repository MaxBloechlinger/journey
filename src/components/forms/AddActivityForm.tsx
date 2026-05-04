import { useState } from 'react'
import { useTripStore } from '../../store/tripStore'

interface Props {
  tripId: string
  segmentId: string
  onClose: () => void
}

const inputStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
  colorScheme: 'dark' as const,
}

const labelStyle = {
  fontFamily: 'var(--font-display)',
  color: 'var(--text-secondary)',
  fontSize: 11,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
}

export default function AddActivityForm({ tripId, segmentId, onClose }: Props) {
  const addActivity = useTripStore((s) => s.addActivity)

  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [date, setDate] = useState('')

  const valid = name.trim() && cost

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    addActivity(tripId, segmentId, {
      name: name.trim(),
      cost: parseFloat(cost),
      date: date || undefined,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm p-8"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          ADD ACTIVITY
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>Activity</label>
            <input
              autoFocus
              type="text"
              placeholder="Grand Palace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-sm outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <label style={labelStyle}>Cost</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="15"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={{ ...inputStyle, fontFamily: 'var(--font-display)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <label style={labelStyle}>Date (optional)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!valid}
              className="flex-1 py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-30"
              style={{ background: 'var(--accent)', color: '#0a0a0a', fontFamily: 'var(--font-display)' }}
            >
              Add Activity
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm uppercase tracking-widest"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
