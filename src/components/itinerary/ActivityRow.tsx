import { X } from 'lucide-react'
import type { Activity } from '../../types/trip'
import { useTripStore } from '../../store/tripStore'
import { formatShortDate } from '../../utils/dates'

interface Props {
  tripId: string
  segmentId: string
  activity: Activity
  currency: string
}

export default function ActivityRow({ tripId, segmentId, activity, currency }: Props) {
  const deleteActivity = useTripStore((s) => s.deleteActivity)

  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="truncate text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
          {activity.name}
        </span>
        {activity.date && (
          <span className="shrink-0 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
            {formatShortDate(activity.date)}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          {currency} {activity.cost.toLocaleString()}
        </span>
        <button
          onClick={() => deleteActivity(tripId, segmentId, activity.id)}
          className="p-1 hover:opacity-60"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Delete activity"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
