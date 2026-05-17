import Anthropic from '@anthropic-ai/sdk'

// In-memory rate limiter — resets on cold start, good enough for a portfolio app.
// Swap for Vercel KV if you need persistence across instances.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 15
const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_TOKENS_CAP = 2048

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= LIMIT) return false
  entry.count++
  return true
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    req.socket?.remoteAddress ??
    'unknown'

  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Rate limit reached — try again in an hour.' })
    return
  }

  const { messages, systemPrompt, maxTokens = 1024 } = req.body
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: Math.min(Number(maxTokens), MAX_TOKENS_CAP),
    system: systemPrompt,
    messages,
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      res.write(event.delta.text)
    }
  }

  res.end()
}
