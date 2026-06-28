const ITEMS = [
  'PLAN YOUR JOURNEY',
  'MULTI-CITY ITINERARIES',
  'LIVE BUDGET TRACKING',
  'DRAG-TO-REORDER',
  'INTERACTIVE ROUTE MAP',
  'AI TRIP ASSISTANT',
  'BUILT WITH REACT + TYPESCRIPT',
]

function TickerContent() {
  return (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center">
          <span
            className="px-6 text-sm font-bold uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: '#0a0a0a' }}
          >
            {item}
          </span>
          <span style={{ color: '#0a0a0a', fontSize: 14 }}>★</span>
        </span>
      ))}
    </div>
  )
}

export default function Ticker() {
  return (
    <div
      className="overflow-hidden border-b py-2.5"
      style={{ background: 'var(--accent)', borderColor: 'var(--border)' }}
    >
      <div
        className="flex w-max"
        style={{ animation: 'ticker-scroll 22s linear infinite' }}
      >
        <TickerContent />
        <TickerContent />
      </div>
    </div>
  )
}