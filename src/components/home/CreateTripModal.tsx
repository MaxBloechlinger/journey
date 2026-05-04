import { useState } from 'react'
import type { Currency } from '../../types/trip'
import { useTripStore } from '../../store/tripStore'

const CURRENCIES: Currency[] = ['EUR', 'CHF', 'USD', 'GBP', 'JPY', 'THB', 'KRW']

interface Props {
  onClose: () => void
}

export default function CreateTripModal({ onClose }: Props) {
  const createTrip = useTripStore((s) => s.createTrip)
  const setActiveTrip = useTripStore((s) => s.setActiveTrip)

  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState<Currency>('EUR')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !budget) return
    createTrip(name.trim(), parseFloat(budget), currency)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-8"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="mb-6 text-xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          NEW TRIP
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
            >
              Trip Name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Thailand → Japan → Korea"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-sm outline-none"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <label
                className="text-xs uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
              >
                Total Budget
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="3000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-xs uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
              >
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="px-4 py-3 text-sm outline-none"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!name.trim() || !budget}
              className="flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-opacity disabled:opacity-30"
              style={{
                background: 'var(--accent)',
                color: '#0a0a0a',
                fontFamily: 'var(--font-display)',
              }}
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm uppercase tracking-widest"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
