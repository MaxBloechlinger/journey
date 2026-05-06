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

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export async function sendMessage(
  messages: ChatMessage[],
  trip: Trip,
  apiKey: string | undefined,
  onChunk: (text: string) => void
): Promise<void> {
  const systemPrompt = buildSystemPrompt(trip)

  if (import.meta.env.DEV && apiKey) {
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
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
    body: JSON.stringify({ messages, systemPrompt }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onChunk(decoder.decode(value, { stream: true }))
  }
}
