import Anthropic from '@anthropic-ai/sdk'
import type { Trip } from '../types/trip'
import { budgetSummary, nights, accommodationCost, activityCost } from './budget'

export function buildSystemPrompt(trip: Trip): string {
  const summary = budgetSummary(trip)
  const currency = trip.currency

  const segmentLines = trip.segments.map((s, i) => {
    const n = nights(s)
    const acc = s.accommodation
    const accLine = acc
      ? `  Accommodation: ${acc.name} (${acc.type}) — ${currency} ${acc.costPerNight}/night × ${n} nights = ${currency} ${accommodationCost(s).toLocaleString()}`
      : '  Accommodation: none'
    const actLines = s.activities.length
      ? s.activities.map((a) => `    - ${a.name}: ${currency} ${a.cost.toLocaleString()}`).join('\n')
      : '    (none)'
    const t = s.transitToNext
    const transit = t
      ? `  Transit to next city: ${t.type} — ${currency} ${t.cost.toLocaleString()}${t.durationMinutes ? ` (${Math.floor(t.durationMinutes / 60)}h${t.durationMinutes % 60 > 0 ? ` ${t.durationMinutes % 60}m` : ''})` : ''}`
      : ''

    return [
      `City ${i + 1}: ${s.city}, ${s.country}`,
      `  Dates: ${s.arrivalDate} → ${s.departureDate} (${n} ${n === 1 ? 'night' : 'nights'})`,
      accLine,
      `  Activities (${currency} ${activityCost(s).toLocaleString()} total):`,
      actLines,
      transit,
    ]
      .filter(Boolean)
      .join('\n')
  })

  const outbound = trip.transitToFirst
    ? `Outbound flight (${trip.originCity ?? 'home'} → ${trip.segments[0]?.city ?? '?'}): ${currency} ${trip.transitToFirst.cost.toLocaleString()}`
    : ''
  const returnFlight = trip.transitFromLast
    ? `Return flight (${trip.segments[trip.segments.length - 1]?.city ?? '?'} → ${trip.transitFromLast.toCity}): ${currency} ${trip.transitFromLast.cost.toLocaleString()}`
    : ''

  return [
    `You are a travel planning assistant helping with the trip "${trip.name}".`,
    '',
    '## Trip Summary',
    `Budget: ${currency} ${trip.totalBudget.toLocaleString()}`,
    `Spent: ${currency} ${summary.totalCost.toLocaleString()} (${summary.isOverBudget ? 'OVER BUDGET by ' + currency + ' ' + Math.abs(summary.budgetRemaining).toLocaleString() : currency + ' ' + summary.budgetRemaining.toLocaleString() + ' remaining'})`,
    `  Flights: ${currency} ${summary.totalFlightCost.toLocaleString()}`,
    `  Accommodation: ${currency} ${summary.totalAccommodationCost.toLocaleString()}`,
    `  Activities: ${currency} ${summary.totalActivityCost.toLocaleString()}`,
    '',
    '## Itinerary',
    outbound,
    ...segmentLines,
    returnFlight,
    '',
    'Answer questions about this trip concisely. Be direct and practical. Use the currency and exact numbers from the trip data above.',
  ]
    .filter((l) => l !== undefined)
    .join('\n')
}

export function buildPlannerSystemPrompt(): string {
  return `You are a travel planning assistant. Your job is to help the user plan a new trip from scratch.

Ask short clarifying questions until you know:
- Home city and country
- Which cities/countries to visit (and rough order)
- Approximate travel dates or total duration
- Total budget and preferred currency
- Travel style (budget/mid-range/comfortable)

Once you have enough information, write a brief friendly summary, then output a trip draft using EXACTLY this format at the end of your message:

\`\`\`trip-json
{
  "name": "Trip Name",
  "totalBudget": 3000,
  "currency": "EUR",
  "originCity": "Zurich",
  "originCountry": "Switzerland",
  "transitToFirst": {
    "type": "Flight",
    "fromCity": "Zurich",
    "toCity": "Bangkok",
    "departureDate": "2026-09-01",
    "arrivalDate": "2026-09-01",
    "cost": 420,
    "airline": "Swiss"
  },
  "segments": [
    {
      "city": "Bangkok",
      "country": "Thailand",
      "arrivalDate": "2026-09-01",
      "departureDate": "2026-09-07",
      "accommodation": {
        "name": "Example Hostel",
        "type": "Hostel",
        "costPerNight": 20
      },
      "activities": [
        { "name": "Grand Palace", "cost": 15 }
      ],
      "transitToNext": {
        "type": "Flight",
        "fromCity": "Bangkok",
        "toCity": "Tokyo",
        "departureDate": "2026-09-07",
        "arrivalDate": "2026-09-07",
        "cost": 280,
        "airline": "Thai Airways"
      }
    }
  ]
}
\`\`\`

Rules for the JSON:
- Use realistic cost estimates in the requested currency
- Only include "transitToNext" on segments that have a following segment
- Omit "transitToFirst" if the origin city is unknown
- accommodation type must be one of: Hotel, Airbnb, Hostel, Guesthouse, Other
- transit type must be one of: Flight, Train, Bus, Ferry, Other
- dates must be YYYY-MM-DD format
- Keep it to the actual cities discussed — don't add extras`
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export async function sendMessage(
  messages: ChatMessage[],
  systemPrompt: string,
  apiKey: string | undefined,
  onChunk: (text: string) => void,
  maxTokens = 1024
): Promise<void> {
  if (import.meta.env.DEV && apiKey) {
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    })
    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        onChunk(event.delta.text)
      }
    }
    return
  }

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt, maxTokens }),
  })

  if (res.status === 429) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Rate limit reached — try again in an hour.')
  }
  if (!res.ok) throw new Error(`API error ${res.status}`)

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}
