const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 15
const WINDOW_MS = 60 * 60 * 1000
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

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' })
    return
  }

  const { messages, systemPrompt, maxTokens = 1024 } = req.body

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: Math.min(Number(maxTokens), MAX_TOKENS_CAP),
        stream: true,
      }),
    })

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => null)
      res.status(groqRes.status).json({ error: (err as any)?.error?.message ?? 'Groq API error' })
      return
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')

    const reader = groqRes.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          const text = JSON.parse(data).choices?.[0]?.delta?.content
          if (text) res.write(text)
        } catch { /* skip malformed chunks */ }
      }
    }

    res.end()
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message ?? 'Server error' })
    } else {
      res.end()
    }
  }
}
